# Tasks: Ticket Detail

**Input**: `specs/007-support-tickets/02-ticket-detail/`, `../contracts/tickets.md`

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [X] T001 [P] `getTicket(id)` in services/tickets.ts
- [X] T002 `useTicket(id)` with `["tickets", id]` key in hooks/use-tickets.ts

## Phase 2: User Story 1 - View one ticket (P1) MVP

- [X] T003 [US1] Route file awaiting `params` and passing `Number(id)` in app/(protected)/tickets/[id]/page.tsx
- [X] T004 [US1] Heading, relative time, order link, subject card with status badge and description in components/tickets/ticket-detail.tsx
- [X] T005 [US1] Loading skeleton in components/tickets/ticket-detail.tsx
- [ ] T006 [US1] GAP: E2E test (mock `GET /api/backend/tickets/:id`) asserting all fields and order link in tests/e2e/tickets.spec.ts
- [X] T007 [US1] GAP: Error/404 leaves an endless skeleton — add `isError` / not-found state in components/tickets/ticket-detail.tsx — FIXED (2026-11-16): `TicketDetail` renders `<QueryError notFoundLabel="Ticket">` on query error ("Ticket not found" for 404, Retry otherwise) instead of the skeleton

## Gap summary

- T006: detail story untested (Constitution IV).
- T007: FIXED (2026-11-16) — error / "Ticket not found" state.
