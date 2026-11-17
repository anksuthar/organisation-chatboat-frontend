# Tasks: Shop Browse & Product Detail

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/products.md](../contracts/products.md), [../contracts/cart.md](../contracts/cart.md)

**Format**: `[ID] [P?] [Story] Description` — `[X]` = verified present in code; `GAP:` = required by spec/constitution but missing.

## Phase 1: Foundational

- [X] T001 [P] `listProducts({ categoryId, q })`, `getProduct`, `productImageUrl` in services/products.ts
- [X] T002 [P] `addCartItem` in services/cart.ts and `useAddCartItem` (invalidates `["cart"]`, toast) in hooks/use-cart.ts
- [X] T003 Add "Shop" to `customerNavItems` in components/layout/app-sidebar.tsx

## Phase 2: User Story 1 - Browse, search, filter (P1)

- [X] T004 [US1] Route component in app/(protected)/shop/page.tsx
- [X] T005 [US1] Grid with 300 ms debounced search, category select (`null` → "all"), skeleton and empty states in components/shop/shop-grid.tsx
- [X] T006 [P] [US1] Product card with placeholder tile, links, price, out-of-stock badge in components/shop/product-card.tsx
- [ ] T007 [US1] GAP: Playwright test for grid render, debounced `?q=` and `?category_id=` requests in tests/e2e/shop.spec.ts
- [ ] T008 [US1] GAP: Render an error state when `useProducts()` fails in components/shop/shop-grid.tsx

## Phase 3: User Story 2 - Product detail (P1)

- [X] T009 [US2] Route component awaiting `params` in app/(protected)/shop/[id]/page.tsx
- [X] T010 [US2] Detail view with proxied images, description, stock line / out-of-stock badge in components/shop/product-detail-view.tsx
- [ ] T011 [US2] GAP: Playwright test for detail render incl. out-of-stock state in tests/e2e/shop.spec.ts
- [ ] T012 [US2] GAP: Error / not-found state instead of indefinite skeleton in components/shop/product-detail-view.tsx

## Phase 4: User Story 3 - Add to cart (P1)

- [X] T013 [US3] Card "Add to cart" sends quantity 1, disabled when out of stock or pending in components/shop/product-card.tsx
- [X] T014 [US3] Detail quantity input (≥1) and "Add to cart" in components/shop/product-detail-view.tsx
- [ ] T015 [US3] GAP: Playwright test asserting `POST /api/backend/cart/items` payload and "Added to cart" toast in tests/e2e/shop.spec.ts
- [ ] T016 [US3] GAP: Clamp detail quantity to `stock_quantity` on typed input (only the HTML `max` attribute applies today) in components/shop/product-detail-view.tsx

## Phase 5: Cross-cutting

- [ ] T017 GAP: Decide/implement customer-only routing for `/shop` (middleware gates only `/admin`) and add role-gating test in middleware.ts / tests/e2e/role-gating.spec.ts
- [ ] T018 GAP: Confirm with backend whether `GET products` hides inactive products for customers and document in specs/006-commerce/contracts/products.md

## Gap summary

- T007, T011, T015: no E2E coverage for any user story (Constitution IV).
- T008, T012: query errors render nothing / endless skeleton.
- T016: over-stock quantity can be typed and sent.
- T017: `/shop` reachable by any role via URL; no role-gating test.
- T018: inactive-product visibility unverified (Constitution III).
