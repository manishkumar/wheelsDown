"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMinutesAsCountdown } from "@/lib/flightLogic";

interface LeaveNowTimerProps {
  landingInMinutes: number;
  onTravelTimeChange: (minutes: number | null) => void;
  leaveInMinutes: number | null;
  shouldLeaveNow: boolean;
  hasLanded: boolean;
}

export function LeaveNowTimer({
  landingInMinutes,
  onTravelTimeChange,
  leaveInMinutes,
  shouldLeaveNow,
  hasLanded,
}: LeaveNowTimerProps) {
  const [travelTime, setTravelTime] = useState("");

  function handleChange(value: string) {
    setTravelTime(value);
    const num = parseInt(value, 10);
    onTravelTimeChange(isNaN(num) || num <= 0 ? null : num);
  }

  if (hasLanded) {
    return (
      <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-center">
        <div className="text-emerald-400 text-lg font-medium mb-1">
          Flight has landed
        </div>
        <p className="text-muted-foreground text-sm">
          Head to the arrivals area now
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-secondary/30 border border-border/30 p-5">
        <Label
          htmlFor="travelTime"
          className="text-sm text-muted-foreground mb-2 block"
        >
          How far are you from the airport?
        </Label>
        <div className="flex items-center gap-3">
          <Input
            id="travelTime"
            type="number"
            placeholder="30"
            value={travelTime}
            onChange={(e) => handleChange(e.target.value)}
            className="h-12 text-lg bg-secondary/50 border-border/50 w-24 text-center"
            min={1}
            max={300}
          />
          <span className="text-muted-foreground">minutes away</span>
        </div>
      </div>

      {leaveInMinutes !== null && (
        <div
          className={`rounded-2xl p-6 text-center transition-all ${
            shouldLeaveNow
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-secondary/30 border border-border/30"
          }`}
        >
          {shouldLeaveNow ? (
            <>
              <div className="text-emerald-400 text-2xl font-bold mb-1">
                Leave Now
              </div>
              <p className="text-muted-foreground text-sm">
                To arrive with a 15-minute buffer before landing
              </p>
            </>
          ) : (
            <>
              <div className="text-muted-foreground text-sm mb-1">
                Leave in
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {formatMinutesAsCountdown(leaveInMinutes)}
              </div>
              <p className="text-muted-foreground text-xs mt-2">
                Landing in {formatMinutesAsCountdown(landingInMinutes)} &middot;
                Includes 15 min buffer
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
