# Contract: Categories

**Source of truth for this document**: `services/categories.ts`, `types/category.ts`,
`services/api-client.ts`, Playwright mocks in `tests/e2e/categories.spec.ts`,
`tests/e2e/documents.spec.ts`, `tests/e2e/role-gating.spec.ts`.
Not cross-checked against the backend OpenAPI (`/docs`) in this pass — items marked
**UNVERIFIED** are not visible in frontend code.

Browser calls `/api/backend/<path>`; the BFF proxy (`app/api/backend/[...path]/route.ts`)
forwards to `${BACKEND_URL}/api/v1/<path>` with `Authorization: Bearer <session cookie>` and
passes query string, status and body through unchanged.

## Shared types

```ts
interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string; // ISO-8601
}
interface CategoryCreateInput { name: string; description?: string }
interface CategoryUpdateInput { name?: string; description?: string }
```

## Error handling (all endpoints)

`apiFetch` treats any non-2xx as an error: it throws `ApiError(status, message)` where
`message = body.detail ?? response.statusText` (falls back to `statusText` if the body is not
JSON). No status code is handled specially (no 401 redirect, no 404 branch, no 409/422 field
mapping); hooks show `error.message` in a toast.

- Error body shape: `{ "detail": string }` assumed. If FastAPI returns a 422 validation error
  (`detail` is an array), the toast would show the array coerced to a string —
  **UNVERIFIED** whether backend returns 422 for these endpoints.
- Authorisation errors (401/403 for non-admins): **UNVERIFIED (not visible in frontend code)**.

## Endpoints

### List categories

- **Call**: `GET /api/backend/categories` → backend `GET /api/v1/categories`
- **Request**: none
- **Response 200**: `Category[]` (mocked as 200 JSON array; `[]` when empty)
- **Used by**: `listCategories()` → `useCategories()`
- **Who may call**: any authenticated role? **UNVERIFIED** — the frontend only calls it from
  admin pages.

### Create category

- **Call**: `POST /api/backend/categories` → backend `POST /api/v1/categories`
- **Request**: `Content-Type: application/json`, body `CategoryCreateInput`
  (frontend always sends `description`, as `""` when left blank)
- **Response 201**: `Category` (mock returns 201; frontend accepts any 2xx)
- **Errors**: duplicate-name behaviour / status **UNVERIFIED**

### Update category

- **Call**: `PUT /api/backend/categories/{id}` → backend `PUT /api/v1/categories/{id}`
- **Request**: JSON `CategoryUpdateInput` (frontend always sends both `name` and `description`)
- **Response 200**: updated `Category`
- **Errors**: 404 for unknown id **UNVERIFIED**

### Delete category

- **Call**: `DELETE /api/backend/categories/{id}` → backend `DELETE /api/v1/categories/{id}`
- **Request**: none
- **Response 204**: empty body (`apiFetch` returns `undefined` for 204)
- **Errors**: behaviour when documents still reference the category (cascade / 409 / 400)
  **UNVERIFIED (not visible in frontend code)**
