export interface Airport {
  code: string;
  city: string;
}

export interface InboundAircraft {
  tailNumber: string;
  currentLocation: string;
  latitude: number;
  longitude: number;
  altitude: number; // feet
  speed: number; // knots
  heading: number;
  distanceToDestKm: number;
  delayMinutes: number;
  phase: FlightPhase;
}

export type FlightPhase =
  | "scheduled"
  | "boarding"
  | "taxiing"
  | "departed"
  | "en-route"
  | "descending"
  | "final-approach"
  | "landed"
  | "cancelled";

export type FlightStatus =
  | "on-time"
  | "delayed"
  | "significantly-delayed"
  | "cancelled";

export interface FlightData {
  flightNumber: string;
  airline: string;
  origin: Airport;
  destination: Airport;
  scheduledDeparture: string; // HH:mm
  scheduledArrival: string; // HH:mm
  estimatedArrival: string; // HH:mm
  tailNumber: string;
  inbound: InboundAircraft;
  status: FlightStatus;
  delayMinutes: number;
  phase: FlightPhase;
  date: string;
}

function getTimeOffsetFromNow(minutesFromNow: number): string {
  const d = new Date(Date.now() + minutesFromNow * 60 * 1000);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function getMockFlight(
  flightId: string,
  date: string
): FlightData | null {
  const normalized = flightId.toUpperCase().replace("-", "");

  const flights: Record<string, () => FlightData> = {
    "6E456": () => ({
      flightNumber: "6E-456",
      airline: "IndiGo",
      origin: { code: "DEL", city: "New Delhi" },
      destination: { code: "BOM", city: "Mumbai" },
      scheduledDeparture: getTimeOffsetFromNow(30),
      scheduledArrival: getTimeOffsetFromNow(150),
      estimatedArrival: getTimeOffsetFromNow(190),
      tailNumber: "VT-ITC",
      inbound: {
        tailNumber: "VT-ITC",
        currentLocation: "Over Jaipur, descending through FL280",
        latitude: 26.9124,
        longitude: 75.7873,
        altitude: 28000,
        speed: 420,
        heading: 135,
        distanceToDestKm: 340,
        delayMinutes: 40,
        phase: "en-route",
      },
      status: "delayed",
      delayMinutes: 40,
      phase: "scheduled",
      date,
    }),

    AI302: () => ({
      flightNumber: "AI-302",
      airline: "Air India",
      origin: { code: "DEL", city: "New Delhi" },
      destination: { code: "BLR", city: "Bengaluru" },
      scheduledDeparture: getTimeOffsetFromNow(45),
      scheduledArrival: getTimeOffsetFromNow(195),
      estimatedArrival: getTimeOffsetFromNow(198),
      tailNumber: "VT-EXK",
      inbound: {
        tailNumber: "VT-EXK",
        currentLocation: "Parked at Gate 42, DEL Terminal 3",
        latitude: 28.5562,
        longitude: 77.1,
        altitude: 0,
        speed: 0,
        heading: 0,
        distanceToDestKm: 0,
        delayMinutes: 0,
        phase: "scheduled",
      },
      status: "on-time",
      delayMinutes: 0,
      phase: "scheduled",
      date,
    }),

    UK835: () => ({
      flightNumber: "UK-835",
      airline: "Vistara",
      origin: { code: "DEL", city: "New Delhi" },
      destination: { code: "MAA", city: "Chennai" },
      scheduledDeparture: getTimeOffsetFromNow(60),
      scheduledArrival: getTimeOffsetFromNow(210),
      estimatedArrival: getTimeOffsetFromNow(210),
      tailNumber: "VT-TNB",
      inbound: {
        tailNumber: "VT-TNB",
        currentLocation: "Aircraft grounded at HYD due to technical issue",
        latitude: 17.2403,
        longitude: 78.4294,
        altitude: 0,
        speed: 0,
        heading: 0,
        distanceToDestKm: 0,
        delayMinutes: -1,
        phase: "cancelled",
      },
      status: "cancelled",
      delayMinutes: -1,
      phase: "cancelled",
      date,
    }),
  };

  const factory = flights[normalized];
  return factory ? factory() : null;
}

export function getMockFlightForPickup(
  flightId: string,
  date: string
): FlightData | null {
  const normalized = flightId.toUpperCase().replace("-", "");

  // For pickup view, show flights that are in-progress (en-route or approaching)
  const flights: Record<string, () => FlightData> = {
    "6E456": () => ({
      flightNumber: "6E-456",
      airline: "IndiGo",
      origin: { code: "DEL", city: "New Delhi" },
      destination: { code: "BOM", city: "Mumbai" },
      scheduledDeparture: getTimeOffsetFromNow(-90),
      scheduledArrival: getTimeOffsetFromNow(47),
      estimatedArrival: getTimeOffsetFromNow(87),
      tailNumber: "VT-ITC",
      inbound: {
        tailNumber: "VT-ITC",
        currentLocation: "Over Nagpur, cruising at FL350",
        latitude: 21.1458,
        longitude: 79.0882,
        altitude: 35000,
        speed: 460,
        heading: 225,
        distanceToDestKm: 680,
        delayMinutes: 40,
        phase: "en-route",
      },
      status: "delayed",
      delayMinutes: 40,
      phase: "en-route",
      date,
    }),

    AI302: () => ({
      flightNumber: "AI-302",
      airline: "Air India",
      origin: { code: "DEL", city: "New Delhi" },
      destination: { code: "BLR", city: "Bengaluru" },
      scheduledDeparture: getTimeOffsetFromNow(-120),
      scheduledArrival: getTimeOffsetFromNow(32),
      estimatedArrival: getTimeOffsetFromNow(35),
      tailNumber: "VT-EXK",
      inbound: {
        tailNumber: "VT-EXK",
        currentLocation: "Approaching Bengaluru, descending through FL180",
        latitude: 13.8,
        longitude: 77.5,
        altitude: 18000,
        speed: 320,
        heading: 180,
        distanceToDestKm: 85,
        delayMinutes: 3,
        phase: "descending",
      },
      status: "on-time",
      delayMinutes: 3,
      phase: "descending",
      date,
    }),

    UK835: () => ({
      flightNumber: "UK-835",
      airline: "Vistara",
      origin: { code: "DEL", city: "New Delhi" },
      destination: { code: "MAA", city: "Chennai" },
      scheduledDeparture: getTimeOffsetFromNow(60),
      scheduledArrival: getTimeOffsetFromNow(210),
      estimatedArrival: getTimeOffsetFromNow(210),
      tailNumber: "VT-TNB",
      inbound: {
        tailNumber: "VT-TNB",
        currentLocation: "Aircraft grounded at HYD due to technical issue",
        latitude: 17.2403,
        longitude: 78.4294,
        altitude: 0,
        speed: 0,
        heading: 0,
        distanceToDestKm: 0,
        delayMinutes: -1,
        phase: "cancelled",
      },
      status: "cancelled",
      delayMinutes: -1,
      phase: "cancelled",
      date,
    }),
  };

  const factory = flights[normalized];
  return factory ? factory() : null;
}
