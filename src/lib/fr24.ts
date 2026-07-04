/**
 * FR24 API wrapper
 *
 * In production, this would call the FlightRadar24 API at fr24api.flightradar24.com
 * For development, we use mock data clearly labelled with DEMO MODE.
 *
 * API endpoints that would be used:
 * - GET /api/v1/flights?registration={tailNumber} — Live position tracking
 * - GET /api/v1/flights/history?flight={flightNumber} — Historical data for tail number resolution
 */

import {
  getMockFlight,
  getMockFlightForPickup,
  type FlightData,
} from "./mockData";

const USE_MOCK = true; // Set to false when FR24 API key is available

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FR24_BASE_URL = "https://fr24api.flightradar24.com/api/v1";

export async function lookupFlight(
  flightNumber: string,
  date: string
): Promise<FlightData | null> {
  if (USE_MOCK) {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    return getMockFlight(flightNumber, date);
  }

  // Production implementation would:
  // 1. Call FR24 historical endpoint to find tail number for this flight
  // 2. Call FR24 live position endpoint to track the aircraft
  // 3. Return combined data
  return null;
}

export async function lookupFlightForPickup(
  flightNumber: string,
  date: string
): Promise<FlightData | null> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return getMockFlightForPickup(flightNumber, date);
  }

  return null;
}

export async function getFlightTailNumber(
  flightNumber: string
): Promise<string | null> {
  if (USE_MOCK) {
    const data = getMockFlight(flightNumber, new Date().toISOString());
    return data?.tailNumber ?? null;
  }

  // Would call: GET /api/v1/flights/history?flight={flightNumber}
  // Parse response to extract registration/tail number
  return null;
}

export async function trackAircraft(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tailNumber: string
): Promise<FlightData | null> {
  if (USE_MOCK) {
    return null; // Not used in mock mode — data comes from lookupFlight
  }

  // Would call: GET /api/v1/flights?registration={tailNumber}
  // Return live position, altitude, speed, heading
  return null;
}

export function isDemoMode(): boolean {
  return USE_MOCK;
}
