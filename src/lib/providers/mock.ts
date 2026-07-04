import type { Airport, FlightData } from "../types";
import type { FlightDataProvider, FlightQuery } from "./types";

/**
 * Deterministic simulated flights so the whole product can be exercised —
 * and deployed — without an API key. Three scenarios, one per demo flight:
 *
 *  - 6E-456  the interesting case: inbound aircraft running 40 min late,
 *            airline hasn't updated the departure board yet
 *  - AI-302  the happy path: everything on time
 *  - UK-835  the bad day: cancelled, inbound grounded with a technical issue
 *
 * Timestamps are generated relative to "now" on every request so countdowns
 * always look live.
 */

const DEL: Airport = { code: "DEL", city: "New Delhi", timezone: "Asia/Kolkata" };
const BOM: Airport = { code: "BOM", city: "Mumbai", timezone: "Asia/Kolkata" };
const BLR: Airport = { code: "BLR", city: "Bengaluru", timezone: "Asia/Kolkata" };
const MAA: Airport = { code: "MAA", city: "Chennai", timezone: "Asia/Kolkata" };

function isoOffsetFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

type Factory = (date: string) => FlightData;

/** Snapshots taken before departure — what the delay checker persona sees. */
const preflightFlights: Record<string, Factory> = {
  "6E456": (date) => ({
    flightNumber: "6E-456",
    airline: "IndiGo",
    origin: DEL,
    destination: BOM,
    scheduledDeparture: isoOffsetFromNow(30),
    scheduledArrival: isoOffsetFromNow(150),
    estimatedArrival: isoOffsetFromNow(190),
    tailNumber: "VT-ITC",
    inbound: {
      tailNumber: "VT-ITC",
      currentLocation: "Over Jaipur, descending through FL280",
      latitude: 26.9124,
      longitude: 75.7873,
      altitude: 28000,
      speed: 420,
      heading: 135,
      distanceToDestKm: 340,
      delayMinutes: 40,
      phase: "en-route",
    },
    status: "delayed",
    delayMinutes: 40,
    phase: "scheduled",
    date,
    dataSource: "demo",
  }),

  AI302: (date) => ({
    flightNumber: "AI-302",
    airline: "Air India",
    origin: DEL,
    destination: BLR,
    scheduledDeparture: isoOffsetFromNow(45),
    scheduledArrival: isoOffsetFromNow(195),
    estimatedArrival: isoOffsetFromNow(198),
    tailNumber: "VT-EXK",
    inbound: {
      tailNumber: "VT-EXK",
      currentLocation: "Parked at Gate 42, DEL Terminal 3",
      latitude: 28.5562,
      longitude: 77.1,
      altitude: 0,
      speed: 0,
      heading: 0,
      distanceToDestKm: 0,
      delayMinutes: 0,
      phase: "scheduled",
    },
    status: "on-time",
    delayMinutes: 0,
    phase: "scheduled",
    date,
    dataSource: "demo",
  }),

  UK835: (date) => ({
    flightNumber: "UK-835",
    airline: "Vistara",
    origin: DEL,
    destination: MAA,
    scheduledDeparture: isoOffsetFromNow(60),
    scheduledArrival: isoOffsetFromNow(210),
    estimatedArrival: isoOffsetFromNow(210),
    tailNumber: "VT-TNB",
    inbound: {
      tailNumber: "VT-TNB",
      currentLocation: "Aircraft grounded at HYD due to technical issue",
      latitude: 17.2403,
      longitude: 78.4294,
      altitude: 0,
      speed: 0,
      heading: 0,
      distanceToDestKm: 0,
      delayMinutes: -1,
      phase: "cancelled",
    },
    status: "cancelled",
    delayMinutes: -1,
    phase: "cancelled",
    date,
    dataSource: "demo",
  }),
};

/** Snapshots taken mid-flight — what the pickup persona sees. */
const inflightFlights: Record<string, Factory> = {
  "6E456": (date) => ({
    ...preflightFlights["6E456"](date),
    scheduledDeparture: isoOffsetFromNow(-90),
    scheduledArrival: isoOffsetFromNow(47),
    estimatedArrival: isoOffsetFromNow(87),
    inbound: {
      tailNumber: "VT-ITC",
      currentLocation: "Over Nagpur, cruising at FL350",
      latitude: 21.1458,
      longitude: 79.0882,
      altitude: 35000,
      speed: 460,
      heading: 225,
      distanceToDestKm: 680,
      delayMinutes: 40,
      phase: "en-route",
    },
    phase: "en-route",
  }),

  AI302: (date) => ({
    ...preflightFlights["AI302"](date),
    scheduledDeparture: isoOffsetFromNow(-120),
    scheduledArrival: isoOffsetFromNow(32),
    estimatedArrival: isoOffsetFromNow(35),
    inbound: {
      tailNumber: "VT-EXK",
      currentLocation: "Approaching Bengaluru, descending through FL180",
      latitude: 13.8,
      longitude: 77.5,
      altitude: 18000,
      speed: 320,
      heading: 180,
      distanceToDestKm: 85,
      delayMinutes: 3,
      phase: "descending",
    },
    delayMinutes: 3,
    phase: "descending",
  }),

  UK835: (date) => preflightFlights["UK835"](date),
};

const SIMULATED_LATENCY_MS = 500;

export class MockProvider implements FlightDataProvider {
  readonly id = "mock";
  readonly isLive = false;

  async getFlight(query: FlightQuery): Promise<FlightData | null> {
    await new Promise((r) => setTimeout(r, SIMULATED_LATENCY_MS));
    const key = query.flightNumber.toUpperCase().replace(/[\s-]/g, "");
    const table =
      query.scenario === "pickup" ? inflightFlights : preflightFlights;
    return table[key]?.(query.date) ?? null;
  }
}
