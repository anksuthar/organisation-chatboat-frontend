import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/types/document";

const STATUS_STYLES: Record<DocumentStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  processing: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  processed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  failed: "bg-destructive/15 text-destructive",
};

const STATUS_LABELS: Record<DocumentStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  processed: "Processed",
  failed: "Failed",
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <Badge variant="secondary" className={STATUS_STYLES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
