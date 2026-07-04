import { Badge } from "@/components/ui/badge";
import type { FlightStatus } from "@/lib/mockData";

const statusConfig: Record<
  FlightStatus,
  { label: string; className: string }
> = {
  "on-time": {
    label: "On Time",
    className:
      "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20",
  },
  delayed: {
    label: "Delayed",
    className:
      "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
  },
  "significantly-delayed": {
    label: "Significantly Delayed",
    className:
      "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20",
  },
};

interface StatusBadgeProps {
  status: FlightStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
