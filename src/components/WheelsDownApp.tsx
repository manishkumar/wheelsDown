"use client";

import { useCallback, useEffect, useState } from "react";
import { generateShareUrl } from "@/lib/flightLogic";
import type { FlightData } from "@/lib/types";
import { AppHeader } from "./AppHeader";
import { BottomNav, type Tab } from "./BottomNav";
import { DemoBanner } from "./DemoBanner";
import { FlightStatusPanel } from "./FlightStatusPanel";
import { PickupPanel } from "./PickupPanel";
import { SearchView } from "./SearchView";

type Persona = "flying" | "pickup";

const REFRESH_INTERVAL_MS = { flying: 5 * 60_000, pickup: 2 * 60_000 };

export function WheelsDownApp({ demoMode }: { demoMode: boolean }) {
  const [activeTab, setActiveTab] = useState<Tab>("search");
  const [persona, setPersona] = useState<Persona>("flying");
  const [flightNumber, setFlightNumber] = useState("");
  const [flight, setFlight] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          setError(
            demoMode
              ? "Flight not found. Try 6E-456, AI-302, or UK-835."
              : "Flight not found. Check the flight number and try again."
          );
          setFlight(null);
          return;
        }
        setFlight((await res.json()) as FlightData);
        setActiveTab(persona === "flying" ? "flight" : "pickup");
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [persona, demoMode]
  );

  // Keep the tracked flight fresh.
  useEffect(() => {
    if (!flight) return;
    const timer = setInterval(
      () => fetchFlight(flight.flightNumber),
      REFRESH_INTERVAL_MS[persona]
    );
    return () => clearInterval(timer);
  }, [flight, persona, fetchFlight]);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab === "flight") setPersona("flying");
    if (tab === "pickup") setPersona("pickup");
  }

  function handlePersonaChange(p: Persona) {
    setPersona(p);
    if (flight) {
      setActiveTab(p === "flying" ? "flight" : "pickup");
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
    const text = `Track ${flight.flightNumber} (${flight.origin.code} → ${flight.destination.code}) arrival in real-time: ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Track ${flight.flightNumber}`, text, url });
        return;
      } catch {
        /* fall through to WhatsApp deep link */
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="min-h-screen flex flex-col bg-cloud">
      {demoMode && <DemoBanner />}

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
            demoMode={demoMode}
          />
        )}

        {activeTab === "flight" && flight && (
          <div className="bg-gray-input min-h-screen">
            <AppHeader flightNumber={flight.flightNumber} />
            <div className="p-4">
              <FlightStatusPanel flight={flight} onShare={handleWhatsAppShare} />
            </div>
          </div>
        )}

        {activeTab === "pickup" && flight && (
          <div className="bg-gray-input min-h-screen">
            <AppHeader flightNumber={flight.flightNumber} />
            <div className="p-4">
              <PickupPanel flight={flight} />
            </div>
          </div>
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasFlight={!!flight}
      />
    </div>
  );
}
