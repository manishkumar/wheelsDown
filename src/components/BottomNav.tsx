"use client";

import { FlightTailIcon, PickupCarIcon, SearchIcon } from "./icons";

export type Tab = "search" | "flight" | "pickup";

export function BottomNav({
  activeTab,
  onTabChange,
  hasFlight,
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  hasFlight: boolean;
}) {
  const tabs: {
    id: Tab;
    Icon: typeof FlightTailIcon;
    label: string;
    enabled: boolean;
  }[] = [
    { id: "flight", Icon: FlightTailIcon, label: "MY FLIGHT", enabled: hasFlight },
    { id: "pickup", Icon: PickupCarIcon, label: "PICKUP", enabled: hasFlight },
    { id: "search", Icon: SearchIcon, label: "SEARCH", enabled: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-board-panel border-t border-hairline nav-safe-bottom">
      <div className="flex h-16">
        {tabs.map(({ id, Icon, label, enabled }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => enabled && onTabChange(id)}
              disabled={!enabled}
              className={`flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors min-h-[64px] ${
                !enabled ? "opacity-30 cursor-default" : "cursor-pointer"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-flap-amber" />
              )}
              <Icon
                className={`w-5 h-5 ${isActive ? "text-flap-amber" : "text-mist"}`}
              />
              <span
                className={`font-mono text-[10px] tracking-[1px] ${
                  isActive ? "text-flap-amber" : "text-mist"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
