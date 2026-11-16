"use client";

import { formatDistanceToNow } from "date-fns";
import { Eye } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
import { useTickets } from "@/hooks/use-tickets";

export function TicketTable() {
  const { data: tickets, isLoading } = useTickets();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Support Tickets</h1>
        <p className="text-sm text-muted-foreground">
          Opened automatically when you report a problem with an order in chat.
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && tickets?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No support tickets yet.
                </TableCell>
              </TableRow>
            )}

            {tickets?.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                <TableCell>
                  <Link href={`/orders/${ticket.order_id}`} className="underline underline-offset-2">
                    #{ticket.order_id}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{ticket.subject}</TableCell>
                <TableCell>
                  <TicketStatusBadge status={ticket.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`View ticket ${ticket.ticket_number}`}
                    render={<Link href={`/tickets/${ticket.id}`} />}
                  >
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
