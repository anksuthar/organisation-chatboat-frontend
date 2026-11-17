# Contract: Products

**Sources**: `services/products.ts`, `types/product.ts`. No Playwright mocks exist for these endpoints.
Browser path is `/api/backend/<path>`; proxied to `${BACKEND_URL}/api/v1/<path>`.

## Shared types

```ts
interface ProductImage { id: number; image_path: string; display_order: number }
interface ProductItem {
  id: number; name: string; description: string | null;
  price: string;            // decimal as string, rendered verbatim with "$"
  category_id: number | null; sku: string; stock_quantity: number;
  is_active: boolean; created_at: string;
}
interface ProductDetail extends ProductItem { images: ProductImage[] }
```

## Error handling

- `apiFetch` endpoints: non-2xx → `ApiError(status, body.detail ?? statusText)` → `toast.error`.
- `POST products/upload` uses `axios`; failures surface axios' own `error.message` (e.g. "Request failed with status code 400"), **not** the backend `detail`.
- Specific status codes (404 on missing product, 409 on duplicate SKU, 422 validation, 403 non-admin): UNVERIFIED (not visible in frontend code).

## GET /api/backend/products?category_id={n}&q={text}

- **Caller**: `listProducts({ categoryId?, q? })` → `useProducts(params)`
- **Query**: `category_id` (omitted when "all"), `q` (omitted when empty). Both optional.
- **Response 200**: `ProductItem[]` (no images)
- **Filtering of inactive products for customers**: UNVERIFIED — the frontend renders whatever is returned.

## GET /api/backend/products/{id}

- **Caller**: `getProduct(id)` → `useProduct(id)` (admin detail and shop detail)
- **Response 200**: `ProductDetail`

## GET /api/backend/products/{productId}/images/{imageId}/file

- **Caller**: `productImageUrl()` used as `<img src>` (browser GET, not fetch)
- **Response**: image bytes; content type UNVERIFIED (upload accepts JPEG/PNG/WebP)

## POST /api/backend/products/upload  (multipart/form-data)

- **Caller**: `uploadProduct({ input, images, onProgress })` → `useUploadProduct()`
- **Form fields**: `name` (required), `description` (only if non-empty), `price` (string), `sku`, `stock_quantity` (string of int), `category_id` (only if set), `images` (repeated file part, 0..n)
- **Response**: `ProductItem`

## PUT /api/backend/products/{id}

- **Caller**: `updateProduct(id, input)` → `useUpdateProduct()`
- **Request** (JSON): `{ name?, description?, price?, stock_quantity?, category_id?, is_active? }`. The edit dialog sends `name`, `price`, `stock_quantity`, `is_active` always; `category_id` only when selected; never `description`.
- **Response**: `ProductItem`
- How the backend clears `category_id` (e.g. explicit `null`): UNVERIFIED; the frontend never sends `null`.

## POST /api/backend/products/{id}/images  (multipart/form-data)

- **Caller**: `addProductImages(id, files)` → `useAddProductImages()`
- **Form fields**: `images` (repeated file part)
- **Response**: `ProductImage[]` (frontend ignores the body and refetches)

## DELETE /api/backend/products/{productId}/images/{imageId}

- **Caller**: `removeProductImage()` → `useRemoveProductImage()`
- **Response**: no body expected (204)

## DELETE /api/backend/products/{id}

- **Caller**: `deleteProduct(id)` → `useDeleteProduct()`
- **Response**: no body expected (204)
- UI copy claims photos are removed and past orders are unaffected — UNVERIFIED.
