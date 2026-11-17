# Implementation Plan: Cart & Checkout

**Branch**: `006-commerce` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

One client component (`CartView`) renders the server-side cart, issues per-line update/remove
mutations, and triggers checkout, which lives in the orders hook module.

## Files Involved

| Layer | Path |
|-------|------|
| Route | `app/(protected)/cart/page.tsx` |
| Component | `components/cart/cart-view.tsx` |
| Hooks | `hooks/use-cart.ts` — `useCart`, `useUpdateCartItem`, `useRemoveCartItem` (+ unused `useClearCart`); `hooks/use-orders.ts` — `useCheckout` |
| Services | `services/cart.ts` (`getCart`, `updateCartItem`, `removeCartItem`, unused `clearCart`), `services/orders.ts` (`checkout`) |
| Types | `types/cart.ts`, `types/order.ts` |
| Nav | `components/layout/app-sidebar.tsx` (`customerNavItems` → "Cart") |

## State & Data Flow

- `useCart()` → `GET /api/backend/cart`, key `["cart"]`.
- Quantity: uncontrolled `<Input defaultValue>`; `onBlur` → `updateItem.mutate({ itemId, input: { quantity } })` → invalidate `["cart"]`.
- Remove: `removeItem.mutate(item.id)` → invalidate `["cart"]` + toast.
- Checkout: `checkout.mutateAsync()` → `POST /api/backend/orders` → invalidate `["orders"]`, `["cart"]` → `router.push("/orders/{id}")`.

## Error / Loading Handling

- Loading: one skeleton. Query error: falls through to empty-cart message.
- Mutation errors: hook toasts. `handleCheckout` does not catch the `mutateAsync` rejection (no navigation; unhandled rejection logged).

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF | PASS | `apiFetch` only |
| II. Layered | PASS (note) | Checkout lives in `hooks/use-orders.ts` and invalidates the cart key (duplicated `CART_KEY` constant). Quantity inputs are not RHF forms |
| III. Contract-First | VIOLATION | [cart](../contracts/cart.md) / [orders](../contracts/orders.md) reconstructed retroactively |
| IV. E2E per story | VIOLATION | No cart/checkout tests |
| V. Base UI | PASS | No `Select`/`asChild` |
| VI. Simplicity | VIOLATION (minor) | `clearCart` / `useClearCart` are unused code |
