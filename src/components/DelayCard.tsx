"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./StatusBadge";
import type { FlightData } from "@/lib/mockData";
import { getDelayVerdict, generateShareUrl } from "@/lib/flightLogic";

interface DelayCardProps {
  flight: FlightData;
}

export function DelayCard({ flight }: DelayCardProps) {
  const verdict = getDelayVerdict(flight);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${generateShareUrl(flight.flightNumber, flight.date)}`
      : "";

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Track ${flight.flightNumber}`,
          text: `Track ${flight.flightNumber} (${flight.origin.code} → ${flight.destination.code}) arrival in real-time`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              {flight.flightNumber}
            </h2>
            <StatusBadge status={flight.status} />
          </div>
          <span className="text-sm text-muted-foreground">
            {flight.airline}
          </span>
        </div>

        <div className="flex items-center gap-2 text-lg text-muted-foreground mt-3">
          <span className="font-medium text-foreground">
            {flight.origin.code}
          </span>
          <svg
            className="w-5 h-5"
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
          <span className="text-sm ml-2">
            {flight.origin.city} to {flight.destination.city}
          </span>
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Schedule */}
      <div className="p-6 pb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Scheduled Departure</span>
            <p className="text-lg font-medium mt-0.5">
              {flight.scheduledDeparture}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">
              {flight.status === "on-time"
                ? "Expected Arrival"
                : "Revised Arrival"}
            </span>
            <p className="text-lg font-medium mt-0.5">
              {flight.estimatedArrival}
              {flight.delayMinutes > 0 && (
                <span className="text-sm text-amber-400 ml-2">
                  (+{flight.delayMinutes}m)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Inbound Aircraft Info */}
      <div className="p-6 pb-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Inbound Aircraft
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tail Number</span>
            <span className="font-mono">{flight.inbound.tailNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Status</span>
            <span className="text-right max-w-[60%]">
              {flight.inbound.currentLocation}
            </span>
          </div>
          {flight.inbound.altitude > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Altitude</span>
              <span>
                {(flight.inbound.altitude / 1000).toFixed(0)},000 ft
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Verdict */}
      <div className="p-6">
        <div className={`text-lg font-medium ${verdict.color}`}>
          {verdict.emoji} {verdict.headline}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{verdict.detail}</p>
      </div>

      {/* Share */}
      {flight.status !== "cancelled" && (
        <>
          <Separator className="bg-border/30" />
          <div className="p-6 pt-4">
            <Button
              variant="outline"
              className="w-full border-border/50"
              onClick={handleShare}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                />
              </svg>
              {copied ? "Link Copied!" : "Share Pickup Link"}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
