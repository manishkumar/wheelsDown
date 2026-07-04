import { SharedFlightView } from "@/components/SharedFlightView";

export default function SharedCheckPage({
  params,
}: {
  params: { flightId: string; date: string };
}) {
  return (
    <SharedFlightView
      flightId={decodeURIComponent(params.flightId)}
      date={params.date}
      variant="check"
    />
  );
}
