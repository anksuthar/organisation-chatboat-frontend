# Implementation Plan: Commerce (Catalogue, Shop, Cart, Orders)

**Branch**: `006-commerce` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-commerce/spec.md` (retroactive — code already exists)

## Summary

Five client-rendered page groups (admin categories, admin products, shop, cart, orders) built on
the project's standard layering. Each route's `page.tsx` is a thin server component that renders
one `"use client"` component from `components/{product-categories,products,shop,cart,orders}/`.
Those components call React Query hooks in `hooks/use-{product-categories,products,cart,orders}.ts`,
which call `services/*.ts`, which hit `/api/backend/*` (the BFF proxy in
`app/api/backend/[...path]/route.ts`, which forwards to `${BACKEND_URL}/api/v1/*` with the
session cookie as a Bearer token).

## Technical Context

**Language/Version**: TypeScript (strict), React 19.1, Next.js 15.5 App Router
**Primary Dependencies**: `@tanstack/react-query` 5, `react-hook-form` 7 + `zod` 4, `@base-ui/react`-based shadcn/ui, `sonner`, `axios` (multipart upload progress only), `react-dropzone`, `date-fns`, `lucide-react`
**Storage**: None client-side; cart and orders are server-side (backend)
**Testing**: Playwright E2E with mocked `/api/backend/*` — **no commerce tests exist yet**
**Target Platform**: Modern browsers via Next.js server
**Project Type**: Web frontend (BFF) for a FastAPI backend
**Performance Goals**: Shop search debounced 300 ms; React Query `staleTime` 30 s, `retry` 1 (`app/providers.tsx`)
**Constraints**: JWT never exposed to client JS; all calls through `/api/backend/*`
**Scale/Scope**: 9 routes, 14 components, 4 hooks modules, 4 services, 4 type modules

## Architecture & Data Flow

```text
page.tsx (server, thin) ──► components/<area>/*.tsx ("use client")
                               │
                               ▼
                  hooks/use-<resource>.ts (React Query: useQuery / useMutation + invalidate + toast)
                               │
                               ▼
                  services/<resource>.ts ──► services/api-client.ts apiFetch()  ──► fetch("/api/backend/<path>")
                               │                                                      (ApiError on !ok, undefined on 204)
                               └──► axios.post("/api/backend/products/upload")  (upload progress)
                                                                               │
                                                                               ▼
                         app/api/backend/[...path]/route.ts ──► ${BACKEND_URL}/api/v1/<path>  (Bearer from httpOnly cookie)
```

Query keys: `["product-categories"]`; `["products", categoryId|"all", q]` for lists and
`["products", id]` for detail (all invalidated by prefix `["products"]`); `["cart"]`;
`["orders"]`, `["orders", id]`.

Cross-area links: shop and admin product forms read `useProductCategories()`;
`useCheckout()` (in `hooks/use-orders.ts`) invalidates `["cart"]`; order detail links to
`/chat?prefill=…` which `app/(protected)/chat/page.tsx` reads as the chat input's initial value.

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security Boundary | PASS | All calls use `/api/backend/*` (`apiFetch`, `axios.post("/api/backend/products/upload")`, `<img src="/api/backend/products/.../file">`). No token access in client code. |
| II. Layered Data Access | PASS (note) | Pages → components → hooks → services. `services/products.ts#uploadProduct` uses `axios` directly instead of `api-client` (same pattern as `services/documents.ts`) to get upload progress; still inside `services/`. Shop/cart quantity inputs are single uncontrolled inputs, not react-hook-form forms. |
| III. Contract-First | VIOLATION | No `contracts/` existed before this retroactive spec and no backend spec is cross-linked. `contracts/*.md` here are reconstructed from frontend code; unknowns marked UNVERIFIED. |
| IV. Test Every User Story | VIOLATION | Zero Playwright tests touch any commerce route; `tests/e2e/role-gating.spec.ts` only covers `/admin`. |
| V. Pinned Stack & Base UI | VIOLATION (minor) | `render` prop used correctly (no `asChild`). Filter `Select`s handle `null` (`value ?? "all"`), but the category/status `Select`s in `product-upload-form.tsx` and `product-edit-dialog.tsx` pass `field.onChange` directly, so a `null` would reach the zod schema unhandled. |
| VI. Simplicity | PASS (note) | No new global state or deps beyond existing. `clearCart()` / `useClearCart()` are implemented but unused by any UI (dead code). |

## Project Structure

### Documentation (this feature)

```text
specs/006-commerce/
├── spec.md
├── plan.md
├── contracts/
│   ├── product-categories.md
│   ├── products.md
│   ├── cart.md
│   └── orders.md
├── 01-product-category-admin/ {spec,plan,tasks}.md
├── 02-product-admin/          {spec,plan,tasks}.md
├── 03-shop-browse/            {spec,plan,tasks}.md
├── 04-cart-checkout/          {spec,plan,tasks}.md
└── 05-orders/                 {spec,plan,tasks}.md
```

### Source Code (repository root)

```text
app/(protected)/
├── admin/product-categories/page.tsx
├── admin/products/page.tsx
├── admin/products/new/page.tsx
├── admin/products/[id]/page.tsx
├── shop/page.tsx
├── shop/[id]/page.tsx
├── cart/page.tsx
├── orders/page.tsx
└── orders/[id]/page.tsx
components/
├── product-categories/{product-category-table,product-category-form-dialog}.tsx
├── products/{product-table,product-upload-form,product-detail,product-edit-dialog}.tsx
├── shop/{shop-grid,product-card,product-detail-view}.tsx
├── cart/cart-view.tsx
├── orders/{order-table,order-detail,order-status-badge}.tsx
└── layout/app-sidebar.tsx            # admin + customer nav entries
hooks/use-{product-categories,products,cart,orders}.ts
services/{product-categories,products,cart,orders,api-client}.ts
types/{product-category,product,cart,order}.ts
middleware.ts                          # /admin/** role redirect only
app/api/backend/[...path]/route.ts     # BFF proxy
tests/e2e/                             # no commerce specs yet
```

**Structure Decision**: Existing single Next.js app; commerce follows the same
page → component → hook → service layout as the documents/categories features.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `axios` in `services/products.ts` instead of `api-client` | `fetch` exposes no upload-progress events; progress bar is shown during multipart upload | `apiFetch` cannot report progress |
| III / IV violations | Not justified — tracked as GAP tasks in each sub-feature `tasks.md` | — |
