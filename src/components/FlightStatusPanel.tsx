"use client";

import { formatTime, getDelayVerdict } from "@/lib/flightLogic";
import type { FlightData } from "@/lib/types";
import { FlipBoard } from "./FlipBoard";
import { WhatsAppIcon } from "./icons";

/**
 * The "I'm flying" result: flight card, inbound-aircraft insight, verdict,
 * and share action. Used by the home tab and the /check share page.
 */
export function FlightStatusPanel({
  flight,
  onShare,
}: {
  flight: FlightData;
  onShare?: () => void;
}) {
  const verdict = getDelayVerdict(flight);
  const isDelayed = flight.delayMinutes > 0;
  const isCancelled = flight.status === "cancelled";

  const badgeStyle = isCancelled
    ? "bg-flap-red/10 text-flap-red border-flap-red/30"
    : flight.status === "on-time"
      ? "bg-flap-green/10 text-flap-green border-flap-green/30"
      : "bg-flap-amber/10 text-flap-amber border-flap-amber/30";

  const badgeLabel = isCancelled
    ? "CANCELLED"
    : flight.status === "on-time"
      ? "ON TIME"
      : `DELAYED +${flight.delayMinutes} MIN`;

  const verdictBorder = isCancelled
    ? "border-l-flap-red"
    : flight.status === "on-time"
      ? "border-l-flap-green"
      : flight.delayMinutes > 30
        ? "border-l-flap-red"
        : "border-l-flap-amber";

  const progressPct =
    flight.phase === "scheduled" || flight.phase === "boarding"
      ? 0
      : flight.phase === "landed"
        ? 100
        : flight.phase === "en-route"
          ? 55
          : flight.phase === "descending"
            ? 80
            : flight.phase === "final-approach"
              ? 92
              : 20;

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Flight card */}
      <div className="bg-board-panel border border-hairline rounded-2xl p-5">
        <div className="flex items-center gap-2 text-[13px] mb-5 font-mono">
          <span className="text-flap-amber font-semibold">
            {flight.flightNumber}
          </span>
          <span className="text-mist">&middot;</span>
          <span className="text-mist uppercase">{flight.airline}</span>
          <span className="text-mist">&middot;</span>
          <span className="text-mist">{flight.tailNumber}</span>
        </div>

        {/* Route */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="text-center">
            <div className="font-display text-[32px] font-bold text-chalk leading-none">
              {flight.origin.code}
            </div>
            <div className="text-[11px] text-mist mt-1 font-body">
              {flight.origin.city}
            </div>
          </div>
          <div className="flex items-center gap-0 text-flap-amber flex-1 justify-center max-w-[140px]">
            <span className="text-[10px] tracking-[3px]">&middot;&middot;&middot;&middot;&middot;</span>
            <span className="mx-1 shrink-0" aria-hidden>
              &rarr;
            </span>
            <span className="text-[10px] tracking-[3px]">&middot;&middot;&middot;&middot;&middot;</span>
          </div>
          <div className="text-center">
            <div className="font-display text-[32px] font-bold text-chalk leading-none">
              {flight.destination.code}
            </div>
            <div className="text-[11px] text-mist mt-1 font-body">
              {flight.destination.city}
            </div>
          </div>
        </div>

        {/* Arrival times, shown in the destination airport's local time */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <div className="font-mono text-[9px] text-mist tracking-[2px] uppercase mb-1">
              Scheduled
            </div>
            <div
              className={`font-mono text-[28px] text-chalk leading-none ${isDelayed ? "struck" : ""}`}
            >
              {formatTime(flight.scheduledArrival, flight.destination.timezone)}
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] text-mist tracking-[2px] uppercase mb-1">
              Estimated
            </div>
            <div
              className={`font-mono text-[28px] leading-none ${isDelayed ? "text-flap-amber" : "text-flap-green"}`}
            >
              {formatTime(flight.estimatedArrival, flight.destination.timezone)}
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-5">
          <span
            className={`inline-flex items-center px-3.5 py-1.5 rounded-full font-mono text-xs font-semibold border ${badgeStyle}`}
          >
            <FlipBoard
              text={badgeLabel}
              tileClassName="w-auto h-auto bg-transparent border-none shadow-none text-inherit font-mono text-xs font-semibold"
              flipDurationMs={280}
              staggerMs={18}
            />
          </span>
        </div>

        {/* Progress track */}
        {!isCancelled && (
          <div className="relative">
            <div className="flex justify-between text-[10px] font-mono text-mist mb-1">
              <span>{flight.origin.code}</span>
              <span>{flight.destination.code}</span>
            </div>
            <div className="relative h-[3px] bg-hairline rounded-full">
              <div
                className="absolute left-0 top-0 h-full bg-flap-amber rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
              {progressPct > 0 && progressPct < 100 && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-flap-amber shadow-[0_0_0_3px_rgba(255,176,26,0.25)]"
                  style={{ left: `${progressPct}%` }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Inbound-aircraft insight */}
      {!isCancelled && (
        <div className="bg-board-panel rounded-xl p-4 border-l-4 border-l-flap-amber animate-fade-in-up-delay-1">
          <p className="text-[15px] text-chalk leading-[1.5] font-body">
            Inbound aircraft{" "}
            <span className="font-mono font-semibold text-chalk">
              {flight.inbound.tailNumber}
            </span>{" "}
            {isDelayed
              ? `is ${flight.delayMinutes} min behind schedule`
              : "is on schedule"}
            {flight.inbound.currentLocation && (
              <>, currently {flight.inbound.currentLocation.toLowerCase()}</>
            )}
            .
          </p>
          <p className="text-[13px] text-mist mt-2 font-body">
            {isDelayed
              ? "The departure board usually catches up later — this is the early signal."
              : "No delay signal from aircraft tracking right now."}
          </p>
        </div>
      )}

      {/* Verdict */}
      <div
        className={`bg-board-well rounded-xl p-4 border-l-4 ${verdictBorder} animate-fade-in-up-delay-2`}
      >
        <p className="text-[16px] font-semibold text-chalk font-body">
          {verdict.headline}
        </p>
        <p className="text-[13px] text-mist mt-1.5 font-body">{verdict.detail}</p>
      </div>

      {!isCancelled && onShare && (
        <button
          onClick={onShare}
          className="w-full h-[52px] bg-whatsapp text-white font-semibold text-[15px] rounded-xl flex items-center justify-center btn-press focus:outline-none focus:ring-2 focus:ring-flap-amber"
        >
          <WhatsAppIcon />
          Send pickup link
        </button>
      )}
    </div>
  );
}
