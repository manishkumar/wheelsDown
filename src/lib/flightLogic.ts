import type { FlightData, FlightStatus } from "./mockData";

export interface DelayVerdict {
  status: FlightStatus;
  emoji: string;
  headline: string;
  detail: string;
  color: string; // tailwind color class
}

export function getDelayVerdict(flight: FlightData): DelayVerdict {
  if (flight.status === "cancelled") {
    return {
      status: "cancelled",
      emoji: "\u{1F534}",
      headline: "Flight Cancelled",
      detail: `${flight.inbound.currentLocation}. Contact ${flight.airline} for rebooking options.`,
      color: "text-red-400",
    };
  }

  if (flight.delayMinutes <= 10) {
    return {
      status: "on-time",
      emoji: "\u{1F7E2}",
      headline: "Looks on time \u2014 safe to leave as planned",
      detail:
        flight.inbound.phase === "scheduled"
          ? `Inbound aircraft ${flight.inbound.tailNumber} is at gate, ready for your flight.`
          : `Inbound aircraft ${flight.inbound.tailNumber} is on schedule. No delays expected.`,
      color: "text-emerald-400",
    };
  }

  if (flight.delayMinutes <= 30) {
    return {
      status: "delayed",
      emoji: "\u{1F7E1}",
      headline: `Inbound aircraft is ${flight.delayMinutes} mins behind \u2014 expect a delay`,
      detail: `Aircraft ${flight.inbound.tailNumber} is currently ${flight.inbound.currentLocation.toLowerCase()}. Your departure may be pushed back.`,
      color: "text-amber-400",
    };
  }

  return {
    status: "significantly-delayed",
    emoji: "\u{1F534}",
    headline: `Inbound aircraft significantly delayed \u2014 consider leaving later`,
    detail: `Aircraft ${flight.inbound.tailNumber} is running ${flight.delayMinutes} minutes behind schedule. Currently ${flight.inbound.currentLocation.toLowerCase()}.`,
    color: "text-red-400",
  };
}

export interface PickupInfo {
  landingInMinutes: number;
  leaveInMinutes: number | null; // null if travelTime not set
  statusMessage: string;
  phase: string;
  shouldLeaveNow: boolean;
  hasLanded: boolean;
}

export function getPickupInfo(
  flight: FlightData,
  travelTimeMinutes: number | null
): PickupInfo {
  const buffer = 15; // minutes buffer after landing

  if (flight.status === "cancelled") {
    return {
      landingInMinutes: -1,
      leaveInMinutes: null,
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
      statusMessage:
        "Flight has landed \u2014 head to arrivals!",
      phase: "landed",
      shouldLeaveNow: true,
      hasLanded: true,
    };
  }

  // Parse estimated arrival to get minutes from now
  const now = new Date();
  const [hours, minutes] = flight.estimatedArrival.split(":").map(Number);
  const arrival = new Date();
  arrival.setHours(hours, minutes, 0, 0);

  // Handle next-day arrivals
  if (arrival < now) {
    arrival.setDate(arrival.getDate() + 1);
  }

  const landingInMinutes = Math.max(
    0,
    Math.round((arrival.getTime() - now.getTime()) / 60000)
  );

  let leaveInMinutes: number | null = null;
  let shouldLeaveNow = false;

  if (travelTimeMinutes !== null) {
    // leave time = landing time - travel time - buffer
    leaveInMinutes = Math.max(0, landingInMinutes - travelTimeMinutes - buffer);
    shouldLeaveNow = leaveInMinutes <= 0;
  }

  let statusMessage: string;
  let phase: string;

  if (flight.phase === "final-approach") {
    statusMessage = "Flight is on final approach";
    phase = "final-approach";
  } else if (flight.phase === "descending") {
    statusMessage = `Flight is descending \u2014 ${flight.inbound.currentLocation.toLowerCase()}`;
    phase = "descending";
  } else if (flight.phase === "en-route") {
    const delayNote =
      flight.delayMinutes > 10
        ? ` \u2014 delayed by ~${flight.delayMinutes} minutes`
        : "";
    statusMessage = `In flight \u2014 currently ${flight.inbound.currentLocation.toLowerCase()}${delayNote}`;
    phase = "en-route";
  } else if (flight.phase === "departed" || flight.phase === "taxiing") {
    statusMessage = "Flight has departed and is climbing";
    phase = "departed";
  } else if (flight.phase === "boarding") {
    statusMessage = "Flight is currently boarding";
    phase = "boarding";
  } else {
    statusMessage =
      flight.delayMinutes > 0
        ? `Flight is delayed by ~${flight.delayMinutes} minutes \u2014 no need to rush`
        : "Flight is scheduled \u2014 not yet departed";
    phase = "scheduled";
  }

  return {
    landingInMinutes,
    leaveInMinutes,
    statusMessage,
    phase,
    shouldLeaveNow,
    hasLanded: false,
  };
}

export function formatMinutesAsCountdown(minutes: number): string {
  if (minutes <= 0) return "Now";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m} min`;
}

export function generateShareUrl(
  flightNumber: string,
  date: string
): string {
  const cleanFlight = flightNumber.replace(/\s+/g, "");
  return `/track/${encodeURIComponent(cleanFlight)}/${encodeURIComponent(date)}`;
}
