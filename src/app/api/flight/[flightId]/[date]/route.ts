import { NextRequest, NextResponse } from "next/server";
import { lookupFlight, lookupFlightForPickup } from "@/lib/fr24";

export async function GET(
  request: NextRequest,
  { params }: { params: { flightId: string; date: string } }
) {
  const { flightId, date } = params;
  const mode = request.nextUrl.searchParams.get("mode");

  const flight =
    mode === "pickup"
      ? await lookupFlightForPickup(flightId, date)
      : await lookupFlight(flightId, date);

  if (!flight) {
    return NextResponse.json(
      { error: "Flight not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(flight);
}
