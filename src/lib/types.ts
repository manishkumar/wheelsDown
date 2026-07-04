/**
 * Core domain types shared by every data provider and the UI.
 *
 * All times are ISO 8601 strings with explicit offset (or UTC "Z").
 * They represent absolute instants; rendering into a wall-clock time is
 * always done through the formatters in `flightLogic.ts`, either in an
 * airport's timezone (arrival boards) or the viewer's timezone (leave-by
 * times). Never store or parse bare "HH:mm" strings — they break the
 * moment a viewer is in a different timezone than the airport.
 */

export interface Airport {
  /** IATA code, e.g. "BOM" */
  code: string;
  city: string;
  /** IANA timezone, e.g. "Asia/Kolkata" */
  timezone: string;
}

export type FlightPhase =
  | "scheduled"
  | "boarding"
  | "taxiing"
  | "departed"
  | "en-route"
  | "descending"
  | "final-approach"
  | "landed"
  | "cancelled";

export type FlightStatus =
  | "on-time"
  | "delayed"
  | "significantly-delayed"
  | "cancelled";

export interface InboundAircraft {
  /** Registration of the physical aircraft, e.g. "VT-ITC" */
  tailNumber: string;
  /** Human-readable position summary, e.g. "Over Jaipur, descending through FL280" */
  currentLocation: string;
  latitude: number;
  longitude: number;
  /** feet */
  altitude: number;
  /** knots */
  speed: number;
  heading: number;
  distanceToDestKm: number;
  /** How late the inbound leg is running. This is the delay signal. */
  delayMinutes: number;
  phase: FlightPhase;
}

export interface FlightData {
  flightNumber: string;
  airline: string;
  origin: Airport;
  destination: Airport;
  /** ISO 8601 instants — see module doc comment. */
  scheduledDeparture: string;
  scheduledArrival: string;
  estimatedArrival: string;
  tailNumber: string;
  /** The aircraft flying the leg *before* this flight — the delay predictor. */
  inbound: InboundAircraft;
  status: FlightStatus;
  delayMinutes: number;
  phase: FlightPhase;
  /** YYYY-MM-DD service date */
  date: string;
  /** Whether this payload came from simulated or live tracking data. */
  dataSource: "demo" | "live";
}
