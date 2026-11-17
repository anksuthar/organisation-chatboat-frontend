# Contract: Documents

**Source of truth for this document**: `services/documents.ts`, `types/document.ts`,
`services/api-client.ts`, Playwright mocks in `tests/e2e/documents.spec.ts` and
`tests/e2e/role-gating.spec.ts`. Not cross-checked against the backend OpenAPI (`/docs`) in this
pass — items marked **UNVERIFIED** are not visible in frontend code.

Browser calls `/api/backend/<path>`; `app/api/backend/[...path]/route.ts` forwards to
`${BACKEND_URL}/api/v1/<path>` (query string preserved, request body streamed unbuffered, status
and body passed through) with `Authorization: Bearer <session cookie>`.

## Shared types

```ts
type DocumentStatus = "pending" | "processing" | "processed" | "failed";

interface DocumentItem {
  id: number;
  title: string;
  filename: string;
  category_id: number;
  uploaded_by: number | null;
  total_pages: number | null;   // null until processed (per mock)
  status: DocumentStatus;
  error_message: string | null; // populated when status === "failed"
  created_at: string;           // ISO-8601
}

interface Chunk { id: number; page_number: number; chunk_index: number; chunk_text: string }
interface DocumentDetail extends DocumentItem { chunks: Chunk[] }
```

## Error handling

- **JSON endpoints (`apiFetch`)**: any non-2xx → `ApiError(status, body.detail ?? statusText)`;
  hooks toast `error.message`. No status-specific branches (no 401/403/404/413/415/422 handling).
- **Upload (`axios.post`)**: non-2xx → `AxiosError`; the toast shows axios's generic
  `"Request failed with status code N"` — the backend `detail` is **not** surfaced.
- Error body shape `{ "detail": string }` assumed; exact codes per endpoint **UNVERIFIED**.

## Endpoints

### List documents

- **Call**: `GET /api/backend/documents` or `GET /api/backend/documents?category_id={id}`
- **Request**: optional query `category_id` (number; omitted when filter is "All categories")
- **Response 200**: `DocumentItem[]` (mocked; `[]` when empty)
- **Used by**: `listDocuments(categoryId?)` → `useDocuments(categoryId?)`
- Ordering of results: **UNVERIFIED** (rendered in response order)

### Get document

- **Call**: `GET /api/backend/documents/{id}`
- **Response 200**: `DocumentDetail` (includes `chunks`)
- **Errors**: 404 for unknown id **UNVERIFIED**; frontend has no not-found branch
- **Note**: No Playwright mock exists for this endpoint — shape is from `types/document.ts` only.

### Upload document

- **Call**: `POST /api/backend/documents/upload` (via `axios`, not `apiFetch`)
- **Request**: `multipart/form-data` fields, in this order:
  - `title` — string
  - `category_id` — stringified number
  - `file` — the PDF `File`
- **Response 201**: `DocumentItem` (mock returns status `"processing"`, `total_pages: null`)
- **Errors**: size limit / non-PDF rejection codes **UNVERIFIED**. UI text claims "up to 20MB"
  but nothing in the frontend enforces or documents the backend limit.

### Replace document file

- **Call**: `PUT /api/backend/documents/{id}/replace`
- **Request**: `multipart/form-data` with single field `file` (PDF)
- **Response 2xx**: `DocumentItem` (typed; status code and post-replace status **UNVERIFIED** — no mock)

### Reprocess document

- **Call**: `POST /api/backend/documents/reprocess/{id}` (note: action segment precedes id)
- **Request**: no body
- **Response 2xx**: `DocumentItem` (typed; **UNVERIFIED** — no mock)

### Delete document

- **Call**: `DELETE /api/backend/documents/{id}`
- **Request**: none
- **Response**: 204 expected (`apiFetch` returns `undefined`); any JSON 2xx also accepted.
  **UNVERIFIED** — no mock.
- Side effects per UI copy: removes the file, its extracted chunks and its vectors
  (**UNVERIFIED** backend behaviour).
