import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export async function GET(
  request: NextRequest,
  { params }: { params: { flightId: string; date: string } }
) {
  const { flightId, date } = params;
  const scenario =
    request.nextUrl.searchParams.get("mode") === "pickup"
      ? ("pickup" as const)
      : ("delay-check" as const);

  try {
    const flight = await getProvider().getFlight({
      flightNumber: flightId,
      date,
      scenario,
    });

    if (!flight) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 });
    }

    return NextResponse.json(flight);
  } catch (err) {
    console.error(`Flight lookup failed for ${flightId}/${date}:`, err);
    return NextResponse.json(
      { error: "Flight data provider is unavailable" },
      { status: 502 }
    );
  }
}
