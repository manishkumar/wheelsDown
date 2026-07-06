export function AppHeader({ flightNumber }: { flightNumber: string }) {
  return (
    <div className="sticky top-0 z-30 bg-board-panel border-b border-hairline h-[52px] flex items-center justify-between px-4">
      <span className="font-display text-lg text-chalk font-bold tracking-tight">
        Wheels Down
      </span>
      <span className="font-mono text-[13px] text-flap-amber font-semibold tracking-wide">
        {flightNumber}
      </span>
    </div>
  );
}
