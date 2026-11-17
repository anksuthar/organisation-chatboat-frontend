# Implementation Plan: Ticket Detail

**Branch**: `007-support-tickets` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Files Involved

| File | Role |
|------|------|
| `app/(protected)/tickets/[id]/page.tsx` | Async server component; awaits `params`, passes `Number(id)` |
| `components/tickets/ticket-detail.tsx` | Skeleton / heading / order link / card |
| `components/tickets/ticket-status-badge.tsx` | Status label + colour |
| `hooks/use-tickets.ts` | `useTicket(id)` with key `["tickets", id]` |
| `services/tickets.ts` | `getTicket(id)` → `apiFetch(\`tickets/${id}\`)` |
| `types/ticket.ts` | `Ticket` |

## State & Data Flow

React Query only. Detail key is under the `["tickets"]` prefix, so chat's `ticket` event invalidation also refreshes cached detail queries.

## Error / Loading Handling

- Loading and error share one branch (`isLoading || !ticket` → skeleton).
- No `isError`/404 handling, no `notFound()`.

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I | PASS | Via `apiFetch`. |
| II | PASS | Layered. |
| III | PASS (caveat) | `../contracts/tickets.md`. |
| IV | VIOLATION | No E2E test. |
| V | PASS | — |
| VI | PASS | — |
