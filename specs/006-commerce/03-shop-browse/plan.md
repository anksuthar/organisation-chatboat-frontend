# Implementation Plan: Shop Browse & Product Detail

**Branch**: `006-commerce` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

Customer-facing grid and detail views that reuse the admin `products` hooks for reads and the
cart hooks for the add-to-cart mutation.

## Files Involved

| Layer | Path |
|-------|------|
| Routes | `app/(protected)/shop/page.tsx`, `app/(protected)/shop/[id]/page.tsx` (awaits `params`, `Number(id)`) |
| Components | `components/shop/shop-grid.tsx`, `components/shop/product-card.tsx`, `components/shop/product-detail-view.tsx` |
| Hooks | `hooks/use-products.ts` (`useProducts`, `useProduct`), `hooks/use-product-categories.ts` (`useProductCategories`), `hooks/use-cart.ts` (`useAddCartItem`) |
| Services | `services/products.ts` (`listProducts`, `getProduct`, `productImageUrl`), `services/cart.ts` (`addCartItem`) |
| Types | `types/product.ts`, `types/product-category.ts`, `types/cart.ts` |
| Nav | `components/layout/app-sidebar.tsx` (`customerNavItems` → "Shop") |

## State & Data Flow

- `ShopGrid`: `query` (input value) and `search` (debounced via `setTimeout` in a ref, 300 ms) plus `categoryFilter`. Key `["products", categoryId|"all", q]` so each filter combination is cached separately (30 s stale time).
- `ProductCard`: own `useAddCartItem()` instance per card → `{ product_id, quantity: 1 }`.
- `ProductDetailView`: local `quantity` state (≥1) → `useAddCartItem().mutate({ product_id, quantity })`.
- Add-to-cart success invalidates `["cart"]`, so `/cart` is fresh on next visit.

## Error / Loading Handling

- Grid: 8 skeletons; "No products found."; query error not rendered.
- Detail: skeleton while `isLoading || !product` (also stuck on error).
- Add-to-cart: button disabled while pending; error toast from hook.

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF | PASS | Reads and image URLs via `/api/backend/*` |
| II. Layered | PASS (note) | Reuses existing hooks; the detail quantity is a bare controlled `Input`, not an RHF form (single field) |
| III. Contract-First | VIOLATION | Contracts reconstructed retroactively ([products](../contracts/products.md), [cart](../contracts/cart.md)) |
| IV. E2E per story | VIOLATION | No shop tests |
| V. Base UI | PASS | Category `Select` handles `null` (`value ?? "all"`) |
| VI. Simplicity | PASS | No new state store; debounce is a local ref |
