import type { FlightData, FlightStatus } from "./types";

/**
 * Pure domain logic: delay verdicts, pickup timing, and time formatting.
 * Everything here is side-effect free and takes `now` as an argument where
 * time matters, so it is all unit-testable (see __tests__/flightLogic.test.ts).
 */

/** Minutes of slack after landing before the passenger reaches arrivals. */
const ARRIVALS_BUFFER_MINUTES = 15;

/** Inbound delay below this is noise — turnarounds absorb it. */
const ON_TIME_THRESHOLD_MINUTES = 10;

/** Above this, the delay is unlikely to be made up in the air. */
const SIGNIFICANT_DELAY_THRESHOLD_MINUTES = 30;

// ─── Time helpers ────────────────────────────────────────────────────

export function minutesUntil(iso: string, now: Date): number {
  return Math.round((Date.parse(iso) - now.getTime()) / 60_000);
}

/**
 * Render an instant as "HH:mm" wall-clock time.
 *
 * Pass the airport's timezone for anything that should match the airport
 * (arrival boards). Omit `timeZone` for anything about the viewer's own
 * clock (the "leave by" time — the driver reads their local watch).
 */
export function formatTime(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...(timeZone ? { timeZone } : {}),
  }).format(new Date(iso));
}

export function formatMinutesAsCountdown(minutes: number): string {
  if (minutes <= 0) return "Now";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

// ─── Delay verdict ("I'm flying") ────────────────────────────────────

export interface DelayVerdict {
  status: FlightStatus;
  headline: string;
  detail: string;
}

export function getDelayVerdict(flight: FlightData): DelayVerdict {
  if (flight.status === "cancelled") {
    return {
      status: "cancelled",
      headline: "Flight cancelled",
      detail: `${flight.inbound.currentLocation}. Contact ${flight.airline} for rebooking options.`,
    };
  }

  if (flight.delayMinutes <= ON_TIME_THRESHOLD_MINUTES) {
    return {
      status: "on-time",
      headline: "Looks on time — safe to leave as planned",
      detail:
        flight.inbound.phase === "scheduled"
          ? `Inbound aircraft ${flight.inbound.tailNumber} is at the gate, ready for your flight.`
          : `Inbound aircraft ${flight.inbound.tailNumber} is on schedule. No delay signal.`,
    };
  }

  if (flight.delayMinutes <= SIGNIFICANT_DELAY_THRESHOLD_MINUTES) {
    return {
      status: "delayed",
      headline: `Inbound aircraft is ${flight.delayMinutes} min behind — expect a delay`,
      detail: `Aircraft ${flight.inbound.tailNumber} is currently ${flight.inbound.currentLocation.toLowerCase()}. Your departure may be pushed back.`,
    };
  }

  return {
    status: "significantly-delayed",
    headline: "Inbound aircraft significantly delayed — consider leaving later",
    detail: `Aircraft ${flight.inbound.tailNumber} is running ${flight.delayMinutes} minutes behind schedule. Currently ${flight.inbound.currentLocation.toLowerCase()}.`,
  };
}

// ─── Pickup timing ("Picking up") ────────────────────────────────────

export interface PickupInfo {
  /** Minutes until estimated touchdown; 0 once landed. */
  landingInMinutes: number;
  /** Minutes until the driver should leave; null until travel time is set. */
  leaveInMinutes: number | null;
  /** The leave-by instant as ISO, for display on the viewer's clock. */
  leaveBy: string | null;
  statusMessage: string;
  phase: string;
  shouldLeaveNow: boolean;
  hasLanded: boolean;
}

export function getPickupInfo(
  flight: FlightData,
  travelTimeMinutes: number | null,
  now: Date = new Date()
): PickupInfo {
  if (flight.status === "cancelled") {
    return {
      landingInMinutes: -1,
      leaveInMinutes: null,
      leaveBy: null,
      statusMessage:
        "This flight has been cancelled. Contact the airline for updates.",
      phase: "cancelled",
      shouldLeaveNow: false,
      hasLanded: false,
    };
  }

  if (flight.phase === "landed") {
    return {
      landingInMinutes: 0,
      leaveInMinutes: travelTimeMinutes !== null ? 0 : null,
      leaveBy: travelTimeMinutes !== null ? now.toISOString() : null,
      statusMessage: "Flight has landed — head to arrivals!",
      phase: "landed",
      shouldLeaveNow: true,
      hasLanded: true,
    };
  }

  const landingInMinutes = Math.max(
    0,
    minutesUntil(flight.estimatedArrival, now)
  );

  let leaveInMinutes: number | null = null;
  let leaveBy: string | null = null;
  let shouldLeaveNow = false;

  if (travelTimeMinutes !== null) {
    leaveInMinutes = Math.max(
      0,
      landingInMinutes - travelTimeMinutes - ARRIVALS_BUFFER_MINUTES
    );
    leaveBy = new Date(now.getTime() + leaveInMinutes * 60_000).toISOString();
    shouldLeaveNow = leaveInMinutes <= 0;
  }

  return {
    landingInMinutes,
    leaveInMinutes,
    leaveBy,
    statusMessage: statusMessageFor(flight),
    phase: flight.phase === "taxiing" ? "departed" : flight.phase,
    shouldLeaveNow,
    hasLanded: false,
  };
}

function statusMessageFor(flight: FlightData): string {
  switch (flight.phase) {
    case "final-approach":
      return "Flight is on final approach";
    case "descending":
      return `Flight is descending — ${flight.inbound.currentLocation.toLowerCase()}`;
    case "en-route":
      return flight.delayMinutes > ON_TIME_THRESHOLD_MINUTES
        ? `In flight — currently ${flight.inbound.currentLocation.toLowerCase()} — delayed by ~${flight.delayMinutes} minutes`
        : `In flight — currently ${flight.inbound.currentLocation.toLowerCase()}`;
    case "departed":
    case "taxiing":
      return "Flight has departed and is climbing";
    case "boarding":
      return "Flight is currently boarding";
    default:
      return flight.delayMinutes > 0
        ? `Flight is delayed by ~${flight.delayMinutes} minutes — no need to rush`
        : "Flight is scheduled — not yet departed";
  }
}

// ─── Sharing ─────────────────────────────────────────────────────────

export function generateShareUrl(flightNumber: string, date: string): string {
  const cleanFlight = flightNumber.replace(/\s+/g, "");
  return `/track/${encodeURIComponent(cleanFlight)}/${encodeURIComponent(date)}`;
}
