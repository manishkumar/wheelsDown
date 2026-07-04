"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function FlightInput() {
  const router = useRouter();
  const [flightNumber, setFlightNumber] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const formattedDate = date.toISOString().split("T")[0];
  const displayDate = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isValid = flightNumber.trim().length >= 3;

  function handleNavigate(mode: "check" | "track") {
    if (!isValid) return;
    const cleanFlight = flightNumber.trim().replace(/\s+/g, "");
    router.push(`/${mode}/${encodeURIComponent(cleanFlight)}/${formattedDate}`);
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-2">
        <Label htmlFor="flight" className="text-sm text-muted-foreground">
          Flight Number
        </Label>
        <Input
          id="flight"
          placeholder="e.g. 6E-456, AI-302"
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
          className="h-14 text-lg bg-secondary/50 border-border/50 placeholder:text-muted-foreground/50 focus:border-primary/50"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Date</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-14 text-lg justify-start bg-secondary/50 border-border/50 font-normal"
            >
              <svg
                className="mr-3 h-5 w-5 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75"
                />
              </svg>
              {displayDate}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) setDate(d);
                setOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          size="lg"
          className="h-14 text-base font-medium"
          disabled={!isValid}
          onClick={() => handleNavigate("check")}
        >
          Check My Delay
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-14 text-base font-medium border-border/50"
          disabled={!isValid}
          onClick={() => handleNavigate("track")}
        >
          Track for Pickup
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground/60 pt-2">
        Try: 6E-456 (delayed) &middot; AI-302 (on time) &middot; UK-835
        (cancelled)
      </p>
    </div>
  );
}
