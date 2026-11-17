# Contract: Orders

**Sources**: `services/orders.ts`, `types/order.ts`. No Playwright mocks exist for these endpoints.
Browser path is `/api/backend/<path>`; proxied to `${BACKEND_URL}/api/v1/<path>`.

## Shared types

```ts
type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
interface OrderItem { product_id: number | null; product_name: string; quantity: number; unit_price: string }
interface OrderSummary { id: number; status: OrderStatus; total_amount: string; created_at: string }
interface OrderDetail extends OrderSummary { items: OrderItem[] }
```

A status outside `OrderStatus` would render an unstyled, empty badge (`STATUS_LABELS[status]` is undefined).

## Error handling

Non-2xx → `ApiError(status, body.detail ?? statusText)` → `toast.error` (mutations only; query errors are not displayed). Checkout failure codes (empty cart, insufficient stock, missing shipping details) and 404 for another user's order: UNVERIFIED (not visible in frontend code).

## GET /api/backend/orders

- **Caller**: `listOrders()` → `useOrders()`
- **Response 200**: `OrderSummary[]` — scoped to the current user by the backend (UNVERIFIED; frontend sends no user filter). Sort order UNVERIFIED; rendered as returned.

## GET /api/backend/orders/{id}

- **Caller**: `getOrder(id)` → `useOrder(id)`
- **Response 200**: `OrderDetail`

## POST /api/backend/orders  (checkout)

- **Caller**: `checkout()` → `useCheckout()`
- **Request**: no body — the backend builds the order from the user's current server-side cart
- **Response**: `OrderSummary` (frontend uses `id` to navigate to `/orders/{id}`)
- Whether the backend empties the cart on success: assumed (frontend invalidates `["cart"]`), UNVERIFIED.
