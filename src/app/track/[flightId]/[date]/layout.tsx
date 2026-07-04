import type { Metadata } from "next";

interface LayoutProps {
  children: React.ReactNode;
  params: { flightId: string; date: string };
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const flightId = decodeURIComponent(params.flightId);
  const date = params.date;

  return {
    title: `Track ${flightId} — Wheels Down`,
    description: `Live arrival tracking for flight ${flightId} on ${date}. Know exactly when to leave for pickup.`,
    openGraph: {
      title: `Track Flight ${flightId}`,
      description: `Live arrival tracking for ${flightId}. Get a smart pickup countdown — know exactly when to leave.`,
      type: "website",
    },
  };
}

export default function TrackLayout({ children }: LayoutProps) {
  return children;
}
