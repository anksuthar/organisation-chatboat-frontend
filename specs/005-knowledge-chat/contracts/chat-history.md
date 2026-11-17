# Contract: Chat history

Sources: `services/chat.ts`, `hooks/use-chat-history.ts`, `types/chat.ts`, `services/api-client.ts`, `tests/e2e/chat.spec.ts`, `tests/e2e/auth.spec.ts`.

## GET /api/backend/chat/history

Proxied to `${BACKEND_URL}/api/v1/chat/history`. Scoped to the current user by the backend (UNVERIFIED — not visible in frontend code).

- **Request**: no body, no query params.
- **Response 200** `application/json`: `ChatHistoryEntry[]`

```ts
ChatHistoryEntry { id: number; question: string; answer: string; created_at: string /* ISO 8601 */ }
```

- **Ordering**: rendered in array order (oldest-first assumed; ordering is UNVERIFIED — not visible in frontend code).
- **Errors**: non-2xx → `ApiError(status, body.detail ?? statusText)`. The page does not read the error; see 03 gap.

## DELETE /api/backend/chat/history

- **Request**: no body.
- **Response**: `204 No Content` (as mocked) → `apiFetch` returns `undefined`. A 200 with JSON would also be accepted (parsed and discarded).
- **Errors**: non-2xx → `ApiError`; rejected `mutateAsync` is not caught by the page (see 03 gap).
- **Effect**: deletes all of the user's history (per dialog copy "This deletes your chat history permanently"); per-entry deletion is not supported in the frontend.
