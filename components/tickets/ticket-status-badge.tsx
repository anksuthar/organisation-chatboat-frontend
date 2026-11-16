import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@/types/ticket";

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  in_progress: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  resolved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  closed: "bg-muted text-muted-foreground",
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge variant="secondary" className={STATUS_STYLES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
