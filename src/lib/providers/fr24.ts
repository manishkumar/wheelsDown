import type { Airport, FlightData, FlightPhase } from "../types";
import type { FlightDataProvider, FlightQuery } from "./types";

/**
 * Flightradar24 API provider — https://fr24api.flightradar24.com
 *
 * Requires FR24_API_TOKEN (any paid tier; the $9/mo Explorer tier is enough
 * for personal use — roughly 100–200 tracked flights per month at a 5-minute
 * poll interval).
 *
 * Strategy, per request:
 *  1. Flight summary for the flight number on the service date
 *     → resolves the physical aircraft (registration / tail number)
 *  2. Flight summary for that registration
 *     → finds the *previous* leg (the inbound flight) and how late it ran
 *  3. Live position for the registration
 *     → where the aircraft actually is right now
 *
 * Response shapes below follow the published v1 docs
 * (https://fr24api.flightradar24.com/docs). Field availability varies by
 * subscription tier — verify against your own key before trusting output.
 */

const BASE_URL = "https://fr24api.flightradar24.com/api";

/** Minimal IANA timezone lookup for rendered airports. Extend as needed. */
const AIRPORT_TZ: Record<string, string> = {
  DEL: "Asia/Kolkata", BOM: "Asia/Kolkata", BLR: "Asia/Kolkata",
  MAA: "Asia/Kolkata", HYD: "Asia/Kolkata", CCU: "Asia/Kolkata",
  COK: "Asia/Kolkata", AMD: "Asia/Kolkata", PNQ: "Asia/Kolkata",
  GOI: "Asia/Kolkata", DXB: "Asia/Dubai", SIN: "Asia/Singapore",
  LHR: "Europe/London", JFK: "America/New_York",
};

interface Fr24FlightSummary {
  fr24_id: string;
  flight: string;
  reg: string;
  orig_iata: string;
  dest_iata: string;
  datetime_takeoff: string | null;
  datetime_landed: string | null;
  flight_time_scheduled?: { departure: string; arrival: string };
  flight_time_estimated?: { arrival: string | null };
}

interface Fr24LivePosition {
  fr24_id: string;
  lat: number;
  lon: number;
  alt: number;
  gspeed: number;
  track: number;
  eta: string | null;
}

export class Fr24Provider implements FlightDataProvider {
  readonly id = "fr24";
  readonly isLive = true;

  constructor(private readonly token = process.env.FR24_API_TOKEN) {
    if (!this.token) {
      throw new Error(
        "Fr24Provider needs FR24_API_TOKEN. Get a key at https://fr24api.flightradar24.com or run with FLIGHT_PROVIDER=mock."
      );
    }
  }

  private async get<T>(path: string, params: Record<string, string>): Promise<T> {
    const url = `${BASE_URL}${path}?${new URLSearchParams(params)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Accept-Version": "v1",
      },
      // Positions go stale fast; never let Next.js cache them.
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`FR24 ${path} responded ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<T>;
  }

  async getFlight(query: FlightQuery): Promise<FlightData | null> {
    const flightNumber = query.flightNumber.toUpperCase().replace(/[\s-]/g, "");

    // 1. Which physical aircraft flies this flight number today?
    const { data: legs = [] } = await this.get<{ data: Fr24FlightSummary[] }>(
      "/flight-summary/full",
      {
        flights: flightNumber,
        flight_datetime_from: `${query.date}T00:00:00Z`,
        flight_datetime_to: `${query.date}T23:59:59Z`,
      }
    );
    const leg = legs[0];
    if (!leg?.reg) return null;

    // 2. The same aircraft's rotation today — its previous landing is our inbound leg.
    const { data: rotation = [] } = await this.get<{ data: Fr24FlightSummary[] }>(
      "/flight-summary/full",
      {
        registrations: leg.reg,
        flight_datetime_from: `${query.date}T00:00:00Z`,
        flight_datetime_to: `${query.date}T23:59:59Z`,
      }
    );
    const inboundLeg = rotation
      .filter((r) => r.fr24_id !== leg.fr24_id && r.dest_iata === leg.orig_iata)
      .at(-1);

    // 3. Where is the aircraft right now?
    const { data: positions = [] } = await this.get<{ data: Fr24LivePosition[] }>(
      "/live/flight-positions/full",
      { registrations: leg.reg }
    );
    const live = positions[0];

    return this.toFlightData(query, leg, inboundLeg, live);
  }

  private toFlightData(
    query: FlightQuery,
    leg: Fr24FlightSummary,
    inboundLeg: Fr24FlightSummary | undefined,
    live: Fr24LivePosition | undefined
  ): FlightData {
    const scheduledArrival = leg.flight_time_scheduled?.arrival ?? "";
    const estimatedArrival =
      live?.eta ?? leg.flight_time_estimated?.arrival ?? scheduledArrival;

    const delayMinutes =
      scheduledArrival && estimatedArrival
        ? Math.round(
            (Date.parse(estimatedArrival) - Date.parse(scheduledArrival)) / 60_000
          )
        : inboundDelayMinutes(inboundLeg);

    const phase = derivePhase(leg, live);

    return {
      flightNumber: query.flightNumber.toUpperCase(),
      airline: leg.flight.slice(0, 2),
      origin: airport(leg.orig_iata),
      destination: airport(leg.dest_iata),
      scheduledDeparture: leg.flight_time_scheduled?.departure ?? "",
      scheduledArrival,
      estimatedArrival,
      tailNumber: leg.reg,
      inbound: {
        tailNumber: leg.reg,
        currentLocation: live
          ? `At ${live.lat.toFixed(2)}, ${live.lon.toFixed(2)} — FL${Math.round(live.alt / 100)}`
          : inboundLeg
            ? `Inbound leg from ${inboundLeg.orig_iata}`
            : "Position unavailable",
        latitude: live?.lat ?? 0,
        longitude: live?.lon ?? 0,
        altitude: live?.alt ?? 0,
        speed: live?.gspeed ?? 0,
        heading: live?.track ?? 0,
        distanceToDestKm: 0,
        delayMinutes: inboundDelayMinutes(inboundLeg),
        phase: live ? "en-route" : "scheduled",
      },
      status:
        delayMinutes <= 10
          ? "on-time"
          : delayMinutes <= 30
            ? "delayed"
            : "significantly-delayed",
      delayMinutes,
      phase,
      date: query.date,
      dataSource: "live",
    };
  }
}

function airport(iata: string): Airport {
  return { code: iata, city: iata, timezone: AIRPORT_TZ[iata] ?? "UTC" };
}

function inboundDelayMinutes(inboundLeg: Fr24FlightSummary | undefined): number {
  if (!inboundLeg?.datetime_landed || !inboundLeg.flight_time_scheduled?.arrival) {
    return 0;
  }
  return Math.max(
    0,
    Math.round(
      (Date.parse(inboundLeg.datetime_landed) -
        Date.parse(inboundLeg.flight_time_scheduled.arrival)) /
        60_000
    )
  );
}

function derivePhase(
  leg: Fr24FlightSummary,
  live: Fr24LivePosition | undefined
): FlightPhase {
  if (leg.datetime_landed) return "landed";
  if (!leg.datetime_takeoff) return "scheduled";
  if (!live) return "en-route";
  if (live.alt < 10_000) return "final-approach";
  if (live.alt < 25_000) return "descending";
  return "en-route";
}
