export function AppHeader({ flightNumber }: { flightNumber: string }) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-light/60 h-[52px] flex items-center justify-between px-4">
      <span className="font-display text-lg text-tarmac">
        {"✈"} Wheels Down
      </span>
      <span className="font-mono text-[13px] text-amber font-semibold">
        {flightNumber}
      </span>
    </div>
  );
}
