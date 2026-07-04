"use client";

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
  const tabs: { id: Tab; icon: string; label: string; enabled: boolean }[] = [
    { id: "flight", icon: "✈️", label: "MY FLIGHT", enabled: hasFlight },
    { id: "pickup", icon: "\u{1F697}", label: "PICKUP", enabled: hasFlight },
    { id: "search", icon: "\u{1F50D}", label: "SEARCH", enabled: true },
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
              disabled={!tab.enabled}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors min-h-[64px] ${
                !tab.enabled ? "opacity-30 cursor-default" : "cursor-pointer"
              }`}
            >
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
