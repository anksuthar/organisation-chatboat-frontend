# Contract: Cart

**Sources**: `services/cart.ts`, `types/cart.ts`. No Playwright mocks exist for these endpoints.
Browser path is `/api/backend/<path>`; proxied to `${BACKEND_URL}/api/v1/<path>`. The cart is per authenticated user (identified by the backend from the Bearer token).

## Shared types

```ts
interface CartItem {
  id: number;
  product_id: number | null;    // null => product no longer available (UI shows "No longer available")
  product_name: string | null;
  unit_price: string | null;
  quantity: number;
  line_total: string | null;
}
interface Cart { items: CartItem[]; total_amount: string }
```

## Error handling

Non-2xx → `ApiError(status, body.detail ?? statusText)` → `toast.error`. Insufficient-stock, invalid quantity, or unknown-item status codes: UNVERIFIED (not visible in frontend code).

## GET /api/backend/cart

- **Caller**: `getCart()` → `useCart()`
- **Response 200**: `Cart` (an empty cart is expected as `{ items: [], total_amount: "..." }`; whether an empty cart can be 404 instead is UNVERIFIED)

## POST /api/backend/cart/items

- **Caller**: `addCartItem({ product_id, quantity })` → `useAddCartItem()`
- **Request** (JSON): `{ product_id: number; quantity: number }` — quantity is 1 from the shop card, ≥1 from product detail
- **Response**: `Cart` (frontend ignores body and refetches)
- Whether adding an existing product merges quantities: UNVERIFIED

## PUT /api/backend/cart/items/{itemId}

- **Caller**: `updateCartItem(itemId, { quantity })` → `useUpdateCartItem()`
- **Request** (JSON): `{ quantity: number }` (≥1, clamped client-side)
- **Response**: `Cart`

## DELETE /api/backend/cart/items/{itemId}

- **Caller**: `removeCartItem(itemId)` → `useRemoveCartItem()`
- **Response**: no body expected (204)

## DELETE /api/backend/cart

- **Caller**: `clearCart()` → `useClearCart()` — **not used by any UI component**
- **Response**: no body expected (204)
