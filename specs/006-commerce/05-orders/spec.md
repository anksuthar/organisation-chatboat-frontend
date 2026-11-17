# Feature Specification: Orders

**Feature Branch**: `006-commerce`
**Created**: 2026-11-16
**Status**: Implemented (retroactive)
**Input**: Existing code — `app/(protected)/orders/**`, `components/orders/*`, `hooks/use-orders.ts`

## User Scenarios & Testing

### User Story 1 - View order history (Priority: P1)

A customer opens **My Orders** and sees their past orders.

**Why this priority**: Primary post-purchase self-service.

**Independent Test**: Mock `GET /api/backend/orders` and load `/orders`.

**Acceptance Scenarios**:

1. **Given** orders exist, **Then** a table with heading "My Orders" shows `#{id}`, a status badge, `$total_amount`, relative "Placed" time (e.g. "3 days ago") and a "View order {id}" link to `/orders/{id}`.
2. **Given** no orders, **Then** "You haven't placed any orders yet."
3. **Given** loading, **Then** 3 skeleton rows.

---

### User Story 2 - View order detail (Priority: P1)

**Independent Test**: Mock `GET /api/backend/orders/{id}` and load `/orders/{id}`.

**Acceptance Scenarios**:

1. **Given** an order, **Then** heading "Order #{id}", "Placed {relative time}", a Status card with the badge, a Total card, and a line-item table (Product, Quantity, Unit price).
2. **Given** each status, **Then** the badge label/colour is: Pending (muted), Confirmed (blue), Shipped (amber), Delivered (emerald), Cancelled (destructive).

---

### User Story 3 - Report a problem via chat (Priority: P2)

From the order detail, the customer clicks **Report a problem** and lands in chat with a prefilled message.

**Why this priority**: Hands off to the multi-intent chat agent instead of a bespoke form.

**Independent Test**: Load an order detail, click the button, assert `/chat?prefill=…` and that the chat input contains the message.

**Acceptance Scenarios**:

1. **When** "Report a problem" is clicked, **Then** the user is navigated to `/chat?prefill=` + URL-encoded `My order #{id} shows as {status} but I never received it.` and the chat input is initialised with that text (`app/(protected)/chat/page.tsx` reads `prefill`).

### Edge Cases

- Detail fetch fails or the order belongs to another user: indefinite skeleton, no error.
- List fetch fails: blank table body with no message.
- An unknown status string renders an empty, unstyled badge.
- The prefilled complaint text says "I never received it" regardless of status (including `pending` or `cancelled`). [NEEDS CLARIFICATION: should the message vary by status, or the button be hidden for some statuses?]
- Order items whose product was deleted (`product_id: null`) still render using the stored `product_name`.
- There is no cancel/return action in the UI.

## Requirements

### Functional Requirements

- **FR-001**: The list MUST load from `GET /api/backend/orders` (key `["orders"]`).
- **FR-002**: The detail MUST load from `GET /api/backend/orders/{id}` (key `["orders", id]`).
- **FR-003**: Dates MUST be shown relative to now via `date-fns` `formatDistanceToNow(..., { addSuffix: true })`.
- **FR-004**: Status MUST be shown via `OrderStatusBadge` with a fixed label/colour map for the five `OrderStatus` values.
- **FR-005**: "Report a problem" MUST link to `/chat` with an encoded `prefill` query parameter.
- **FR-006**: The order list MUST be refreshed after checkout (invalidated by `useCheckout`).

### Key Entities

- **OrderSummary / OrderDetail / OrderItem / OrderStatus** — [contracts/orders.md](../contracts/orders.md)

## Success Criteria

- **SC-001**: A newly placed order is visible in "My Orders" immediately after checkout.
- **SC-002**: A customer can start a support conversation about an order in one click from its detail page.

## Assumptions

- Orders are scoped to the current user by the backend; the frontend sends no user identifier.
- Order status changes are made outside this frontend (no admin order management UI exists).
