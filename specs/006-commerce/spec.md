# Feature Specification: Commerce (Catalogue, Shop, Cart, Orders)

**Feature Branch**: `006-commerce`
**Created**: 2026-11-16
**Status**: Implemented (retroactive spec — documents existing code)
**Input**: Reverse-engineered from the existing frontend code under `app/(protected)/admin/product-categories`, `app/(protected)/admin/products/**`, `app/(protected)/shop/**`, `app/(protected)/cart`, `app/(protected)/orders/**`.

## Purpose

Lets admins maintain a product catalogue (categories, products, product photos) and lets
customers browse that catalogue, manage a server-side cart, check out, and review their
orders. The commerce pages sit alongside the knowledge-base chat: the chat agent also answers
order/product questions, and the order detail page can hand off to chat with a prefilled
complaint message.

## Actors / Roles

| Role | Access in the UI | Enforcement |
|------|------------------|-------------|
| `admin` | `/admin/product-categories`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]` (sidebar "Admin" group) | `middleware.ts` redirects non-admins from `/admin/**` to `/unauthorized` (UX only); FastAPI is the authority |
| `customer` | `/shop`, `/shop/[id]`, `/cart`, `/orders`, `/orders/[id]` (sidebar "Shop" group) | Sidebar only (`components/layout/app-sidebar.tsx`). `middleware.ts` does **not** restrict these routes by role |
| `employee` | No commerce links in the sidebar | Can still reach customer routes by URL; backend decides what is returned |

[NEEDS CLARIFICATION: Should `/shop`, `/cart`, `/orders` be customer-only at the routing layer? Today any authenticated role can open them by URL; only the sidebar hides them.]

## Sub-specifications

| # | Sub-feature | Summary |
|---|-------------|---------|
| 01 | [Product category admin](01-product-category-admin/spec.md) | Admin list / create / edit / delete of product categories in a table + dialog |
| 02 | [Product admin](02-product-admin/spec.md) | Admin product table with category filter, multipart create with photos and upload progress, detail page with edit dialog, photo add/remove, delete |
| 03 | [Shop browse & product detail](03-shop-browse/spec.md) | Customer product grid with debounced search and category filter, product detail with photos and quantity, add-to-cart |
| 04 | [Cart & checkout](04-cart-checkout/spec.md) | Customer cart table with quantity edit / remove, total, checkout that creates an order and redirects to it |
| 05 | [Orders](05-orders/spec.md) | Customer order history table and order detail with status badge, line items, and "Report a problem" chat hand-off |

## Cross-cutting Requirements

- **CR-001**: All commerce data MUST be fetched through `services/{product-categories,products,cart,orders}.ts` → `/api/backend/*` (BFF proxy). Product photos MUST be loaded via `/api/backend/products/{id}/images/{imageId}/file` so the session cookie is converted to a Bearer token server-side.
- **CR-002**: Every mutation MUST invalidate its React Query key (`["product-categories"]`, `["products"]`, `["cart"]`, `["orders"]`); checkout MUST invalidate both `["orders"]` and `["cart"]`.
- **CR-003**: Every mutation failure MUST surface as a `sonner` error toast carrying the backend `detail` message (or HTTP status text) via `ApiError` in `services/api-client.ts`.
- **CR-004**: Prices and totals are rendered as `$` + the backend's decimal string verbatim (no client-side formatting or arithmetic).
- **CR-005**: Admin forms MUST use react-hook-form + zod (`product-category-form-dialog.tsx`, `product-upload-form.tsx`, `product-edit-dialog.tsx`).

## Success Criteria

- **SC-001**: An admin can create a category and a product with photos, and the product appears in the shop grid for customers without a page reload after cache invalidation.
- **SC-002**: A customer can go from `/shop` to a placed order (`/orders/{id}`) in four interactions: add to cart → open cart → Checkout → land on order detail.
- **SC-003**: Every user story in sub-specs 01–05 has a Playwright test with mocked `/api/backend/*` (currently **not met** — see each `tasks.md` Gap summary).

## Assumptions

- Currency is implicitly USD (`$` prefix hard-coded); no multi-currency support.
- Stock checks, price snapshots at checkout, and role enforcement are performed by the backend; the frontend only disables buttons for `stock_quantity <= 0`.
- Contracts in `contracts/` are reconstructed from frontend code only (no Playwright mocks exist for these endpoints); they have not been diffed against the backend OpenAPI.
