# Implementation Plan: Ticket List

**Branch**: `007-support-tickets` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Files Involved

| File | Role |
|------|------|
| `app/(protected)/tickets/page.tsx` | Server component rendering `<TicketTable/>` |
| `components/tickets/ticket-table.tsx` | Heading, table, skeleton rows, empty state, rows, view button |
| `components/tickets/ticket-status-badge.tsx` | `STATUS_STYLES` / `STATUS_LABELS` maps |
| `hooks/use-tickets.ts` | `useTickets()` with `TICKETS_KEY = ["tickets"]` |
| `services/tickets.ts` | `listTickets()` → `apiFetch("tickets")` |
| `types/ticket.ts` | `Ticket`, `TicketStatus` |
| `components/layout/app-sidebar.tsx` | `customerNavItems` includes `/tickets` |
| `hooks/use-chat-stream.ts` | Invalidates `["tickets"]` on `ticket` event |

## State & Data Flow

React Query only; no local state. `formatDistanceToNow(new Date(created_at), {addSuffix:true})`.

## Error / Loading Handling

- Loading: 3 skeleton rows.
- Empty: "No support tickets yet."
- Error: not handled (no `isError` branch, no toast).

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I | PASS | Via `apiFetch`. |
| II | PASS | Layered; read-only. |
| III | PASS (caveat) | `../contracts/tickets.md`. |
| IV | VIOLATION | No E2E test for list, empty state, or role visibility. |
| V | PASS | `Button render={<Link/>}`. |
| VI | PASS | — |
