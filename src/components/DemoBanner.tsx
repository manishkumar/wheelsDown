"use client";

import { isDemoMode } from "@/lib/fr24";

export function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 text-black text-center text-sm font-medium py-1.5 backdrop-blur-sm">
      DEMO MODE — Using simulated flight data
    </div>
  );
}
