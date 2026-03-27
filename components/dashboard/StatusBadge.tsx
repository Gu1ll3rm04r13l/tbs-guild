import { Badge } from "@/components/ui/badge";

type Status = "pending" | "accepted" | "rejected";

const STATUS_LABELS: Record<Status, string> = {
  pending:  "Pendiente",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

export function StatusBadge({ status }: { status: Status }) {
  return <Badge variant={status}>{STATUS_LABELS[status]}</Badge>;
}
