"use client";

import { GITHUB_URL } from "@/lib/site";
import { FlipBoard } from "./FlipBoard";
import { GitHubIcon } from "./icons";

type Persona = "flying" | "pickup";

const DEMO_FLIGHTS = [
  { id: "6E-456", route: "DEL → BOM", delay: "+42m", color: "text-flap-amber", dot: "bg-flap-amber" },
  { id: "AI-302", route: "DEL → BLR", delay: "", color: "text-flap-green", dot: "bg-flap-green" },
  { id: "UK-835", route: "DEL → MAA", delay: "CXL", color: "text-flap-red", dot: "bg-flap-red" },
];

export function SearchView({
  flightNumber,
  setFlightNumber,
  persona,
  onPersonaChange,
  onSearch,
  onDemoPill,
  loading,
  error,
  demoMode,
}: {
  flightNumber: string;
  setFlightNumber: (v: string) => void;
  persona: Persona;
  onPersonaChange: (p: Persona) => void;
  onSearch: () => void;
  onDemoPill: (id: string) => void;
  loading: boolean;
  error: string | null;
  demoMode: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-board-ink">
      {/* ─── Hero ─────────────────────────────────────── */}
      <div className="relative pt-14 pb-8 px-4">
        <div className="text-center mt-14 mb-6">
          <p className="font-mono text-[10px] tracking-[3px] text-mist uppercase mb-4">
            Open source &middot; Tail-number tracking
          </p>
          <FlipBoard
            text="KNOW BEFORE THE AIRLINE TELLS YOU"
            className="flex-wrap justify-center gap-[3px] max-w-[340px] mx-auto"
            tileClassName="w-[18px] h-[24px] text-[13px] font-display font-bold my-[2px]"
            staggerMs={22}
          />
          <p className="text-[15px] text-mist mt-5 max-w-[320px] mx-auto font-body">
            Wheels Down watches the aircraft flying in for your flight — not
            the departure board. When the inbound plane runs late, you hear it
            here first.
          </p>
        </div>

        {/* ─── Board terminal panel ───────────────────── */}
        <div className="mx-auto max-w-md">
          <div className="bg-board-well border border-hairline rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[9px] tracking-[2px] text-mist uppercase">
                Flight
              </span>
              <span className="font-mono text-[9px] tracking-[2px] text-mist uppercase">
                Status: &mdash;
              </span>
            </div>

            {/* Persona toggle */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => onPersonaChange("flying")}
                className={`h-12 rounded-lg text-sm font-semibold font-body flex items-center justify-center gap-2 btn-press transition-all focus:outline-none focus:ring-2 focus:ring-flap-amber ${
                  persona === "flying"
                    ? "bg-flap-amber text-board-ink"
                    : "bg-transparent text-mist border border-hairline"
                }`}
              >
                I&apos;m flying
              </button>
              <button
                onClick={() => onPersonaChange("pickup")}
                className={`h-12 rounded-lg text-sm font-semibold font-body flex items-center justify-center gap-2 btn-press transition-all focus:outline-none focus:ring-2 focus:ring-flap-amber ${
                  persona === "pickup"
                    ? "bg-flap-amber text-board-ink"
                    : "bg-transparent text-mist border border-hairline"
                }`}
              >
                Picking up
              </button>
            </div>

            {/* Flight input */}
            <div className="relative">
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                placeholder="ENTER FLIGHT NUMBER"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                className="w-full h-14 bg-board-panel border-[1.5px] border-hairline rounded-lg px-4 font-mono uppercase text-xl tracking-[2px] text-chalk placeholder:text-mist/50 placeholder:tracking-[1px] focus:outline-none focus:border-flap-amber focus:ring-2 focus:ring-flap-amber/40 transition-all"
              />
              {flightNumber && (
                <button
                  onClick={() => setFlightNumber("")}
                  aria-label="Clear flight number"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-mist rounded-full hover:bg-board-ink"
                >
                  {"×"}
                </button>
              )}
            </div>
            {demoMode && (
              <p className="font-mono text-[11px] text-mist mt-2 ml-1">
                Try 6E-456, AI-302, or UK-835
              </p>
            )}
            {error && <p className="text-flap-red text-sm mt-2 ml-1">{error}</p>}

            <button
              onClick={onSearch}
              disabled={flightNumber.trim().length < 3 || loading}
              className="w-full h-[52px] mt-4 bg-flap-amber text-board-ink font-semibold text-[15px] tracking-[1.5px] uppercase font-mono rounded-lg btn-press disabled:opacity-40 disabled:cursor-default transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-flap-amber focus:ring-offset-2 focus:ring-offset-board-well"
            >
              {loading ? (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-board-ink animate-text-pulse" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-board-ink animate-text-pulse"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-board-ink animate-text-pulse"
                    style={{ animationDelay: "300ms" }}
                  />
                </span>
              ) : (
                "Track flight"
              )}
            </button>
            <p className="font-mono text-[9px] tracking-[2px] text-mist uppercase text-center mt-3">
              No signup &middot; Free &middot; Refreshes live
            </p>
          </div>
        </div>
      </div>

      {/* ─── How it knows first ──────────────────────────────── */}
      <div className="px-4 py-6">
        <div className="bg-board-panel border border-hairline rounded-2xl p-5 mx-auto max-w-md">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] tracking-[3px] text-flap-amber uppercase font-semibold">
              How it knows first
            </span>
            <span className="font-mono text-[11px] text-mist">VT-ITC</span>
          </div>

          {/* One aircraft, two legs — the delay travels with the plane */}
          <div className="flex items-center gap-3">
            <div className="text-center shrink-0">
              <div className="font-mono text-sm font-semibold text-chalk">
                BLR → DEL
              </div>
              <div className="text-[10px] text-mist mt-0.5">inbound leg</div>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-flap-amber/10 border border-flap-amber/30 font-mono text-[10px] font-semibold text-flap-amber">
                +40 MIN LATE
              </span>
            </div>
            <div className="flex-1 flex items-center min-w-0">
              <div className="flex-1 border-t-2 border-dashed border-flap-amber/40" />
              <span className="text-flap-amber mx-1 shrink-0" aria-hidden>
                &rarr;
              </span>
              <div className="flex-1 border-t-2 border-dashed border-flap-amber/40" />
            </div>
            <div className="text-center shrink-0">
              <div className="font-mono text-sm font-semibold text-chalk">
                DEL → BOM
              </div>
              <div className="text-[10px] text-mist mt-0.5">your flight</div>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-flap-red/10 border border-flap-red/30 font-mono text-[10px] font-semibold text-flap-red">
                DELAY LIKELY
              </span>
            </div>
          </div>

          <p className="text-[13px] text-mist leading-[1.6] mt-4 font-body">
            The same physical aircraft flies both legs. When it lands late in
            Delhi, your Mumbai departure slips with it &mdash; Wheels Down sees
            that the moment it happens, while the departure board still says
            on time.
          </p>
        </div>
      </div>

      {/* ─── Demo flight pills ───────────────────────────────── */}
      {demoMode && (
        <div className="overflow-x-auto scrollbar-hide pb-4 px-4">
          <div className="flex gap-2.5 min-w-max px-1 justify-center">
            {DEMO_FLIGHTS.map((demo) => (
              <button
                key={demo.id}
                onClick={() => onDemoPill(demo.id)}
                className={`flex items-center gap-2 px-4 py-2.5 bg-board-panel rounded-lg border transition-all btn-press ${
                  flightNumber === demo.id
                    ? "border-flap-amber"
                    : "border-hairline"
                }`}
              >
                <span className="font-mono text-xs font-semibold text-chalk">
                  {demo.id}
                </span>
                <span className="text-xs text-mist font-body">{demo.route}</span>
                {demo.delay && (
                  <>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${demo.dot}`} />
                    <span className={`font-mono text-[11px] font-semibold ${demo.color}`}>
                      {demo.delay}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Open source footer ──────────────────────────────── */}
      <div className="mt-auto border-t border-hairline px-4 py-8 text-center">
        <p className="font-mono text-[10px] tracking-[3px] text-mist uppercase mb-2">
          Built in the open
        </p>
        <p className="text-[13px] text-mist max-w-[340px] mx-auto leading-[1.6] font-body">
          Wheels Down is MIT-licensed.{" "}
          {demoMode
            ? "This demo runs on simulated flights — plug in a Flightradar24 API key for live tracking."
            : "Running on live Flightradar24 data."}
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-10 px-5 mt-4 bg-board-panel border border-hairline text-chalk rounded-lg text-[13px] font-semibold btn-press focus:outline-none focus:ring-2 focus:ring-flap-amber"
        >
          <GitHubIcon />
          View on GitHub
        </a>
      </div>
    </div>
  );
}
