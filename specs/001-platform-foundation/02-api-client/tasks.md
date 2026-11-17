---
description: "Tasks for API Client (retro-documented)"
---

# Tasks: API Client

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/bff-proxy.md](../contracts/bff-proxy.md)

**Legend**: `[X]` = implemented in current code (file cited); `[ ]` = gap.

## Phase 1: Foundational

- [X] T001 Define `ApiError` with `status` and `message` in services/api-client.ts

## Phase 2: User Story 1 - Typed JSON calls through the proxy (P1)

- [X] T002 [US1] Implement `apiFetch<T>()` calling `/api/backend/${path}` in services/api-client.ts
- [X] T003 [US1] Set `Content-Type: application/json` only for non-FormData bodies, allow caller header override in services/api-client.ts
- [X] T004 [US1] Return `undefined` on 204 in services/api-client.ts
- [X] T005 [US1] Indirect E2E coverage via mocked `/api/backend/*` (204 on delete) in tests/e2e/categories.spec.ts

## Phase 3: User Story 2 - Uniform error surface (P1)

- [X] T006 [US2] Parse `detail` with `statusText` fallback in `parseErrorMessage()` in services/api-client.ts
- [X] T007 [US2] Throw `ApiError(status, message)` for non-OK responses in services/api-client.ts
- [ ] T008 [US2] GAP: No Playwright test asserts a backend `{detail}` error reaches the UI via `ApiError` (add an error-path case, e.g. category create 4xx) in tests/e2e/categories.spec.ts
- [ ] T009 [US2] GAP: FastAPI 422 array-shaped `detail` is not flattened into a readable message in services/api-client.ts
- [ ] T010 [US2] GAP: Upload helpers bypass `apiFetch` with axios, so their errors are `AxiosError`, not `ApiError` (Constitution II layering) in services/documents.ts and services/products.ts — owned by those features; consider an upload-with-progress helper in services/api-client.ts
- [ ] T011 [US2] GAP: No global 401 handling (expired session mid-use shows per-call errors instead of redirecting to login) — add `QueryCache`/`MutationCache` `onError` or an `apiFetch` hook in app/providers.tsx or services/api-client.ts (pending FR-007 clarification)

## Phase 4: User Story 3 - Shared server-state cache (P2)

- [X] T012 [US3] Create a single memoised `QueryClient` with `staleTime: 30_000`, `retry: 1` in app/providers.tsx
- [ ] T013 [US3] GAP: No test covers query caching/retry defaults in tests/e2e/

## Gap summary

- T008 — error-path of `apiFetch` untested end-to-end (Constitution IV).
- T009 — 422 validation errors render unreadable messages.
- T010 — `services/documents.ts` / `services/products.ts` bypass `api-client` (Constitution II).
- T011 — no session-expiry (401) handling on the client.
- T013 — cache defaults untested.
