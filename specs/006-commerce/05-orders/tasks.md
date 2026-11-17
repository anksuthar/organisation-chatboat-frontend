# Tasks: Orders

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/orders.md](../contracts/orders.md)

**Format**: `[ID] [P?] [Story] Description` — `[X]` = verified present in code; `GAP:` = required by spec/constitution but missing.

## Phase 1: Foundational

- [X] T001 [P] Define `OrderStatus`, `OrderItem`, `OrderSummary`, `OrderDetail` in types/order.ts
- [X] T002 [P] `listOrders`, `getOrder` in services/orders.ts
- [X] T003 `useOrders`, `useOrder` in hooks/use-orders.ts
- [X] T004 [P] Status label/colour map in components/orders/order-status-badge.tsx
- [X] T005 Add "My Orders" to `customerNavItems` in components/layout/app-sidebar.tsx

## Phase 2: User Story 1 - Order history (P1)

- [X] T006 [US1] Route component in app/(protected)/orders/page.tsx
- [X] T007 [US1] Table with badge, total, relative date, view link, skeleton and empty states in components/orders/order-table.tsx
- [ ] T008 [US1] GAP: Playwright test for order list and empty state with mocked `GET /api/backend/orders` in tests/e2e/orders.spec.ts
- [ ] T009 [US1] GAP: Render an error state when `useOrders()` fails in components/orders/order-table.tsx

## Phase 3: User Story 2 - Order detail (P1)

- [X] T010 [US2] Route component awaiting `params` in app/(protected)/orders/[id]/page.tsx
- [X] T011 [US2] Header, status/total cards, line-item table in components/orders/order-detail.tsx
- [ ] T012 [US2] GAP: Playwright test for order detail and each status badge label (use `{ exact: true }`) in tests/e2e/orders.spec.ts
- [ ] T013 [US2] GAP: Error / not-found state instead of indefinite skeleton in components/orders/order-detail.tsx

## Phase 4: User Story 3 - Report a problem (P2)

- [X] T014 [US3] "Report a problem" link with encoded `prefill` in components/orders/order-detail.tsx
- [X] T015 [US3] Chat page reads `prefill` into `ChatInput initialValue` in app/(protected)/chat/page.tsx
- [ ] T016 [US3] GAP: Playwright test that clicking "Report a problem" lands on `/chat` with the prefilled input in tests/e2e/orders.spec.ts

## Phase 5: Cross-cutting

- [ ] T017 GAP: Role-gating decision + test for `/orders` (any role can open it by URL) in middleware.ts / tests/e2e/role-gating.spec.ts
- [ ] T018 GAP: Verify orders contract (ownership 404/403, sort order, status enum) against backend OpenAPI in specs/006-commerce/contracts/orders.md

## Gap summary

- T008, T012, T016: no E2E coverage for any user story (Constitution IV).
- T009, T013: query errors render blank table / endless skeleton.
- T017: `/orders` not role-gated, no test.
- T018: contract unverified (Constitution III).
