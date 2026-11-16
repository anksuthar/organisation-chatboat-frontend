export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface Ticket {
  id: number;
  ticket_number: string;
  order_id: number;
  subject: string;
  description: string;
  status: TicketStatus;
  created_at: string;
}
