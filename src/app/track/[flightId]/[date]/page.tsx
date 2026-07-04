"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  getPickupInfo,
  formatMinutesAsCountdown,
} from "@/lib/flightLogic";
import { isDemoMode } from "@/lib/fr24";
import type { FlightData } from "@/lib/mockData";

export default function SharedPickupPage() {
  const params = useParams<{ flightId: string; date: string }>();
  const [flight, setFlight] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [travelTime, setTravelTime] = useState(30);
  const [travelTimeSet, setTravelTimeSet] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [, setTick] = useState(0);
  const demoMode = isDemoMode();

  const fetchFlight = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/flight/${encodeURIComponent(params.flightId)}/${encodeURIComponent(params.date)}?mode=pickup`
      );
      if (!res.ok) {
        setError("Flight not found. The link may be invalid.");
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
    const i = setInterval(fetchFlight, 2 * 60 * 1000);
    return () => clearInterval(i);
  }, [fetchFlight]);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      setTimeout(() => Notification.requestPermission(), 3000);
    }
  }, []);

  const pickupInfo = flight
    ? getPickupInfo(flight, travelTimeSet ? travelTime : null)
    : null;

  const isDelayed = flight ? flight.delayMinutes > 0 : false;
  const isCancelled = flight?.status === "cancelled";

  const leaveState =
    pickupInfo?.hasLanded || pickupInfo?.shouldLeaveNow
      ? "now"
      : travelTimeSet && pickupInfo?.leaveInMinutes !== null && pickupInfo?.leaveInMinutes !== undefined && pickupInfo.leaveInMinutes <= 15
        ? "alert"
        : "calm";

  const leaveByTime = (() => {
    if (!travelTimeSet || !pickupInfo?.leaveInMinutes) return "";
    const d = new Date(Date.now() + pickupInfo.leaveInMinutes * 60 * 1000);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  })();

  function handleNotify() {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") setNotificationGranted(true);
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-cloud">
        <div className="inline-block text-3xl animate-bounce mb-4">{"\uD83D\uDEEB"}</div>
        <p className="text-gray text-sm">
          Tracking {decodeURIComponent(params.flightId)}...
        </p>
      </main>
    );
  }

  if (error || !flight || !pickupInfo) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-cloud px-6">
        <div className="text-4xl mb-4">{"\u2708\uFE0F"}</div>
        <h2 className="font-display text-xl font-bold text-tarmac mb-2">
          Flight Not Found
        </h2>
        <p className="text-gray text-sm text-center mb-6">
          {error || "The link may be invalid."}
        </p>
        <a
          href="/"
          className="inline-flex h-12 items-center px-6 bg-stripe text-white rounded-xl font-semibold text-sm btn-press"
        >
          Track a Flight
        </a>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-input">
      {/* Demo banner */}
      {demoMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber text-tarmac text-center font-mono text-[10px] font-semibold py-1.5 tracking-[2px] uppercase">
          DEMO MODE &mdash; SIMULATED DATA
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-light/60 h-[52px] flex items-center justify-between px-4">
        <span className="font-display text-lg text-tarmac">
          {"\u2708"} Wheels Down
        </span>
        <span className="font-mono text-[13px] text-amber font-semibold">
          {flight.flightNumber}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Condensed flight card */}
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[13px] text-amber font-semibold">{flight.flightNumber}</span>
              <span className="text-gray text-xs">{flight.airline}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-display font-bold text-tarmac">{flight.origin.code}</span>
              <span className="text-amber text-xs">{"\u2192"}</span>
              <span className="font-display font-bold text-tarmac">{flight.destination.code}</span>
            </div>
          </div>
          <p className="text-[12px] text-gray mt-2">
            Aircraft {flight.inbound.tailNumber}
            {isDelayed ? ` \u2014 ${flight.delayMinutes}m behind` : " \u2014 on schedule"}
          </p>
        </div>

        {/* BIG Countdown */}
        <div className="bg-white rounded-2xl py-8 px-5 text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          {isCancelled ? (
            <>
              <div className="font-display text-[40px] font-bold text-red">Cancelled</div>
              <p className="text-sm text-gray mt-2">{flight.inbound.currentLocation}</p>
            </>
          ) : pickupInfo.hasLanded ? (
            <>
              <div className="font-mono text-[11px] text-[#AAAAAA] tracking-[3px] mb-2">STATUS</div>
              <div className="font-display text-[48px] font-bold text-green leading-none">Landed</div>
              <p className="text-sm text-gray mt-3">Head to arrivals</p>
            </>
          ) : (
            <>
              <div className="font-mono text-[11px] text-[#AAAAAA] tracking-[3px] mb-2">LANDING IN</div>
              <div className="font-display text-[96px] font-bold text-tarmac leading-none">{pickupInfo.landingInMinutes}</div>
              <div className="text-lg text-gray mt-1">minutes</div>
              <div className="font-mono text-[13px] text-[#AAAAAA] mt-3">Estimated {flight.estimatedArrival}</div>
            </>
          )}
        </div>

        {/* Travel time slider */}
        {!isCancelled && !pickupInfo.hasLanded && (
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <p className="text-sm text-tarmac mb-4">
              I&apos;m{" "}
              <span className="font-mono text-amber font-semibold text-lg mx-0.5">{travelTime}</span>{" "}
              minutes from the airport
            </p>
            <input
              type="range"
              min={5}
              max={90}
              value={travelTime}
              onChange={(e) => {
                setTravelTime(parseInt(e.target.value, 10));
                setTravelTimeSet(true);
              }}
              className="w-full"
              style={{
                background: `linear-gradient(to right, #E8A020 0%, #E8A020 ${((travelTime - 5) / 85) * 100}%, #E0E0E0 ${((travelTime - 5) / 85) * 100}%, #E0E0E0 100%)`,
              }}
            />
            <div className="flex justify-between font-mono text-[10px] text-[#AAAAAA] mt-1">
              <span>5 min</span>
              <span>90 min</span>
            </div>
          </div>
        )}

        {/* Leave Now card */}
        {!isCancelled && travelTimeSet && pickupInfo.leaveInMinutes !== null && (
          <div
            className={`rounded-2xl p-5 transition-all duration-500 ${
              leaveState === "now"
                ? "bg-amber text-white animate-pulse-amber"
                : leaveState === "alert"
                  ? "bg-amber-light border-2 border-amber"
                  : "bg-white border-l-4 border-l-green"
            }`}
            style={leaveState === "calm" ? { boxShadow: "0 2px 12px rgba(0,0,0,0.05)" } : undefined}
          >
            {leaveState === "now" ? (
              <div className="text-center py-4">
                <div className="font-display text-[40px] font-bold leading-none">LEAVE NOW</div>
              </div>
            ) : leaveState === "alert" ? (
              <div className="text-center">
                <div className="text-2xl font-semibold text-amber">
                  Leave in {formatMinutesAsCountdown(pickupInfo.leaveInMinutes)}
                </div>
                <p className="text-[13px] text-tarmac mt-1">Head out now &mdash; don&apos;t wait for luggage</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{"\uD83D\uDCC5"}</span>
                  <span className="text-[22px] font-semibold text-tarmac">Leave by {leaveByTime}</span>
                </div>
                <p className="text-sm text-gray">
                  You have {formatMinutesAsCountdown(pickupInfo.leaveInMinutes)}
                </p>
              </>
            )}
          </div>
        )}

        {/* Timeline */}
        {!isCancelled && (
          <div className="px-2 py-2">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-border bg-white shrink-0 z-10" />
              <div className="flex items-center gap-2">
                <span className={`font-mono text-sm ${isDelayed ? "text-gray struck" : "text-tarmac"}`}>
                  {flight.scheduledArrival}
                </span>
                <span className="text-xs text-gray">Scheduled arrival</span>
              </div>
            </div>
            <div className="ml-[6.5px] w-px h-5 border-l border-dashed border-gray-border" />
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-amber shrink-0 z-10" />
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-amber">{flight.estimatedArrival}</span>
                <span className="text-xs text-amber">Estimated &middot; LIVE</span>
              </div>
            </div>
            {travelTimeSet && (
              <>
                <div className="ml-[6.5px] w-px h-5 border-l border-dashed border-gray-border" />
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-green bg-white shrink-0 z-10" />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-green">{leaveByTime}</span>
                    <span className="text-xs text-green">Your leave time</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Notify */}
        {!isCancelled && (
          <button
            onClick={handleNotify}
            disabled={notificationGranted}
            className={`w-full h-[52px] rounded-xl text-sm font-semibold flex items-center justify-center btn-press transition-all ${
              notificationGranted
                ? "bg-green/10 text-green border border-green/30"
                : "bg-white text-stripe border-[1.5px] border-stripe"
            }`}
            style={!notificationGranted ? { boxShadow: "0 2px 12px rgba(0,0,0,0.05)" } : undefined}
          >
            {notificationGranted ? "\u2713  You\u2019ll be notified" : "\uD83D\uDD14  Notify me when to leave"}
          </button>
        )}

        {/* Back link */}
        <div className="text-center pt-4 pb-8">
          <a href="/" className="text-xs text-[#AAAAAA] hover:text-gray transition-colors">
            Track a different flight
          </a>
        </div>
      </div>
    </div>
  );
}
