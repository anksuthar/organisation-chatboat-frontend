# Feature Specification: Ticket Detail

**Feature Branch**: `007-support-tickets`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented)

**Parent**: [../spec.md](../spec.md)

## User Scenarios & Testing

### User Story 1 - View one ticket (Priority: P1)

From the list, the user opens `/tickets/<id>` and sees the ticket number as heading, "Opened
<relative time> for order #<order_id>" (order link → `/orders/<order_id>`), and a card with the
subject as title, the status badge on the right, and the description as body.

**Why this priority**: Shows the full description the agent recorded.

**Independent Test**: Mock `GET /api/backend/tickets/3` with a ticket; visit `/tickets/3`; assert heading, order link, subject, status label, description.

**Acceptance Scenarios**:

1. **Given** ticket `{id:3, ticket_number:"TCK-0003", order_id:7, subject:"Order not received", description:"…", status:"in_progress"}`, **When** `/tickets/3` loads, **Then** "TCK-0003", "order #7" (link to `/orders/7`), "Order not received", "In progress" and the description are shown.
2. **Given** the request is in flight, **Then** a single 12-rem-tall skeleton is shown.

---

### Edge Cases

- Error / 404 / 403: `isLoading` false and `ticket` undefined → the skeleton stays forever; no "not found" or error message. [Observed — GAP]
- Non-numeric `[id]` → `Number(id)` is `NaN`, request goes to `/api/backend/tickets/NaN`; no client-side validation.
- No back link to `/tickets`; no actions (status change, comments, close).
- Description is plain text (no Markdown, line breaks collapse).

## Requirements

### Functional Requirements

- **FR-001**: System MUST fetch the ticket via `useTicket(id)` (`["tickets", id]`).
- **FR-002**: System MUST show ticket number, relative open time, order link, subject, status badge, description.
- **FR-003**: System MUST show a skeleton while loading.

### Key Entities

- **Ticket** — see `../contracts/tickets.md`.

## Success Criteria

- **SC-001**: All ticket fields returned by the API are visible on the page.
