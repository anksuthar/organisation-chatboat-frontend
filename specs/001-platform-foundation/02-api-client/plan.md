# Implementation Plan: API Client

**Branch**: `001-platform-foundation` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

`services/api-client.ts` exports `ApiError` and `apiFetch<T>(path, init?)`. `app/providers.tsx` creates the shared `QueryClient`. Resource services (`services/categories.ts`, `cart.ts`, `orders.ts`, `profile.ts`, `tickets.ts`, `product-categories.ts`, most of `documents.ts`/`products.ts`/`chat.ts`) build on `apiFetch`.

## Files Involved

| File | Role |
|---|---|
| `services/api-client.ts` | `ApiError`, `parseErrorMessage()`, `apiFetch<T>()` |
| `app/providers.tsx` | `QueryClient` (`staleTime: 30_000`, `retry: 1`) via `useState` initialiser |
| `services/*.ts` (consumers) | Resource wrappers; owned by their feature specs |

Known bypasses (outside this feature, still via the proxy):

| File | Call | Reason |
|---|---|---|
| `services/chat.ts` | `fetch("/api/backend/chat", ...)` | SSE stream — permitted exception, consumed by `hooks/use-chat-stream.ts` |
| `services/documents.ts` | `axios.post("/api/backend/documents/upload", ...)` | `onUploadProgress` |
| `services/products.ts` | `axios.post("/api/backend/products/upload", ...)` | `onUploadProgress` |
| `services/products.ts` | returns string `/api/backend/products/<id>/images/<imageId>/file` | used as `<img src>` |

## State & Data Flow

`hook (useQuery/useMutation)` → `service fn` → `apiFetch(path, init)` → `fetch("/api/backend/" + path)` → proxy. Errors propagate as `ApiError` to React Query's `error` / mutation `onError`.

## Error / Loading Handling

- Loading state is owned by React Query in hooks.
- `parseErrorMessage` swallows JSON parse errors and falls back to `statusText`.
- No global 401 interceptor; no `QueryCache`/`MutationCache` `onError` handler.

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. BFF Security Boundary | PASS | Same-origin relative URL only; no token handling in JS. |
| II. Layered Data Access | PASS (caveat) | `apiFetch` is the mandated layer; two upload services bypass it with axios (documented above, gap T010). |
| III. Contract-First | PASS | Error envelope documented in [../contracts/bff-proxy.md](../contracts/bff-proxy.md). |
| IV. Test Every User Story | VIOLATION (partial) | US1 is exercised indirectly by every feature E2E test that mocks `/api/backend/*`; 204 handling by the delete case in `tests/e2e/categories.spec.ts`. No test covers US2 (error → `ApiError` message shown) or US3 (cache reuse). |
| V. Pinned Stack & Base UI | PASS | N/A beyond React Query 5. |
| VI. Simplicity | PASS | ~40-line wrapper; no interceptors or extra libraries. |
