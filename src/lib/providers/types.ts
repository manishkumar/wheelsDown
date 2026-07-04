import type { FlightData } from "../types";

/**
 * A flight query as issued by the API route.
 *
 * `scenario` is a demo affordance: the mock provider uses it to serve a
 * snapshot that suits the view being rendered (a pre-departure snapshot for
 * the delay checker, an in-flight snapshot for the pickup countdown). Live
 * providers ignore it — real flights are in whatever state they are in.
 */
export interface FlightQuery {
  flightNumber: string;
  /** YYYY-MM-DD */
  date: string;
  scenario?: "delay-check" | "pickup";
}

/**
 * The single seam between the app and any flight tracking data source.
 *
 * Implementations:
 *  - `MockProvider`  — deterministic simulated flights; zero config, powers demo mode
 *  - `Fr24Provider`  — Flightradar24 API (fr24api.flightradar24.com); needs FR24_API_TOKEN
 *
 * The active provider is selected once, server-side, in `providers/index.ts`
 * via the FLIGHT_PROVIDER environment variable. Client code never talks to a
 * provider directly — only to the `/api/flight` route.
 */
export interface FlightDataProvider {
  readonly id: string;
  /** false ⇒ the UI shows the "demo mode — simulated data" banner */
  readonly isLive: boolean;
  getFlight(query: FlightQuery): Promise<FlightData | null>;
}
