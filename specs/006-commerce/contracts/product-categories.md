# Contract: Product Categories

**Sources**: `services/product-categories.ts`, `types/product-category.ts`. No Playwright mocks exist for these endpoints.
Browser path is `/api/backend/<path>`; the proxy forwards to `${BACKEND_URL}/api/v1/<path>` with `Authorization: Bearer <session cookie>`.

## Shared types

```ts
interface ProductCategory { id: number; name: string; description: string | null; created_at: string }
```

## Error handling (all endpoints)

Any non-2xx response → `ApiError(status, body.detail ?? statusText)` (`services/api-client.ts`) → `toast.error(message)` in the hook. The frontend does not branch on specific status codes. Specific codes returned by the backend (401/403/404/409/422): UNVERIFIED (not visible in frontend code).

## GET /api/backend/product-categories

- **Caller**: `listProductCategories()` → `useProductCategories()`
- **Request**: none
- **Response 200**: `ProductCategory[]`
- **Auth/role**: used by admin pages and by the customer shop filter, so the backend must allow at least `admin` and `customer`. Exact role policy UNVERIFIED.

## POST /api/backend/product-categories

- **Caller**: `createProductCategory(input)` → `useCreateProductCategory()`
- **Request** (JSON): `{ name: string; description?: string }` — the form always sends `description` (empty string when blank)
- **Response**: `ProductCategory` (status code UNVERIFIED; any 2xx accepted)

## PUT /api/backend/product-categories/{id}

- **Caller**: `updateProductCategory(id, input)` → `useUpdateProductCategory()`
- **Request** (JSON): `{ name?: string; description?: string }` — the form always sends both fields
- **Response**: `ProductCategory`

## DELETE /api/backend/product-categories/{id}

- **Caller**: `deleteProductCategory(id)` → `useDeleteProductCategory()`
- **Request**: none
- **Response**: no body expected (204 handled → `undefined`; a 200 with JSON would also be accepted)
- **Side effect claimed by UI copy**: "Products in this category become uncategorized rather than being deleted." — UNVERIFIED (not visible in frontend code)
