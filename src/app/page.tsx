"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { isDemoMode } from "@/lib/fr24";
import {
  getDelayVerdict,
  getPickupInfo,
  formatMinutesAsCountdown,
  generateShareUrl,
} from "@/lib/flightLogic";
import type { FlightData } from "@/lib/mockData";

// ─── Types ─────────────────────────────────────────────────────────
type Tab = "search" | "flight" | "pickup";
type Persona = "flying" | "pickup";

const DEMO_FLIGHTS = [
  { id: "6E-456", route: "DEL \u2192 BOM", delay: "+42m", color: "#E8A020" },
  { id: "AI-302", route: "DEL \u2192 BLR", delay: "", color: "#1A7A4A" },
  { id: "UK-835", route: "DEL \u2192 MAA", delay: "CXL", color: "#B03A2E" },
];

// ─── Plane SVG ─────────────────────────────────────────────────────
function PlaneSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="#2C2C2C" opacity="0.7">
      <path d="M40 10 L48 35 L72 38 L72 42 L48 45 L52 65 L44 62 L40 50 L36 62 L28 65 L32 45 L8 42 L8 38 L32 35 Z" />
    </svg>
  );
}

// ─── WhatsApp SVG ──────────────────────────────────────────────────
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 mr-2 shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function WheelsDown() {
  // ─── State ───────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("search");
  const [persona, setPersona] = useState<Persona>("flying");
  const [flightNumber, setFlightNumber] = useState("");
  const [flight, setFlight] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelTime, setTravelTime] = useState(30);
  const [travelTimeSet, setTravelTimeSet] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const demoMode = isDemoMode();

  // ─── Fetch flight data ──────────────────────────────────────────
  const fetchFlight = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const mode = persona === "pickup" ? "?mode=pickup" : "";
        const today = new Date().toISOString().split("T")[0];
        const res = await fetch(
          `/api/flight/${encodeURIComponent(id)}/${today}${mode}`
        );
        if (!res.ok) {
          setError("Flight not found. Try 6E-456, AI-302, or UK-835.");
          setFlight(null);
          return;
        }
        const data: FlightData = await res.json();
        setFlight(data);
        setActiveTab(persona === "flying" ? "flight" : "pickup");
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [persona]
  );

  // ─── Auto-refresh ───────────────────────────────────────────────
  useEffect(() => {
    if (!flight) return;
    const interval = persona === "pickup" ? 2 * 60 * 1000 : 5 * 60 * 1000;
    const timer = setInterval(() => {
      fetchFlight(flight.flightNumber);
    }, interval);
    return () => clearInterval(timer);
  }, [flight, persona, fetchFlight]);

  // ─── Countdown tick ─────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "pickup" || !flight) return;
    const timer = setInterval(() => {
      setCountdownKey((k) => k + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, [activeTab, flight]);

  // ─── Sync persona ↔ tab ─────────────────────────────────────────
  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab === "flight") setPersona("flying");
    if (tab === "pickup") setPersona("pickup");
  }

  function handlePersonaChange(p: Persona) {
    setPersona(p);
    // If we already have flight data, switch the result tab too
    if (flight) {
      setActiveTab(p === "flying" ? "flight" : "pickup");
      // Re-fetch with new mode
      fetchFlight(flight.flightNumber);
    }
  }

  function handleSearch() {
    const cleaned = flightNumber.trim();
    if (cleaned.length < 3) return;
    fetchFlight(cleaned);
  }

  function handleDemoPill(id: string) {
    setFlightNumber(id);
    setTimeout(() => fetchFlight(id), 200);
  }

  async function handleWhatsAppShare() {
    if (!flight) return;
    const today = new Date().toISOString().split("T")[0];
    const url = `${window.location.origin}${generateShareUrl(flight.flightNumber, today)}`;
    const text = `Track ${flight.flightNumber} (${flight.origin.code} \u2192 ${flight.destination.code}) arrival in real-time: ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Track ${flight.flightNumber}`, text, url });
        return;
      } catch { /* fallback */ }
    }
    // WhatsApp deep link fallback
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  function handleNotify() {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") setNotificationGranted(true);
    });
  }

  // ─── Pickup info (derived) ──────────────────────────────────────
  const pickupInfo = flight
    ? getPickupInfo(flight, travelTimeSet ? travelTime : null)
    : null;

  // Re-derive on countdown tick
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _tick = countdownKey;
  const freshPickupInfo = flight
    ? getPickupInfo(flight, travelTimeSet ? travelTime : null)
    : pickupInfo;

  const verdict = flight ? getDelayVerdict(flight) : null;

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex flex-col bg-cloud">
      {/* ─── DEMO BANNER ─────────────────────────────────────── */}
      {demoMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber text-tarmac text-center font-mono text-[10px] font-semibold py-1.5 tracking-[2px] uppercase">
          DEMO MODE &mdash; SIMULATED DATA
        </div>
      )}

      {/* ─── MAIN CONTENT ────────────────────────────────────── */}
      <main className="flex-1 safe-bottom">
        {activeTab === "search" && (
          <SearchView
            flightNumber={flightNumber}
            setFlightNumber={setFlightNumber}
            persona={persona}
            onPersonaChange={handlePersonaChange}
            onSearch={handleSearch}
            onDemoPill={handleDemoPill}
            loading={loading}
            error={error}
            inputRef={inputRef}
            demoMode={demoMode}
          />
        )}

        {activeTab === "flight" && flight && verdict && (
          <FlightResultView
            flight={flight}
            verdict={verdict}
            onShare={handleWhatsAppShare}
          />
        )}

        {activeTab === "pickup" && flight && freshPickupInfo && (
          <PickupResultView
            flight={flight}
            pickupInfo={freshPickupInfo}
            travelTime={travelTime}
            travelTimeSet={travelTimeSet}
            onTravelTimeChange={(v) => {
              setTravelTime(v);
              setTravelTimeSet(true);
            }}
            notificationGranted={notificationGranted}
            onNotify={handleNotify}
          />
        )}
      </main>

      {/* ─── BOTTOM NAV ──────────────────────────────────────── */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} hasFlight={!!flight} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// BOTTOM NAVIGATION BAR
// ═══════════════════════════════════════════════════════════════════
function BottomNav({
  activeTab,
  onTabChange,
  hasFlight,
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  hasFlight: boolean;
}) {
  const tabs: { id: Tab; icon: string; label: string; enabled: boolean }[] = [
    { id: "flight", icon: "\u2708\uFE0F", label: "MY FLIGHT", enabled: hasFlight },
    { id: "pickup", icon: "\uD83D\uDE97", label: "PICKUP", enabled: hasFlight },
    { id: "search", icon: "\uD83D\uDD0D", label: "SEARCH", enabled: true },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-light nav-safe-bottom"
      style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}
    >
      <div className="flex h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => tab.enabled && onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors min-h-[64px] ${
                !tab.enabled
                  ? "opacity-30 cursor-default"
                  : "cursor-pointer"
              }`}
            >
              {/* Active top border */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber" />
              )}
              <span
                className={`text-2xl leading-none ${
                  isActive && tab.id === "flight" ? "animate-float" : ""
                }`}
              >
                {tab.icon}
              </span>
              <span
                className={`font-mono text-[10px] tracking-[1px] ${
                  isActive ? "text-amber" : "text-[#AAAAAA]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SEARCH VIEW
// ═══════════════════════════════════════════════════════════════════
function SearchView({
  flightNumber,
  setFlightNumber,
  persona,
  onPersonaChange,
  onSearch,
  onDemoPill,
  loading,
  error,
  inputRef,
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
  inputRef: React.RefObject<HTMLInputElement>;
  demoMode: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Sky Section ───────────────────────────────────── */}
      <div className="sky-gradient aero-grid relative overflow-hidden pt-14 pb-6 px-4">
        {/* Animated plane */}
        <div className="absolute top-16 left-0 right-0 h-16 pointer-events-none">
          <div className="relative animate-fly-across">
            <PlaneSVG className="w-10 h-10" />
            <div className="contrail" />
          </div>
        </div>

        {/* Hero text */}
        <div className="text-center mt-16 mb-6">
          <h1 className="font-display text-[34px] leading-[1.2] text-tarmac font-bold">
            Know before the{"\n"}airline tells you.
          </h1>
          <p className="text-[15px] text-gray mt-2.5 max-w-[300px] mx-auto">
            See delays hours early. Know exactly when to leave for pickup.
          </p>
        </div>

        {/* ─── Search Card ─────────────────────────────────── */}
        <div
          className="bg-white rounded-[20px] mx-auto max-w-md p-5"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
        >
          {/* Persona Toggle */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => onPersonaChange("flying")}
              className={`h-12 rounded-xl text-sm font-semibold font-body flex items-center justify-center gap-2 btn-press transition-all ${
                persona === "flying"
                  ? "bg-amber text-tarmac"
                  : "bg-transparent text-[#AAAAAA] border border-gray-border"
              }`}
            >
              <span className="text-base">{"\u2708\uFE0F"}</span> I&apos;m Flying
            </button>
            <button
              onClick={() => onPersonaChange("pickup")}
              className={`h-12 rounded-xl text-sm font-semibold font-body flex items-center justify-center gap-2 btn-press transition-all ${
                persona === "pickup"
                  ? "bg-amber text-tarmac"
                  : "bg-transparent text-[#AAAAAA] border border-gray-border"
              }`}
            >
              <span className="text-base">{"\uD83D\uDE97"}</span> Picking Up
            </button>
          </div>

          {/* Flight Input */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="Enter flight number"
              value={flightNumber}
              onChange={(e) =>
                setFlightNumber(e.target.value.toUpperCase())
              }
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="w-full h-14 bg-gray-input border-[1.5px] border-gray-border rounded-xl px-4 font-mono text-xl tracking-[2px] text-tarmac placeholder:text-[#CCCCCC] placeholder:tracking-[1px] focus:outline-none focus:border-amber focus:shadow-[0_0_0_3px_#FDF0D5] transition-all"
            />
            {flightNumber && (
              <button
                onClick={() => setFlightNumber("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray rounded-full hover:bg-gray-input"
              >
                {"\u2715"}
              </button>
            )}
          </div>
          <p className="font-mono text-[11px] text-[#AAAAAA] mt-2 ml-1">
            Try 6E-456, AI-302, or UK-835
          </p>

          {/* Error */}
          {error && (
            <p className="text-red text-sm mt-2 ml-1">{error}</p>
          )}

          {/* Track Button */}
          <button
            onClick={onSearch}
            disabled={flightNumber.trim().length < 3 || loading}
            className="w-full h-[52px] bg-stripe text-white font-semibold text-[15px] tracking-[1px] rounded-xl mt-3 btn-press disabled:opacity-40 disabled:cursor-default transition-all flex items-center justify-center"
          >
            {loading ? (
              <span className="inline-block animate-bounce text-xl">
                {"\uD83D\uDEEB"}
              </span>
            ) : (
              "Track Flight \u2192"
            )}
          </button>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-1 mt-5 text-[12px] text-[#AAAAAA] font-body">
          <span>No signup</span>
          <span className="mx-1">&middot;</span>
          <span>Free forever</span>
          <span className="mx-1">&middot;</span>
          <span>Every 5 min</span>
        </div>

        {/* Runway lines */}
        <div className="runway-lines mt-4 mx-8" />
      </div>

      {/* ─── Demo Flight Pills ─────────────────────────────── */}
      <div className="overflow-x-auto scrollbar-hide py-4 px-4 -mx-0">
        <div className="flex gap-2.5 min-w-max px-1">
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

      {/* ─── Demo mode footer ─────────────────────────────── */}
      {demoMode && (
        <div className="text-center py-6 text-xs text-[#CCCCCC]">
          Powered by aircraft tail number tracking
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// FLIGHT RESULT VIEW (Delay Checker - "I'm Flying")
// ═══════════════════════════════════════════════════════════════════
function FlightResultView({
  flight,
  verdict,
  onShare,
}: {
  flight: FlightData;
  verdict: ReturnType<typeof getDelayVerdict>;
  onShare: () => void;
}) {
  const isDelayed = flight.delayMinutes > 0;
  const isCancelled = flight.status === "cancelled";

  // Status badge colors
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

  // Verdict border color
  const verdictBorder = isCancelled
    ? "border-l-red"
    : flight.status === "on-time"
      ? "border-l-green"
      : flight.delayMinutes > 30
        ? "border-l-red"
        : "border-l-amber";

  // Progress percentage (rough estimate based on flight phase)
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
    <div className="bg-gray-input min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-light/60 h-[52px] flex items-center justify-between px-4">
        <span className="font-display text-lg text-tarmac">
          {"\u2708"} Wheels Down
        </span>
        <span className="font-mono text-[13px] text-amber font-semibold">
          {flight.flightNumber}
        </span>
      </div>

      <div className="p-4 space-y-4 animate-fade-in-up">
        {/* ─── Flight Card ───────────────────────────────── */}
        <div
          className="bg-white rounded-2xl p-5"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
        >
          {/* Header row */}
          <div className="flex items-center gap-2 text-[13px] mb-5">
            <span className="font-mono text-amber font-semibold">
              {flight.flightNumber}
            </span>
            <span className="text-gray">&middot;</span>
            <span className="text-gray uppercase">{flight.airline}</span>
            <span className="text-gray">&middot;</span>
            <span className="text-gray font-mono">{flight.tailNumber}</span>
          </div>

          {/* Route display */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="text-center">
              <div className="font-display text-[32px] font-bold text-tarmac leading-none">
                {flight.origin.code}
              </div>
              <div className="text-[11px] text-gray mt-1 font-body">
                {flight.origin.city}
              </div>
            </div>
            <div className="flex items-center gap-0 text-amber flex-1 justify-center max-w-[140px]">
              <span className="text-[10px] tracking-[3px]">&middot;&middot;&middot;&middot;&middot;</span>
              <span className="text-lg animate-float mx-1">{"\u2708\uFE0F"}</span>
              <span className="text-[10px] tracking-[3px]">&middot;&middot;&middot;&middot;&middot;</span>
            </div>
            <div className="text-center">
              <div className="font-display text-[32px] font-bold text-tarmac leading-none">
                {flight.destination.code}
              </div>
              <div className="text-[11px] text-gray mt-1 font-body">
                {flight.destination.city}
              </div>
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <div className="font-mono text-[9px] text-[#AAAAAA] tracking-[2px] uppercase mb-1">
                Scheduled
              </div>
              <div
                className={`font-mono text-[28px] text-tarmac leading-none ${
                  isDelayed ? "struck" : ""
                }`}
              >
                {flight.scheduledArrival}
              </div>
            </div>
            <div>
              <div className="font-mono text-[9px] text-[#AAAAAA] tracking-[2px] uppercase mb-1">
                Estimated
              </div>
              <div
                className={`font-mono text-[28px] leading-none ${
                  isDelayed ? "text-amber" : "text-green"
                }`}
              >
                {flight.estimatedArrival}
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex justify-center mb-5">
            <span
              className={`inline-flex items-center px-3.5 py-1.5 rounded-full font-mono text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
            >
              {badgeLabel}
            </span>
          </div>

          {/* Progress track */}
          {!isCancelled && (
            <div className="relative">
              <div className="flex justify-between text-[10px] font-mono text-gray mb-1">
                <span>{flight.origin.code}</span>
                <span>{flight.destination.code}</span>
              </div>
              <div className="relative h-[3px] bg-gray-light rounded-full">
                <div
                  className="absolute left-0 top-0 h-full bg-amber rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
                {progressPct > 0 && progressPct < 100 && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-sm animate-float"
                    style={{ left: `${progressPct}%` }}
                  >
                    {"\u2708\uFE0F"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── Insight Card ──────────────────────────────── */}
        {!isCancelled && (
          <div
            className="bg-amber-light rounded-xl p-4 border-l-4 border-l-amber animate-fade-in-up-delay-1"
          >
            <div className="flex items-start gap-3">
              <span className="text-lg shrink-0 mt-0.5">{"\u{1F4E1}"}</span>
              <div>
                <p className="text-[15px] text-tarmac leading-[1.5]">
                  Inbound aircraft{" "}
                  <span className="font-mono font-semibold">
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
                <p className="text-[13px] text-gray mt-2">
                  {isDelayed
                    ? "Airlines typically won\u2019t announce this for another ~25 minutes."
                    : "No delay expected based on current aircraft tracking."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Verdict Card ──────────────────────────────── */}
        <div
          className={`bg-white rounded-xl p-4 border-l-4 ${verdictBorder} animate-fade-in-up-delay-2`}
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
        >
          <p className="text-[16px] font-semibold text-tarmac">
            {verdict.headline}
          </p>
          <p className="text-[13px] text-gray mt-1.5">{verdict.detail}</p>
        </div>

        {/* ─── WhatsApp Share ────────────────────────────── */}
        {!isCancelled && (
          <button
            onClick={onShare}
            className="w-full h-[52px] bg-whatsapp text-white font-semibold text-[15px] rounded-xl flex items-center justify-center btn-press"
          >
            <WhatsAppIcon />
            Send pickup link
          </button>
        )}

        {/* Spacer for bottom nav */}
        <div className="h-4" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PICKUP RESULT VIEW (Pickup Tracker - "Picking Up")
// ═══════════════════════════════════════════════════════════════════
function PickupResultView({
  flight,
  pickupInfo,
  travelTime,
  travelTimeSet,
  onTravelTimeChange,
  notificationGranted,
  onNotify,
}: {
  flight: FlightData;
  pickupInfo: ReturnType<typeof getPickupInfo>;
  travelTime: number;
  travelTimeSet: boolean;
  onTravelTimeChange: (v: number) => void;
  notificationGranted: boolean;
  onNotify: () => void;
}) {
  const isCancelled = flight.status === "cancelled";
  const isDelayed = flight.delayMinutes > 0;

  // Leave now card state
  const leaveState =
    pickupInfo.hasLanded || pickupInfo.shouldLeaveNow
      ? "now"
      : travelTimeSet && pickupInfo.leaveInMinutes !== null && pickupInfo.leaveInMinutes <= 15
        ? "alert"
        : "calm";

  // Compute leave-by time for "calm" state
  const leaveByTime = (() => {
    if (!travelTimeSet || pickupInfo.leaveInMinutes === null) return "";
    const d = new Date(Date.now() + pickupInfo.leaveInMinutes * 60 * 1000);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  })();

  return (
    <div className="bg-gray-input min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-light/60 h-[52px] flex items-center justify-between px-4">
        <span className="font-display text-lg text-tarmac">
          {"\u2708"} Wheels Down
        </span>
        <span className="font-mono text-[13px] text-amber font-semibold">
          {flight.flightNumber}
        </span>
      </div>

      <div className="p-4 space-y-4 animate-fade-in-up">
        {/* ─── Condensed Flight Card ─────────────────────── */}
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
              <span className="text-amber text-xs">{"\u2192"}</span>
              <span className="font-display font-bold text-tarmac">
                {flight.destination.code}
              </span>
            </div>
          </div>
          {/* Inbound insight */}
          <p className="text-[12px] text-gray mt-2 font-body">
            Aircraft {flight.inbound.tailNumber}
            {isDelayed
              ? ` \u2014 ${flight.delayMinutes}m behind`
              : " \u2014 on schedule"}
          </p>
        </div>

        {/* ─── BIG Countdown ─────────────────────────────── */}
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
              <p className="text-sm text-gray mt-3">
                Head to arrivals
              </p>
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
                Estimated {flight.estimatedArrival}
              </div>
            </>
          )}
        </div>

        {/* ─── Travel Time Slider ────────────────────────── */}
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
              onChange={(e) => onTravelTimeChange(parseInt(e.target.value, 10))}
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

        {/* ─── LEAVE NOW Card ────────────────────────────── */}
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
                  <span className="text-sm">{"\uD83D\uDCC5"}</span>
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

        {/* ─── Timeline Strip ────────────────────────────── */}
        {!isCancelled && (
          <div className="px-2 py-2">
            {/* Scheduled */}
            <div className="flex items-center gap-3 relative">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-border bg-white shrink-0 z-10" />
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-sm ${
                    isDelayed ? "text-gray struck" : "text-tarmac"
                  }`}
                >
                  {flight.scheduledArrival}
                </span>
                <span className="text-xs text-gray">Scheduled arrival</span>
              </div>
            </div>
            {/* Connecting line */}
            <div className="ml-[6.5px] w-px h-5 border-l border-dashed border-gray-border" />
            {/* Estimated */}
            <div className="flex items-center gap-3 relative">
              <div className="w-3.5 h-3.5 rounded-full bg-amber shrink-0 z-10" />
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-amber">
                  {flight.estimatedArrival}
                </span>
                <span className="text-xs text-amber">
                  Estimated arrival &middot; LIVE
                </span>
              </div>
            </div>
            {/* Connecting line */}
            {travelTimeSet && (
              <>
                <div className="ml-[6.5px] w-px h-5 border-l border-dashed border-gray-border" />
                {/* Leave time */}
                <div className="flex items-center gap-3 relative">
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

        {/* ─── Notify Button ─────────────────────────────── */}
        {!isCancelled && (
          <button
            onClick={onNotify}
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
              ? "\u2713  You\u2019ll be notified"
              : "\uD83D\uDD14  Notify me when to leave"}
          </button>
        )}

        {/* Spacer for bottom nav */}
        <div className="h-4" />
      </div>
    </div>
  );
}
