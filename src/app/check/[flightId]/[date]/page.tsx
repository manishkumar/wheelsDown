"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { getDelayVerdict } from "@/lib/flightLogic";
import { isDemoMode } from "@/lib/fr24";
import type { FlightData } from "@/lib/mockData";

export default function SharedCheckPage() {
  const params = useParams<{ flightId: string; date: string }>();
  const [flight, setFlight] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const demoMode = isDemoMode();

  const fetchFlight = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/flight/${encodeURIComponent(params.flightId)}/${encodeURIComponent(params.date)}`
      );
      if (!res.ok) {
        setError("Flight not found.");
        return;
      }
      const data: FlightData = await res.json();
      setFlight(data);
      setError(null);
    } catch {
      setError("Unable to fetch flight data.");
    } finally {
      setLoading(false);
    }
  }, [params.flightId, params.date]);

  useEffect(() => { fetchFlight(); }, [fetchFlight]);
  useEffect(() => {
    const i = setInterval(fetchFlight, 5 * 60 * 1000);
    return () => clearInterval(i);
  }, [fetchFlight]);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-cloud">
        <div className="inline-block text-3xl animate-bounce mb-4">{"\uD83D\uDEEB"}</div>
        <p className="text-gray text-sm">Looking up {decodeURIComponent(params.flightId)}...</p>
      </main>
    );
  }

  if (error || !flight) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-cloud px-6">
        <div className="text-4xl mb-4">{"\u2708\uFE0F"}</div>
        <h2 className="font-display text-xl font-bold text-tarmac mb-2">Flight Not Found</h2>
        <p className="text-gray text-sm text-center mb-6">{error || "Check the flight number."}</p>
        <a href="/" className="inline-flex h-12 items-center px-6 bg-stripe text-white rounded-xl font-semibold text-sm btn-press">
          Go Back
        </a>
        <p className="text-xs text-[#AAAAAA] mt-4">Demo flights: 6E-456, AI-302, UK-835</p>
      </main>
    );
  }

  const verdict = getDelayVerdict(flight);
  const isDelayed = flight.delayMinutes > 0;
  const isCancelled = flight.status === "cancelled";

  const badgeStyle = isCancelled
    ? { bg: "bg-red/10", text: "text-red", border: "border-red/30" }
    : flight.status === "on-time"
      ? { bg: "bg-green/10", text: "text-green", border: "border-green/30" }
      : { bg: "bg-amber-light", text: "text-amber", border: "border-amber/30" };

  const badgeLabel = isCancelled
    ? "CANCELLED"
    : flight.status === "on-time"
      ? "ON TIME"
      : `DELAYED +${flight.delayMinutes} MIN`;

  const verdictBorder = isCancelled
    ? "border-l-red"
    : flight.status === "on-time"
      ? "border-l-green"
      : flight.delayMinutes > 30
        ? "border-l-red"
        : "border-l-amber";

  const progressPct =
    flight.phase === "scheduled" || flight.phase === "boarding" ? 0
    : flight.phase === "landed" ? 100
    : flight.phase === "en-route" ? 55
    : flight.phase === "descending" ? 80
    : flight.phase === "final-approach" ? 92
    : 20;

  return (
    <div className="min-h-screen bg-gray-input">
      {demoMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber text-tarmac text-center font-mono text-[10px] font-semibold py-1.5 tracking-[2px] uppercase">
          DEMO MODE &mdash; SIMULATED DATA
        </div>
      )}

      <div className="bg-white border-b border-gray-light/60 h-[52px] flex items-center justify-between px-4">
        <span className="font-display text-lg text-tarmac">{"\u2708"} Wheels Down</span>
        <span className="font-mono text-[13px] text-amber font-semibold">{flight.flightNumber}</span>
      </div>

      <div className="p-4 space-y-4 animate-fade-in-up">
        {/* Flight Card */}
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center gap-2 text-[13px] mb-5">
            <span className="font-mono text-amber font-semibold">{flight.flightNumber}</span>
            <span className="text-gray">&middot;</span>
            <span className="text-gray uppercase">{flight.airline}</span>
            <span className="text-gray">&middot;</span>
            <span className="text-gray font-mono">{flight.tailNumber}</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="text-center">
              <div className="font-display text-[32px] font-bold text-tarmac leading-none">{flight.origin.code}</div>
              <div className="text-[11px] text-gray mt-1">{flight.origin.city}</div>
            </div>
            <div className="flex items-center text-amber flex-1 justify-center max-w-[140px]">
              <span className="text-[10px] tracking-[3px]">&middot;&middot;&middot;&middot;&middot;</span>
              <span className="text-lg animate-float mx-1">{"\u2708\uFE0F"}</span>
              <span className="text-[10px] tracking-[3px]">&middot;&middot;&middot;&middot;&middot;</span>
            </div>
            <div className="text-center">
              <div className="font-display text-[32px] font-bold text-tarmac leading-none">{flight.destination.code}</div>
              <div className="text-[11px] text-gray mt-1">{flight.destination.city}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <div className="font-mono text-[9px] text-[#AAAAAA] tracking-[2px] uppercase mb-1">Scheduled</div>
              <div className={`font-mono text-[28px] text-tarmac leading-none ${isDelayed ? "struck" : ""}`}>
                {flight.scheduledArrival}
              </div>
            </div>
            <div>
              <div className="font-mono text-[9px] text-[#AAAAAA] tracking-[2px] uppercase mb-1">Estimated</div>
              <div className={`font-mono text-[28px] leading-none ${isDelayed ? "text-amber" : "text-green"}`}>
                {flight.estimatedArrival}
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-5">
            <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full font-mono text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
              {badgeLabel}
            </span>
          </div>

          {!isCancelled && (
            <div className="relative">
              <div className="flex justify-between text-[10px] font-mono text-gray mb-1">
                <span>{flight.origin.code}</span>
                <span>{flight.destination.code}</span>
              </div>
              <div className="relative h-[3px] bg-gray-light rounded-full">
                <div className="absolute left-0 top-0 h-full bg-amber rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                {progressPct > 0 && progressPct < 100 && (
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-sm animate-float" style={{ left: `${progressPct}%` }}>
                    {"\u2708\uFE0F"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Insight Card */}
        {!isCancelled && (
          <div className="bg-amber-light rounded-xl p-4 border-l-4 border-l-amber">
            <div className="flex items-start gap-3">
              <span className="text-lg shrink-0 mt-0.5">{"\uD83D\uDCE1"}</span>
              <div>
                <p className="text-[15px] text-tarmac leading-[1.5]">
                  Inbound aircraft <span className="font-mono font-semibold">{flight.inbound.tailNumber}</span>{" "}
                  {isDelayed ? `is ${flight.delayMinutes} min behind schedule` : "is on schedule"}
                  {flight.inbound.currentLocation && <>, currently {flight.inbound.currentLocation.toLowerCase()}</>}.
                </p>
                <p className="text-[13px] text-gray mt-2">
                  {isDelayed
                    ? "Airlines typically won\u2019t announce this for another ~25 minutes."
                    : "No delay expected based on current aircraft tracking."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Verdict Card */}
        <div className={`bg-white rounded-xl p-4 border-l-4 ${verdictBorder}`} style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <p className="text-[16px] font-semibold text-tarmac">{verdict.headline}</p>
          <p className="text-[13px] text-gray mt-1.5">{verdict.detail}</p>
        </div>

        {/* Back */}
        <div className="text-center pt-4 pb-8">
          <a href="/" className="text-xs text-[#AAAAAA] hover:text-gray transition-colors">
            Check a different flight
          </a>
        </div>
      </div>
    </div>
  );
}
