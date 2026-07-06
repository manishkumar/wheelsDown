"use client";

import { useCallback, useEffect, useState } from "react";
import type { FlightData } from "@/lib/types";
import { AppHeader } from "./AppHeader";
import { DemoBanner } from "./DemoBanner";
import { FlightStatusPanel } from "./FlightStatusPanel";
import { PickupPanel } from "./PickupPanel";

/**
 * Standalone view behind the share links:
 *   /track/[flightId]/[date] → pickup countdown (variant="pickup")
 *   /check/[flightId]/[date] → delay verdict   (variant="check")
 * No tabs, no persona toggle — the link *is* the context.
 */
export function SharedFlightView({
  flightId,
  date,
  variant,
}: {
  flightId: string;
  date: string;
  variant: "pickup" | "check";
}) {
  const [flight, setFlight] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlight = useCallback(async () => {
    try {
      const mode = variant === "pickup" ? "?mode=pickup" : "";
      const res = await fetch(
        `/api/flight/${encodeURIComponent(flightId)}/${encodeURIComponent(date)}${mode}`
      );
      if (!res.ok) {
        setError("Flight not found. The link may be invalid.");
        return;
      }
      setFlight((await res.json()) as FlightData);
      setError(null);
    } catch {
      setError("Unable to fetch flight data.");
    } finally {
      setLoading(false);
    }
  }, [flightId, date, variant]);

  useEffect(() => {
    fetchFlight();
    const interval = variant === "pickup" ? 2 * 60_000 : 5 * 60_000;
    const i = setInterval(fetchFlight, interval);
    return () => clearInterval(i);
  }, [fetchFlight, variant]);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-board-ink">
        <div className="font-mono text-flap-amber text-sm tracking-[2px] animate-text-pulse mb-4">
          TRACKING
        </div>
        <p className="text-mist text-sm font-body">Tracking {flightId}...</p>
      </main>
    );
  }

  if (error || !flight) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-board-ink px-6">
        <h2 className="font-display text-xl font-bold text-chalk mb-2">
          Flight not found
        </h2>
        <p className="text-mist text-sm text-center mb-6 font-body">
          {error ?? "The link may be invalid."}
        </p>
        <a
          href="/"
          className="inline-flex h-12 items-center px-6 bg-flap-amber text-board-ink rounded-xl font-semibold text-sm btn-press focus:outline-none focus:ring-2 focus:ring-flap-amber"
        >
          Track a flight
        </a>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-board-ink">
      {flight.dataSource === "demo" && <DemoBanner />}
      <AppHeader flight={flight} />
      <div className="p-4">
        {variant === "pickup" ? (
          <PickupPanel flight={flight} />
        ) : (
          <FlightStatusPanel flight={flight} />
        )}
        <div className="text-center pt-6 pb-8">
          <a
            href="/"
            className="text-xs text-mist hover:text-chalk transition-colors"
          >
            Track a different flight
          </a>
        </div>
      </div>
    </div>
  );
}
