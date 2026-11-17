# Feature Specification: Cart & Checkout

**Feature Branch**: `006-commerce`
**Created**: 2026-11-16
**Status**: Implemented (retroactive)
**Input**: Existing code — `app/(protected)/cart/page.tsx`, `components/cart/cart-view.tsx`, `hooks/use-cart.ts`, `hooks/use-orders.ts#useCheckout`

## User Scenarios & Testing

### User Story 1 - Review the cart (Priority: P1)

A customer opens **Cart** and sees their server-side cart: each line's product, unit price, quantity and line total, plus the cart total.

**Why this priority**: Required before checkout.

**Independent Test**: Mock `GET /api/backend/cart` and load `/cart`.

**Acceptance Scenarios**:

1. **Given** items, **Then** a table with columns Product, Price, Quantity, Line total and a remove button shows each item, and "Total: ${total_amount}" is shown below.
2. **Given** an item whose product no longer exists (`product_id`/`product_name` null), **Then** the name cell reads "No longer available" (italic), price/line total show "—", and its quantity input is disabled.
3. **Given** an empty cart, **Then** "Your cart is empty." is shown and no Checkout button.
4. **Given** loading, **Then** a single skeleton block is shown.

---

### User Story 2 - Change quantity or remove an item (Priority: P1)

**Independent Test**: Mock `PUT /api/backend/cart/items/{id}` and `DELETE /api/backend/cart/items/{id}`.

**Acceptance Scenarios**:

1. **Given** a line, **When** the quantity input loses focus with a different value, **Then** `PUT cart/items/{id}` is sent with `{ quantity }` (clamped to ≥1) and the cart refetches; no success toast.
2. **Given** the value is unchanged on blur, **Then** no request is sent.
3. **When** "Remove from cart" is clicked, **Then** `DELETE cart/items/{id}` is sent immediately (no confirm), toast "Removed from cart", and the cart refetches.
4. **Given** the backend rejects an update (e.g. insufficient stock), **Then** an error toast appears.

---

### User Story 3 - Check out (Priority: P1)

**Independent Test**: Mock `POST /api/backend/orders` returning `{ id: 42, ... }`; click Checkout; assert navigation to `/orders/42`.

**Acceptance Scenarios**:

1. **Given** a non-empty cart, **When** "Checkout" is clicked, **Then** the button shows "Placing order…" and is disabled, `POST /api/backend/orders` is sent with no body, toast "Order placed" appears, `["orders"]` and `["cart"]` are invalidated, and the user is navigated to `/orders/{id}`.
2. **Given** checkout fails, **Then** an error toast with the backend message appears and the user stays on `/cart`.

### Edge Cases

- Cart fetch fails: the page shows "Your cart is empty." (indistinguishable from a real empty cart).
- Quantity inputs are uncontrolled (`defaultValue`): if an update fails, the input keeps the rejected value until the row re-mounts.
- Quantity has no client-side upper bound; stock limits are enforced only by the backend (UNVERIFIED).
- There is no "Clear cart" control, although `clearCart()` / `useClearCart()` exist.
- Checkout requirements such as shipping details on the profile are not checked client-side. [NEEDS CLARIFICATION: does the backend require a shipping address (see 008-profile-settings) before checkout?]

## Requirements

### Functional Requirements

- **FR-001**: The cart MUST be loaded from `GET /api/backend/cart` (key `["cart"]`).
- **FR-002**: Quantity changes MUST be committed on blur only when changed, clamped to ≥1.
- **FR-003**: Removing an item MUST call `DELETE /api/backend/cart/items/{id}` and toast "Removed from cart".
- **FR-004**: Checkout MUST call `POST /api/backend/orders`, invalidate `["orders"]` and `["cart"]`, toast "Order placed", and navigate to the new order's detail page.
- **FR-005**: Unavailable items (null product) MUST be displayed but not editable (quantity), and remain removable.
- **FR-006**: Prices are displayed verbatim from the backend; the client never computes totals.

### Key Entities

- **Cart / CartItem** — [contracts/cart.md](../contracts/cart.md)
- **OrderSummary** (checkout response) — [contracts/orders.md](../contracts/orders.md)

## Success Criteria

- **SC-001**: A customer with items in the cart reaches their new order's detail page with one click on Checkout.
- **SC-002**: After checkout, the cart page reflects the backend's post-checkout cart without manual reload.

## Assumptions

- The backend clears the cart on successful checkout (frontend only invalidates/refetches).
