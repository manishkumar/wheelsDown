"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatMinutesAsCountdown,
  formatTime,
  getPickupInfo,
} from "@/lib/flightLogic";
import type { FlightData } from "@/lib/types";

/**
 * The "Picking up" result: landing countdown, travel-time slider, leave-by
 * card, and timeline. Used by the home tab and the /track share page.
 *
 * Owns its own travel-time and notification state; re-derives the countdown
 * every 30 seconds. Fires a browser notification the moment the leave-by
 * time is reached (only works while the page is open — there is no push
 * backend, and that is documented honestly in the README).
 */
export function PickupPanel({ flight }: { flight: FlightData }) {
  const [travelTime, setTravelTime] = useState(30);
  const [travelTimeSet, setTravelTimeSet] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [, setTick] = useState(0);
  const notifiedRef = useRef(false);

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(i);
  }, []);

  const pickupInfo = getPickupInfo(flight, travelTimeSet ? travelTime : null);
  const isCancelled = flight.status === "cancelled";
  const isDelayed = flight.delayMinutes > 0;

  // Fire the leave-now notification exactly once per tracked flight.
  useEffect(() => {
    if (
      notificationGranted &&
      pickupInfo.shouldLeaveNow &&
      !notifiedRef.current &&
      typeof Notification !== "undefined"
    ) {
      notifiedRef.current = true;
      new Notification(`Time to leave for ${flight.flightNumber}`, {
        body: pickupInfo.hasLanded
          ? "The flight has landed — head to arrivals."
          : "Leave now to reach the airport as the flight lands.",
      });
    }
  }, [notificationGranted, pickupInfo.shouldLeaveNow, pickupInfo.hasLanded, flight.flightNumber]);

  function handleNotify() {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") setNotificationGranted(true);
    });
  }

  const leaveState =
    pickupInfo.hasLanded || pickupInfo.shouldLeaveNow
      ? "now"
      : travelTimeSet &&
          pickupInfo.leaveInMinutes !== null &&
          pickupInfo.leaveInMinutes <= 15
        ? "alert"
        : "calm";

  // Leave-by is about the driver's own clock — viewer-local, no timezone arg.
  const leaveByTime = pickupInfo.leaveBy ? formatTime(pickupInfo.leaveBy) : "";

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Condensed flight card */}
      <div
        className="bg-white rounded-2xl p-4"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[13px] text-amber font-semibold">
              {flight.flightNumber}
            </span>
            <span className="text-gray text-xs">{flight.airline}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-display font-bold text-tarmac">
              {flight.origin.code}
            </span>
            <span className="text-amber text-xs">{"→"}</span>
            <span className="font-display font-bold text-tarmac">
              {flight.destination.code}
            </span>
          </div>
        </div>
        <p className="text-[12px] text-gray mt-2 font-body">
          Aircraft {flight.inbound.tailNumber}
          {isDelayed ? ` — ${flight.delayMinutes}m behind` : " — on schedule"}
        </p>
      </div>

      {/* Countdown */}
      <div
        className="bg-white rounded-2xl py-8 px-5 text-center"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
      >
        {isCancelled ? (
          <>
            <div className="font-display text-[40px] font-bold text-red">
              Cancelled
            </div>
            <p className="text-sm text-gray mt-2">
              {flight.inbound.currentLocation}
            </p>
          </>
        ) : pickupInfo.hasLanded ? (
          <>
            <div className="font-mono text-[11px] text-[#AAAAAA] tracking-[3px] mb-2">
              STATUS
            </div>
            <div className="font-display text-[48px] font-bold text-green leading-none">
              Landed
            </div>
            <p className="text-sm text-gray mt-3">Head to arrivals</p>
          </>
        ) : (
          <>
            <div className="font-mono text-[11px] text-[#AAAAAA] tracking-[3px] mb-2">
              LANDING IN
            </div>
            <div className="font-display text-[96px] font-bold text-tarmac leading-none">
              {pickupInfo.landingInMinutes}
            </div>
            <div className="text-lg text-gray mt-1 font-body">minutes</div>
            <div className="font-mono text-[13px] text-[#AAAAAA] mt-3">
              Estimated{" "}
              {formatTime(flight.estimatedArrival, flight.destination.timezone)}
            </div>
          </>
        )}
      </div>

      {/* Travel-time slider */}
      {!isCancelled && !pickupInfo.hasLanded && (
        <div
          className="bg-white rounded-2xl p-5"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
        >
          <p className="text-sm text-tarmac font-body mb-4">
            I&apos;m{" "}
            <span className="font-mono text-amber font-semibold text-lg mx-0.5">
              {travelTime}
            </span>{" "}
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

      {/* Leave-now card */}
      {!isCancelled && travelTimeSet && pickupInfo.leaveInMinutes !== null && (
        <div
          className={`rounded-2xl p-5 transition-all duration-500 ${
            leaveState === "now"
              ? "bg-amber text-white animate-pulse-amber"
              : leaveState === "alert"
                ? "bg-amber-light border-2 border-amber"
                : "bg-white border-l-4 border-l-green"
          }`}
          style={
            leaveState === "calm"
              ? { boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }
              : undefined
          }
        >
          {leaveState === "now" ? (
            <div className="text-center py-4">
              <div className="font-display text-[40px] font-bold leading-none">
                LEAVE NOW
              </div>
            </div>
          ) : leaveState === "alert" ? (
            <div className="text-center">
              <div className="text-2xl font-semibold text-amber font-body">
                Leave in {formatMinutesAsCountdown(pickupInfo.leaveInMinutes)}
              </div>
              <p className="text-[13px] text-tarmac mt-1">
                Head out now &mdash; don&apos;t wait for luggage
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{"\u{1F4C5}"}</span>
                <span className="text-[22px] font-semibold text-tarmac font-body">
                  Leave by {leaveByTime}
                </span>
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
              <span
                className={`font-mono text-sm ${isDelayed ? "text-gray struck" : "text-tarmac"}`}
              >
                {formatTime(flight.scheduledArrival, flight.destination.timezone)}
              </span>
              <span className="text-xs text-gray">Scheduled arrival</span>
            </div>
          </div>
          <div className="ml-[6.5px] w-px h-5 border-l border-dashed border-gray-border" />
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-amber shrink-0 z-10" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-amber">
                {formatTime(flight.estimatedArrival, flight.destination.timezone)}
              </span>
              <span className="text-xs text-amber">
                Estimated arrival &middot; LIVE
              </span>
            </div>
          </div>
          {travelTimeSet && leaveByTime && (
            <>
              <div className="ml-[6.5px] w-px h-5 border-l border-dashed border-gray-border" />
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-green bg-white shrink-0 z-10" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-green">
                    {leaveByTime}
                  </span>
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
          style={
            !notificationGranted
              ? { boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }
              : undefined
          }
        >
          {notificationGranted
            ? "✓  You'll be notified while this page is open"
            : "\u{1F514}  Notify me when to leave"}
        </button>
      )}
    </div>
  );
}
