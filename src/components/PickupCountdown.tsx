"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./StatusBadge";
import { LeaveNowTimer } from "./LeaveNowTimer";
import type { FlightData } from "@/lib/mockData";
import { getPickupInfo, formatMinutesAsCountdown } from "@/lib/flightLogic";

interface PickupCountdownProps {
  flight: FlightData;
}

export function PickupCountdown({ flight }: PickupCountdownProps) {
  const [travelTime, setTravelTime] = useState<number | null>(null);
  const [pickupInfo, setPickupInfo] = useState(() =>
    getPickupInfo(flight, null)
  );

  const updateInfo = useCallback(() => {
    setPickupInfo(getPickupInfo(flight, travelTime));
  }, [flight, travelTime]);

  useEffect(() => {
    updateInfo();
  }, [updateInfo]);

  // Update countdown every 30 seconds
  useEffect(() => {
    const interval = setInterval(updateInfo, 30000);
    return () => clearInterval(interval);
  }, [updateInfo]);

  if (flight.status === "cancelled") {
    return (
      <Card className="w-full max-w-lg mx-auto bg-card/50 border-border/50 backdrop-blur-sm p-8 text-center">
        <div className="text-red-400 text-xl font-medium mb-2">
          Flight Cancelled
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {flight.flightNumber} ({flight.origin.code} &rarr;{" "}
          {flight.destination.code}) has been cancelled.
        </p>
        <p className="text-muted-foreground text-sm">
          {flight.inbound.currentLocation}
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden">
      {/* Flight Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold">
              {flight.flightNumber}
            </span>
            <StatusBadge status={flight.status} />
          </div>
          <span className="text-sm text-muted-foreground">
            {flight.airline}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground mt-2">
          <span className="font-medium text-foreground">
            {flight.origin.code}
          </span>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
            />
          </svg>
          <span className="font-medium text-foreground">
            {flight.destination.code}
          </span>
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Big Countdown */}
      <div className="p-8 text-center">
        {pickupInfo.hasLanded ? (
          <>
            <div className="text-sm text-muted-foreground mb-2">
              Status
            </div>
            <div className="text-4xl font-bold text-emerald-400 tracking-tight">
              Landed
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-2">
              Landing in approximately
            </div>
            <div className="text-6xl font-bold tracking-tight mb-3">
              {formatMinutesAsCountdown(pickupInfo.landingInMinutes)}
            </div>
          </>
        )}
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          {pickupInfo.statusMessage}
        </p>
      </div>

      <Separator className="bg-border/30" />

      {/* Aircraft Position (text-based) */}
      <div className="px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <svg
              className="w-5 h-5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium">
              {flight.inbound.currentLocation}
            </div>
            {flight.inbound.altitude > 0 && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {(flight.inbound.altitude / 1000).toFixed(0)},000 ft &middot;{" "}
                {flight.inbound.speed} kts
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Leave Now Timer */}
      <div className="p-6">
        <LeaveNowTimer
          landingInMinutes={pickupInfo.landingInMinutes}
          onTravelTimeChange={setTravelTime}
          leaveInMinutes={pickupInfo.leaveInMinutes}
          shouldLeaveNow={pickupInfo.shouldLeaveNow}
          hasLanded={pickupInfo.hasLanded}
        />
      </div>

      {/* Schedule info */}
      <Separator className="bg-border/30" />
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <span>Scheduled</span>
            <p className="text-foreground text-sm font-medium mt-0.5">
              {flight.scheduledArrival}
            </p>
          </div>
          <div>
            <span>Estimated</span>
            <p className="text-foreground text-sm font-medium mt-0.5">
              {flight.estimatedArrival}
              {flight.delayMinutes > 10 && (
                <span className="text-amber-400 ml-1">
                  (+{flight.delayMinutes}m)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
