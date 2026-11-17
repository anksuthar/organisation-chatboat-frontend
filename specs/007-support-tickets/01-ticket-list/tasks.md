# Tasks: Ticket List

**Input**: `specs/007-support-tickets/01-ticket-list/`, `../contracts/tickets.md`

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [X] T001 [P] `Ticket` / `TicketStatus` types in types/ticket.ts
- [X] T002 [P] `listTickets` in services/tickets.ts
- [X] T003 `useTickets` with `["tickets"]` key in hooks/use-tickets.ts
- [X] T004 [P] `TicketStatusBadge` label/colour maps in components/tickets/ticket-status-badge.tsx

## Phase 2: User Story 1 - List tickets (P1) MVP

- [X] T005 [US1] Table with heading, subtitle, columns, order link, relative time, view button in components/tickets/ticket-table.tsx
- [X] T006 [US1] Skeleton rows and "No support tickets yet." empty state in components/tickets/ticket-table.tsx
- [X] T007 [US1] Route file rendering `TicketTable` in app/(protected)/tickets/page.tsx
- [ ] T008 [US1] GAP: E2E test (mock `GET /api/backend/tickets`) for rows, status labels, links, empty state in tests/e2e/tickets.spec.ts
- [X] T009 [US1] GAP: No error state — failed fetch renders a header-only table with no message in components/tickets/ticket-table.tsx — FIXED (2026-11-16): `TicketTable` renders `<QueryError>` with Retry instead of the table when the tickets query fails

## Phase 3: User Story 2 - Auto-refresh after chat ticket (P2)

- [X] T010 [US2] Invalidate `["tickets"]` on `ticket` SSE event in hooks/use-chat-stream.ts
- [ ] T011 [US2] GAP: E2E test that a chat `ticket` event leads to the new ticket appearing on `/tickets` in tests/e2e/tickets.spec.ts

## Phase 4: User Story 3 - Role visibility (P3)

- [X] T012 [US3] "Support Tickets" nav item for customers only in components/layout/app-sidebar.tsx
- [ ] T013 [US3] GAP: E2E role test (customer sees nav item; employee/admin do not) in tests/e2e/tickets.spec.ts

## Gap summary

- T008, T011, T013: no Playwright coverage for any ticket-list story (Constitution IV).
- T009: FIXED (2026-11-16) — QueryError with Retry replaces the table on failure.
