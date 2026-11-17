"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { QueryError } from "@/components/shared/query-error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
import { useTicket } from "@/hooks/use-tickets";

export function TicketDetail({ ticketId }: { ticketId: number }) {
  const { data: ticket, isLoading, isError, error, refetch } = useTicket(ticketId);

  if (isError) {
    return <QueryError error={error} onRetry={() => refetch()} notFoundLabel="Ticket" className="max-w-xl" />;
  }

  if (isLoading || !ticket) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{ticket.ticket_number}</h1>
        <p className="text-sm text-muted-foreground">
          Opened {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })} for{" "}
          <Link href={`/orders/${ticket.order_id}`} className="underline underline-offset-2">
            order #{ticket.order_id}
          </Link>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            {ticket.subject}
            <TicketStatusBadge status={ticket.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{ticket.description}</CardContent>
      </Card>
    </div>
  );
}
