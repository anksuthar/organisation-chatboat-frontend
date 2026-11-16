"use client";

import { useQuery } from "@tanstack/react-query";

import { getTicket, listTickets } from "@/services/tickets";

const TICKETS_KEY = ["tickets"] as const;

export function useTickets() {
  return useQuery({ queryKey: TICKETS_KEY, queryFn: listTickets });
}

export function useTicket(id: number) {
  return useQuery({ queryKey: [...TICKETS_KEY, id], queryFn: () => getTicket(id) });
}
