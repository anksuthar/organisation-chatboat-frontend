# Feature Specification: Support Tickets

**Feature Branch**: `007-support-tickets`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented from existing code)

**Input**: Document the existing read-only support ticket pages `/tickets` and `/tickets/[id]`.

## Purpose

Let a user see the support tickets that were opened on their behalf when they reported an order
problem in chat, and view one ticket's details. Tickets are **read-only** in the frontend: there is
no create, update, comment, or status-change UI, and no create endpoint in `services/tickets.ts`
("opened only via the chat agent's order-dispute intent" — see `specs/005-knowledge-chat/05-agent-actions/`).

## Actors / Roles

| Role | Sidebar entry | Route access (middleware) | Notes |
|------|---------------|---------------------------|-------|
| `customer` | "Support Tickets" (customer nav) | Allowed | Intended audience |
| `employee` | None | Allowed (only `/admin/**` is gated) | Can reach by URL; data returned is backend-decided |
| `admin` | None (no admin ticket page exists) | Allowed | No admin triage/management UI |

The frontend renders the same UI for every role; it does not filter by role or owner. Which
tickets `GET /tickets` returns per role is UNVERIFIED (not visible in frontend code).

## Sub-specifications

| # | Sub-spec | Summary |
|---|----------|---------|
| 01 | [Ticket list](01-ticket-list/spec.md) | Table of ticket number, order link, subject, status badge, relative open time, view action; loading skeleton and empty state |
| 02 | [Ticket detail](02-ticket-detail/spec.md) | Ticket number heading, "Opened … for order #N" with order link, subject card with status badge and description |

## Cross-cutting Requirements

- **CR-001**: All requests go through `/api/backend/tickets*` via `services/api-client.ts`.
- **CR-002**: Status labels/colours come from one map (`TicketStatusBadge`): open → "Open" (blue), in_progress → "In progress" (amber), resolved → "Resolved" (green), closed → "Closed" (muted).
- **CR-003**: The tickets cache (`["tickets"]`) MUST be invalidated when chat reports a new ticket (implemented in `hooks/use-chat-stream.ts`).
- **CR-004**: Ticket text (subject, description) is rendered as plain text.

## Success Criteria

- **SC-001**: A ticket opened via chat appears in `/tickets` without manual refresh.
- **SC-002**: Every ticket row links to its detail page and its order.
- **SC-003**: Each user story has a Playwright test (currently NOT met — no tickets tests exist).

## Assumptions

- The backend scopes `GET /tickets` and `GET /tickets/{id}` to the caller (UNVERIFIED).
- Relative times use the client clock (`date-fns formatDistanceToNow`).
