"use client";

import { GITHUB_URL } from "@/lib/site";
import { GitHubIcon, PlaneSVG } from "./icons";

type Persona = "flying" | "pickup";

const DEMO_FLIGHTS = [
  { id: "6E-456", route: "DEL → BOM", delay: "+42m", color: "#E8A020" },
  { id: "AI-302", route: "DEL → BLR", delay: "", color: "#1A7A4A" },
  { id: "UK-835", route: "DEL → MAA", delay: "CXL", color: "#B03A2E" },
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
    <div className="min-h-screen flex flex-col">
      {/* ─── Sky section ─────────────────────────────────────── */}
      <div className="sky-gradient aero-grid relative overflow-hidden pt-14 pb-8 px-4">
        {/* Ambient plane */}
        <div className="absolute top-16 left-0 right-0 h-16 pointer-events-none motion-reduce:hidden">
          <div className="relative animate-fly-across">
            <PlaneSVG className="w-10 h-10" />
            <div className="contrail" />
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mt-14 mb-6">
          <p className="font-mono text-[10px] tracking-[3px] text-stripe/70 uppercase mb-3">
            Open source &middot; Tail-number tracking
          </p>
          <h1 className="font-display text-[34px] leading-[1.2] text-tarmac font-bold">
            Know before the airline tells you.
          </h1>
          <p className="text-[15px] text-gray mt-2.5 max-w-[320px] mx-auto">
            Wheels Down watches the aircraft flying in for your flight — not
            the departure board. When the inbound plane runs late, you hear it
            here first.
          </p>
        </div>

        {/* ─── Boarding-pass search card ───────────────────── */}
        <div className="mx-auto max-w-md" style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.10))" }}>
          {/* Main section of the pass */}
          <div className="pass-main bg-white rounded-t-[20px] p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[9px] tracking-[2px] text-[#AAAAAA] uppercase">
                Wheels Down &middot; Boarding intel
              </span>
              <span className="font-mono text-[9px] tracking-[2px] text-[#AAAAAA] uppercase">
                Gate: Any
              </span>
            </div>

            {/* Persona toggle */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => onPersonaChange("flying")}
                className={`h-12 rounded-xl text-sm font-semibold font-body flex items-center justify-center gap-2 btn-press transition-all ${
                  persona === "flying"
                    ? "bg-amber text-tarmac"
                    : "bg-transparent text-[#AAAAAA] border border-gray-border"
                }`}
              >
                <span className="text-base">{"✈️"}</span> I&apos;m flying
              </button>
              <button
                onClick={() => onPersonaChange("pickup")}
                className={`h-12 rounded-xl text-sm font-semibold font-body flex items-center justify-center gap-2 btn-press transition-all ${
                  persona === "pickup"
                    ? "bg-amber text-tarmac"
                    : "bg-transparent text-[#AAAAAA] border border-gray-border"
                }`}
              >
                <span className="text-base">{"\u{1F697}"}</span> Picking up
              </button>
            </div>

            {/* Flight input */}
            <div className="relative">
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                placeholder="Enter flight number"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                className="w-full h-14 bg-gray-input border-[1.5px] border-gray-border rounded-xl px-4 font-mono text-xl tracking-[2px] text-tarmac placeholder:text-[#CCCCCC] placeholder:tracking-[1px] focus:outline-none focus:border-amber focus:shadow-[0_0_0_3px_#FDF0D5] transition-all"
              />
              {flightNumber && (
                <button
                  onClick={() => setFlightNumber("")}
                  aria-label="Clear flight number"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray rounded-full hover:bg-gray-input"
                >
                  {"✕"}
                </button>
              )}
            </div>
            {demoMode && (
              <p className="font-mono text-[11px] text-[#AAAAAA] mt-2 ml-1">
                Try 6E-456, AI-302, or UK-835
              </p>
            )}
            {error && <p className="text-red text-sm mt-2 ml-1">{error}</p>}
          </div>

          {/* Perforation + stub */}
          <div className="pass-stub bg-white rounded-b-[20px] border-t border-dashed border-gray-border px-5 pt-4 pb-5">
            <button
              onClick={onSearch}
              disabled={flightNumber.trim().length < 3 || loading}
              className="w-full h-[52px] bg-stripe text-white font-semibold text-[15px] tracking-[1px] rounded-xl btn-press disabled:opacity-40 disabled:cursor-default transition-all flex items-center justify-center"
            >
              {loading ? (
                <span className="inline-block animate-bounce text-xl">
                  {"\u{1F6EB}"}
                </span>
              ) : (
                "Track flight →"
              )}
            </button>
            <div className="flex items-center justify-between mt-3">
              <span className="font-mono text-[9px] tracking-[2px] text-[#AAAAAA] uppercase">
                No signup &middot; Free &middot; Refreshes live
              </span>
              <div className="barcode h-[14px] w-[72px]" aria-hidden />
            </div>
          </div>
        </div>

        {/* Runway */}
        <div className="runway-lines mt-6 mx-8" />
      </div>

      {/* ─── How it knows first ──────────────────────────────── */}
      <div className="px-4 py-6">
        <div
          className="bg-white rounded-2xl p-5 mx-auto max-w-md"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] tracking-[3px] text-amber uppercase font-semibold">
              How it knows first
            </span>
            <span className="font-mono text-[11px] text-gray">VT-ITC</span>
          </div>

          {/* One aircraft, two legs — the delay travels with the plane */}
          <div className="flex items-center gap-3">
            <div className="text-center shrink-0">
              <div className="font-mono text-sm font-semibold text-tarmac">
                BLR → DEL
              </div>
              <div className="text-[10px] text-gray mt-0.5">inbound leg</div>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-amber-light border border-amber/30 font-mono text-[10px] font-semibold text-amber">
                +40 MIN LATE
              </span>
            </div>
            <div className="flex-1 flex items-center min-w-0">
              <div className="flex-1 border-t-2 border-dashed border-amber/40" />
              <span className="text-sm mx-1 shrink-0">{"✈️"}</span>
              <div className="flex-1 border-t-2 border-dashed border-amber/40" />
            </div>
            <div className="text-center shrink-0">
              <div className="font-mono text-sm font-semibold text-tarmac">
                DEL → BOM
              </div>
              <div className="text-[10px] text-gray mt-0.5">your flight</div>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-red/10 border border-red/30 font-mono text-[10px] font-semibold text-red">
                DELAY LIKELY
              </span>
            </div>
          </div>

          <p className="text-[13px] text-gray leading-[1.6] mt-4">
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
                className={`flex items-center gap-2 px-4 py-2.5 bg-white rounded-full border transition-all btn-press ${
                  flightNumber === demo.id
                    ? "border-amber bg-amber-light"
                    : "border-gray-light"
                }`}
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <span className="font-mono text-xs font-semibold text-tarmac">
                  {demo.id}
                </span>
                <span className="text-xs text-gray font-body">{demo.route}</span>
                {demo.delay && (
                  <>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: demo.color }}
                    />
                    <span
                      className="font-mono text-[11px] font-semibold"
                      style={{ color: demo.color }}
                    >
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
      <div className="mt-auto border-t border-gray-light bg-white px-4 py-8 text-center">
        <p className="font-mono text-[10px] tracking-[3px] text-[#AAAAAA] uppercase mb-2">
          Built in the open
        </p>
        <p className="text-[13px] text-gray max-w-[340px] mx-auto leading-[1.6]">
          Wheels Down is MIT-licensed.{" "}
          {demoMode
            ? "This demo runs on simulated flights — plug in a Flightradar24 API key for live tracking."
            : "Running on live Flightradar24 data."}
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-10 px-5 mt-4 bg-tarmac text-white rounded-xl text-[13px] font-semibold btn-press"
        >
          <GitHubIcon />
          View on GitHub
        </a>
      </div>
    </div>
  );
}
