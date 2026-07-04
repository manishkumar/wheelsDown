import { describe, expect, it } from "vitest";
import {
  formatMinutesAsCountdown,
  formatTime,
  generateShareUrl,
  getDelayVerdict,
  getPickupInfo,
  minutesUntil,
} from "../flightLogic";
import type { FlightData } from "../types";

const NOW = new Date("2026-07-04T10:00:00Z");

function makeFlight(overrides: Partial<FlightData> = {}): FlightData {
  return {
    flightNumber: "6E-456",
    airline: "IndiGo",
    origin: { code: "DEL", city: "New Delhi", timezone: "Asia/Kolkata" },
    destination: { code: "BOM", city: "Mumbai", timezone: "Asia/Kolkata" },
    scheduledDeparture: "2026-07-04T09:00:00Z",
    scheduledArrival: "2026-07-04T11:00:00Z",
    estimatedArrival: "2026-07-04T12:00:00Z",
    tailNumber: "VT-ITC",
    inbound: {
      tailNumber: "VT-ITC",
      currentLocation: "Over Jaipur",
      latitude: 26.9,
      longitude: 75.8,
      altitude: 28000,
      speed: 420,
      heading: 135,
      distanceToDestKm: 340,
      delayMinutes: 0,
      phase: "en-route",
    },
    status: "on-time",
    delayMinutes: 0,
    phase: "en-route",
    date: "2026-07-04",
    dataSource: "demo",
    ...overrides,
  };
}

describe("getDelayVerdict", () => {
  it("treats inbound delays up to 10 minutes as on time", () => {
    expect(getDelayVerdict(makeFlight({ delayMinutes: 10 })).status).toBe(
      "on-time"
    );
  });

  it("flags 11–30 minutes as delayed", () => {
    expect(getDelayVerdict(makeFlight({ delayMinutes: 11 })).status).toBe(
      "delayed"
    );
    expect(getDelayVerdict(makeFlight({ delayMinutes: 30 })).status).toBe(
      "delayed"
    );
  });

  it("flags more than 30 minutes as significantly delayed", () => {
    expect(getDelayVerdict(makeFlight({ delayMinutes: 31 })).status).toBe(
      "significantly-delayed"
    );
  });

  it("cancellation wins regardless of delay", () => {
    const verdict = getDelayVerdict(
      makeFlight({ status: "cancelled", delayMinutes: 0 })
    );
    expect(verdict.status).toBe("cancelled");
    expect(verdict.detail).toContain("IndiGo");
  });
});

describe("getPickupInfo", () => {
  it("computes the landing countdown from the estimated arrival instant", () => {
    const info = getPickupInfo(
      makeFlight({ estimatedArrival: "2026-07-04T12:00:00Z" }),
      null,
      NOW
    );
    expect(info.landingInMinutes).toBe(120);
    expect(info.leaveInMinutes).toBeNull();
    expect(info.leaveBy).toBeNull();
  });

  it("subtracts travel time and a 15-minute arrivals buffer", () => {
    const info = getPickupInfo(
      makeFlight({ estimatedArrival: "2026-07-04T12:00:00Z" }),
      45,
      NOW
    );
    // 120 until landing − 45 travel − 15 buffer
    expect(info.leaveInMinutes).toBe(60);
    expect(info.leaveBy).toBe("2026-07-04T11:00:00.000Z");
    expect(info.shouldLeaveNow).toBe(false);
  });

  it("says leave now once the window has closed", () => {
    const info = getPickupInfo(
      makeFlight({ estimatedArrival: "2026-07-04T10:50:00Z" }),
      45,
      NOW
    );
    // 50 until landing − 45 − 15 < 0 → clamp to 0
    expect(info.leaveInMinutes).toBe(0);
    expect(info.shouldLeaveNow).toBe(true);
  });

  it("handles arrivals after midnight without a day rollover bug", () => {
    const lateNight = new Date("2026-07-04T23:50:00Z");
    const info = getPickupInfo(
      makeFlight({ estimatedArrival: "2026-07-05T00:30:00Z" }),
      null,
      lateNight
    );
    expect(info.landingInMinutes).toBe(40);
  });

  it("is independent of how the instant's offset is written", () => {
    // Same instant expressed in UTC and in IST must give the same countdown.
    const utc = getPickupInfo(
      makeFlight({ estimatedArrival: "2026-07-04T12:00:00Z" }),
      30,
      NOW
    );
    const ist = getPickupInfo(
      makeFlight({ estimatedArrival: "2026-07-04T17:30:00+05:30" }),
      30,
      NOW
    );
    expect(ist).toEqual(utc);
  });

  it("reports landed state", () => {
    const info = getPickupInfo(makeFlight({ phase: "landed" }), 30, NOW);
    expect(info.hasLanded).toBe(true);
    expect(info.shouldLeaveNow).toBe(true);
    expect(info.landingInMinutes).toBe(0);
  });

  it("reports cancelled state with no leave time", () => {
    const info = getPickupInfo(makeFlight({ status: "cancelled" }), 30, NOW);
    expect(info.phase).toBe("cancelled");
    expect(info.leaveInMinutes).toBeNull();
    expect(info.shouldLeaveNow).toBe(false);
  });
});

describe("time helpers", () => {
  it("minutesUntil rounds to whole minutes", () => {
    expect(minutesUntil("2026-07-04T10:30:30Z", NOW)).toBe(31);
    expect(minutesUntil("2026-07-04T09:00:00Z", NOW)).toBe(-60);
  });

  it("formatTime renders an instant in the airport's timezone", () => {
    expect(formatTime("2026-07-04T12:00:00Z", "Asia/Kolkata")).toBe("17:30");
    expect(formatTime("2026-07-04T12:00:00Z", "UTC")).toBe("12:00");
  });

  it("formatMinutesAsCountdown", () => {
    expect(formatMinutesAsCountdown(0)).toBe("Now");
    expect(formatMinutesAsCountdown(-5)).toBe("Now");
    expect(formatMinutesAsCountdown(45)).toBe("45 min");
    expect(formatMinutesAsCountdown(125)).toBe("2h 5m");
  });
});

describe("generateShareUrl", () => {
  it("strips whitespace and URL-encodes segments", () => {
    expect(generateShareUrl("6E 456", "2026-07-04")).toBe(
      "/track/6E456/2026-07-04"
    );
  });
});
