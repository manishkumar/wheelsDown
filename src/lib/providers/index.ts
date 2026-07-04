import { Fr24Provider } from "./fr24";
import { MockProvider } from "./mock";
import type { FlightDataProvider } from "./types";

export type { FlightDataProvider, FlightQuery } from "./types";

let provider: FlightDataProvider | null = null;

/**
 * Server-side only. Selected by FLIGHT_PROVIDER:
 *   - "mock" (default) — simulated flights, zero config, demo banner shown
 *   - "fr24"           — live Flightradar24 data, requires FR24_API_TOKEN
 */
export function getProvider(): FlightDataProvider {
  if (!provider) {
    const choice = process.env.FLIGHT_PROVIDER ?? "mock";
    switch (choice) {
      case "mock":
        provider = new MockProvider();
        break;
      case "fr24":
        provider = new Fr24Provider();
        break;
      default:
        throw new Error(
          `Unknown FLIGHT_PROVIDER "${choice}" — expected "mock" or "fr24".`
        );
    }
  }
  return provider;
}
