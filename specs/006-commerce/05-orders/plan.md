# Implementation Plan: Orders

**Branch**: `006-commerce` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

Read-only order history and detail for customers, with a status badge component and a link
into chat for issue reporting.

## Files Involved

| Layer | Path |
|-------|------|
| Routes | `app/(protected)/orders/page.tsx`, `app/(protected)/orders/[id]/page.tsx` (awaits `params`, `Number(id)`) |
| Components | `components/orders/order-table.tsx`, `components/orders/order-detail.tsx`, `components/orders/order-status-badge.tsx` |
| Hooks | `hooks/use-orders.ts` — `useOrders`, `useOrder` (and `useCheckout`, see 04-cart-checkout) |
| Service | `services/orders.ts` |
| Types | `types/order.ts` |
| Chat hand-off target | `app/(protected)/chat/page.tsx` (reads `searchParams.get("prefill")` → `ChatInput initialValue`) |
| Nav | `components/layout/app-sidebar.tsx` (`customerNavItems` → "My Orders") |
| Libraries | `date-fns` (`formatDistanceToNow`) |

## State & Data Flow

- `OrderTable`: `useOrders()` → `GET /api/backend/orders`, key `["orders"]`.
- `OrderDetail`: `useOrder(id)` → `GET /api/backend/orders/{id}`, key `["orders", id]`.
- "Report a problem": `<Button render={<Link href="/chat?prefill=…" />}>` — client navigation, no API call.
- No mutations in this sub-feature.

## Error / Loading Handling

- List: skeleton rows; empty message; query error not rendered.
- Detail: skeleton while `isLoading || !order` (also stuck on error).

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF | PASS | `apiFetch` only |
| II. Layered | PASS | page → component → hook → service |
| III. Contract-First | VIOLATION | [contracts/orders.md](../contracts/orders.md) reconstructed retroactively |
| IV. E2E per story | VIOLATION | No orders tests |
| V. Base UI | PASS | `render` prop for the Link buttons |
| VI. Simplicity | PASS | Reuses chat via query string instead of a new support form |
