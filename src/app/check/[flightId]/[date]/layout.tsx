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
    title: `${flightId} Delay Check — Wheels Down`,
    description: `Check if flight ${flightId} on ${date} is likely to be delayed based on inbound aircraft tracking.`,
    openGraph: {
      title: `Is ${flightId} Delayed?`,
      description: `Real-time delay prediction for flight ${flightId} using inbound aircraft tracking.`,
      type: "website",
    },
  };
}

export default function CheckLayout({ children }: LayoutProps) {
  return children;
}
