# Feature Specification: Agent Result Cards (Commerce, Profile, Tickets)

**Feature Branch**: `005-knowledge-chat`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented)

**Parent**: [../spec.md](../spec.md) · Related: `specs/006-commerce/`, `specs/007-support-tickets/`

## Scope

The chat does **not** perform commerce actions client-side. The backend's multi-intent agent
decides intent and streams a templated reply (`token` events) plus a structured summary event.
The frontend only renders those summaries as outline badges that link to the dedicated pages
(specified in `specs/006-commerce/` and `specs/007-support-tickets/`). Ticket creation happens
entirely on the backend; the frontend only reflects it.

## User Scenarios & Testing

### User Story 1 - See my orders/products from chat (Priority: P2)

A customer asks about their orders or products; the answer is followed by clickable badges.

**Why this priority**: Shortcut from conversational query to the detail page.

**Independent Test**: Mock a stream with an `orders` event `[{id:7,status:"shipped",total_amount:"49.99"}]`; assert badge "Order #7 · shipped · $49.99" links to `/orders/7`.

**Acceptance Scenarios**:

1. **Given** an `orders` event, **Then** each order shows as a badge `Order #<id> · <status> · $<total_amount>` with a package icon linking to `/orders/<id>`.
2. **Given** a `products` event, **Then** each product shows as `<name> · $<price>` linking to `/shop/<id>`.
3. **Given** a `categories` event, **Then** each category name shows as a non-link badge.

---

### User Story 2 - Jump to my profile (Priority: P3)

**Acceptance Scenarios**:

1. **Given** a `profile` event, **Then** a single "View full profile" badge linking to `/profile` is shown (profile fields themselves are not rendered by the bubble; the reply text carries them).

---

### User Story 3 - Report an order problem and see the ticket (Priority: P2)

From order detail the user clicks "Report a problem", lands on `/chat` with the input pre-filled
"My order #<id> shows as <status> but I never received it.", edits/sends it; the backend opens a
ticket and streams a `ticket` event.

**Why this priority**: Only path to create support tickets (no create endpoint in the frontend).

**Independent Test**: Visit `/chat?prefill=...`, assert input value; send; mock `ticket` event `{ticket_number:"TCK-1", order_id:7, status:"open"}`; assert badge "TCK-1 · open" links to `/tickets` and the tickets query is invalidated.

**Acceptance Scenarios**:

1. **Given** order #7 with status "shipped", **When** the user clicks "Report a problem", **Then** `/chat` opens with the input containing "My order #7 shows as shipped but I never received it." (not auto-sent).
2. **Given** a `ticket` event, **Then** a badge `<ticket_number> · <status>` with a ticket icon links to `/tickets` (list, not the detail page — the summary has no ticket `id`).
3. **Given** a `ticket` event, **Then** React Query `["tickets"]` (and all `["tickets", id]` detail queries) are invalidated so the tickets page shows the new ticket.

---

### Edge Cases

- Which events are sent for which role is decided by the backend; the UI renders any received event for any role (e.g. an employee would see order badges if sent). Employees/admins have no "Support Tickets"/"My Orders" sidebar entries but the routes are not blocked by middleware.
- Statuses in badges are raw strings (`order.status`, `ticket.status`), not passed through the status-badge label maps (e.g. `in_progress` shown as-is).
- Prices are prefixed with `$` regardless of currency.
- Structured badges are not persisted in history; they disappear after reload.
- `prefill` is read via `useSearchParams` only as the `ChatInput` initial state; changing the query string on the same mounted page does not update the input.

## Requirements

### Functional Requirements

- **FR-001**: System MUST store `orders`, `products`, `categories`, `profile`, `ticket` event payloads on the current assistant message.
- **FR-002**: Order badges MUST link to `/orders/<id>`; product badges to `/shop/<id>`; profile badge to `/profile`; ticket badge to `/tickets`.
- **FR-003**: On a `ticket` event System MUST invalidate the `["tickets"]` query prefix.
- **FR-004**: `/chat?prefill=<text>` MUST pre-populate (not send) the chat input.
- **FR-005**: Order detail MUST offer "Report a problem" linking to `/chat?prefill=<encoded message>`.

### Key Entities

- **ChatOrderSummary**, **ChatProductSummary**, **ChatProfileSummary**, **ChatTicketSummary** — see `../contracts/chat-stream.md`.

## Success Criteria

- **SC-001**: Every structured result in the stream is reachable in one click from the chat.
- **SC-002**: A ticket opened via chat appears on `/tickets` without a manual refresh.
