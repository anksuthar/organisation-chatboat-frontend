import { apiFetch } from "@/services/api-client";
import type { Ticket } from "@/types/ticket";

// Tickets have no creation endpoint here by design — they're opened only
// via the chat agent's order-dispute intent (see backend specs/040).
export function listTickets(): Promise<Ticket[]> {
  return apiFetch("tickets");
}

export function getTicket(id: number): Promise<Ticket> {
  return apiFetch(`tickets/${id}`);
}
