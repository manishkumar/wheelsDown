import type { FlightData } from "@/lib/types";
import { FlipBoard } from "./FlipBoard";

const STATUS_COLOR: Record<FlightData["status"], string> = {
  "on-time": "text-flap-green",
  delayed: "text-flap-amber",
  "significantly-delayed": "text-flap-amber",
  cancelled: "text-flap-red",
};

function statusLabel(flight: FlightData) {
  if (flight.status === "cancelled") return "CANCELLED";
  if (flight.delayMinutes > 0) return `DELAYED +${flight.delayMinutes}M`;
  return "ON TIME";
}

/** Sticky title bar plus a thin arrivals-board row (route / live status)
 * that carries the split-flap board metaphor onto every tracking screen,
 * not just the search hero. */
export function AppHeader({ flight }: { flight: FlightData }) {
  return (
    <div className="sticky top-0 z-30 bg-board-panel border-b border-hairline">
      <div className="h-[52px] flex items-center justify-between px-4">
        <span className="font-display text-lg text-chalk font-bold tracking-tight">
          Wheels Down
        </span>
        <span className="font-mono text-[13px] text-flap-amber font-semibold tracking-wide">
          {flight.flightNumber}
        </span>
      </div>
      <div className="h-[26px] flex items-center justify-between px-4 border-t border-hairline bg-board-well">
        <span className="font-mono text-[10px] text-mist tracking-[2px] uppercase">
          {flight.origin.code} &rarr; {flight.destination.code}
        </span>
        <span className={`font-mono text-[10px] font-semibold tracking-[1px] ${STATUS_COLOR[flight.status]}`}>
          <FlipBoard
            text={statusLabel(flight)}
            tileClassName="w-auto h-auto bg-transparent border-none shadow-none text-inherit font-mono text-[10px] font-semibold"
            flipDurationMs={220}
            staggerMs={14}
          />
        </span>
      </div>
    </div>
  );
}
