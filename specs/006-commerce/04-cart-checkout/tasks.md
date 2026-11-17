# Tasks: Cart & Checkout

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/cart.md](../contracts/cart.md), [../contracts/orders.md](../contracts/orders.md)

**Format**: `[ID] [P?] [Story] Description` — `[X]` = verified present in code; `GAP:` = required by spec/constitution but missing.

## Phase 1: Foundational

- [X] T001 [P] Define `Cart`, `CartItem`, `CartItemCreateInput`, `CartItemUpdateInput` in types/cart.ts
- [X] T002 [P] `getCart`, `addCartItem`, `updateCartItem`, `removeCartItem`, `clearCart` in services/cart.ts
- [X] T003 Cart hooks with `["cart"]` invalidation and toasts in hooks/use-cart.ts
- [X] T004 `checkout()` in services/orders.ts and `useCheckout` invalidating `["orders"]` + `["cart"]` in hooks/use-orders.ts
- [X] T005 Add "Cart" to `customerNavItems` in components/layout/app-sidebar.tsx

## Phase 2: User Story 1 - Review the cart (P1)

- [X] T006 [US1] Route component in app/(protected)/cart/page.tsx
- [X] T007 [US1] Cart table, "No longer available" lines, total, empty and loading states in components/cart/cart-view.tsx
- [ ] T008 [US1] GAP: Playwright test for cart render, unavailable line and empty cart with mocked `GET /api/backend/cart` in tests/e2e/cart.spec.ts
- [ ] T009 [US1] GAP: Distinguish fetch error from empty cart (currently shows "Your cart is empty.") in components/cart/cart-view.tsx

## Phase 3: User Story 2 - Update / remove (P1)

- [X] T010 [US2] On-blur quantity update (≥1, only when changed) and remove button in components/cart/cart-view.tsx
- [ ] T011 [US2] GAP: Playwright test for quantity PUT on blur and remove DELETE in tests/e2e/cart.spec.ts
- [ ] T012 [US2] GAP: Reset the quantity input to the server value after a failed update (input is uncontrolled) in components/cart/cart-view.tsx

## Phase 4: User Story 3 - Checkout (P1)

- [X] T013 [US3] Checkout button with pending label and redirect to `/orders/{id}` in components/cart/cart-view.tsx
- [ ] T014 [US3] GAP: Playwright test for checkout → "Order placed" → `/orders/{id}` and failure toast in tests/e2e/cart.spec.ts
- [ ] T015 [US3] GAP: Catch `checkout.mutateAsync()` rejection in `handleCheckout` in components/cart/cart-view.tsx

## Phase 5: Cross-cutting

- [ ] T016 GAP: Either expose a "Clear cart" action or remove unused `clearCart` / `useClearCart` (Constitution VI) in services/cart.ts, hooks/use-cart.ts
- [ ] T017 GAP: Confirm checkout preconditions (shipping details, stock) and error codes with backend; record in specs/006-commerce/contracts/orders.md
- [ ] T018 GAP: Role-gating decision + test for `/cart` (any role can open it by URL) in middleware.ts / tests/e2e/role-gating.spec.ts

## Gap summary

- T008, T011, T014: no E2E coverage for any user story (Constitution IV).
- T009: fetch errors masquerade as an empty cart.
- T012: stale quantity shown after failed update.
- T015: unhandled rejection on failed checkout.
- T016: dead `clearCart` code path.
- T017: checkout contract/preconditions unverified (Constitution III).
- T018: `/cart` not role-gated, no test.
