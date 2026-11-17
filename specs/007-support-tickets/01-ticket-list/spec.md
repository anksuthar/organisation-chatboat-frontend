# Feature Specification: Ticket List

**Feature Branch**: `007-support-tickets`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented)

**Parent**: [../spec.md](../spec.md)

## User Scenarios & Testing

### User Story 1 - See my support tickets (Priority: P1)

A customer opens "Support Tickets" from the sidebar and sees a table with heading "Support
Tickets", subtitle "Opened automatically when you report a problem with an order in chat.", and
columns Ticket, Order, Subject, Status, Opened, plus a view action.

**Why this priority**: Only place to track reported problems.

**Independent Test**: Mock `GET /api/backend/tickets` with two tickets; assert rows, status labels, and links.

**Acceptance Scenarios**:

1. **Given** tickets exist, **When** `/tickets` loads, **Then** each row shows `ticket_number`, an order link `#<order_id>` → `/orders/<order_id>`, subject, status badge label, and relative time (e.g. "2 days ago").
2. **Given** a row, **When** the user clicks the eye button (aria-label "View ticket <ticket_number>"), **Then** they navigate to `/tickets/<id>`.
3. **Given** the request is in flight, **Then** three skeleton rows are shown.
4. **Given** the API returns `[]`, **Then** "No support tickets yet." is shown.

---

### User Story 2 - New chat ticket appears automatically (Priority: P2)

**Acceptance Scenarios**:

1. **Given** a `ticket` SSE event was received in chat, **When** the user opens `/tickets`, **Then** the list is refetched (cache invalidated) and includes the new ticket.

---

### User Story 3 - Role visibility (Priority: P3)

**Acceptance Scenarios**:

1. **Given** a customer, **Then** the sidebar shows "Support Tickets".
2. **Given** an employee or admin, **Then** the sidebar has no tickets entry, but visiting `/tickets` directly is not redirected and renders the same page with whatever the backend returns.

---

### Edge Cases

- Request error: `tickets` is `undefined` and `isLoading` false → table shows headers only, no empty-state text and no error message. [Observed — GAP]
- No pagination, sorting, search, or status filter.
- Status values outside the four known ones would render an empty, unstyled badge (label map lookup is `undefined`).

## Requirements

### Functional Requirements

- **FR-001**: System MUST fetch tickets via `useTickets()` (`["tickets"]`).
- **FR-002**: System MUST render one row per ticket with the five data columns and a view link.
- **FR-003**: System MUST show 3 skeleton rows while loading and "No support tickets yet." for an empty list.
- **FR-004**: Status MUST be rendered with `TicketStatusBadge` labels "Open", "In progress", "Resolved", "Closed".
- **FR-005**: Order cell MUST link to `/orders/<order_id>`.
- **FR-006**: The sidebar MUST show "Support Tickets" only for the `customer` role.

### Key Entities

- **Ticket** — see `../contracts/tickets.md`.

## Success Criteria

- **SC-001**: All returned tickets are listed with correct status labels.
