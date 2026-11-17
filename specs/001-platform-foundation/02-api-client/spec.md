# Feature Specification: API Client

**Feature Branch**: `001-platform-foundation`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented)

**Input**: Existing code `services/api-client.ts`, `app/providers.tsx` (QueryClient defaults).

## User Scenarios & Testing

### User Story 1 - Typed JSON calls through the proxy (Priority: P1)

Service modules call `apiFetch<T>("<resource path>", init)` and get typed JSON back, without knowing the backend URL or handling auth.

**Why this priority**: The single request/response entry point for all `services/*.ts` (Constitution II).

**Independent Test**: In a page under test, mock `/api/backend/categories` with `[]` and assert the consuming hook renders an empty list (covered indirectly by `tests/e2e/categories.spec.ts`).

**Acceptance Scenarios**:

1. **Given** `apiFetch("categories")`, **When** called, **Then** it issues `fetch("/api/backend/categories")` (same-origin; cookie sent automatically).
2. **Given** a non-FormData `body`, **When** called, **Then** `Content-Type: application/json` is set unless the caller overrides it.
3. **Given** a `FormData` body, **When** called, **Then** no `Content-Type` is set so the browser adds the multipart boundary.
4. **Given** a 2xx JSON response, **When** called, **Then** the parsed JSON is returned as `T`.
5. **Given** a 204 response, **When** called, **Then** `undefined` is returned without parsing.

---

### User Story 2 - Uniform error surface (Priority: P1)

Non-2xx responses become an `ApiError` with the HTTP status and the backend's `detail` message so hooks/components can show it (e.g. in a toast).

**Why this priority**: Every mutation's error toast depends on a readable message.

**Independent Test**: Mock `/api/backend/categories` POST with `409 {"detail":"Category already exists"}` and assert that message is shown.

**Acceptance Scenarios**:

1. **Given** a 4xx/5xx response with `{"detail": "msg"}`, **When** called, **Then** it throws `ApiError` with `status` and `message === "msg"`.
2. **Given** an error response without `detail` or with a non-JSON body, **When** called, **Then** `message` is `response.statusText`.

---

### User Story 3 - Shared server-state cache (Priority: P2)

A single React Query `QueryClient` per browser session caches server state with `staleTime: 30_000` ms and `retry: 1` for queries.

**Why this priority**: Consistent caching/invalidation behaviour across hooks.

**Independent Test**: Navigate between two pages using the same query key and assert only one network request within 30 s.

**Acceptance Scenarios**:

1. **Given** the app mounts, **When** `Providers` renders, **Then** one `QueryClient` is created (memoised with `useState`) and provided to all children.
2. **Given** a failing query, **When** it errors, **Then** React Query retries once before surfacing the error.

### Edge Cases

- FastAPI 422 responses carry `detail` as an array; `apiFetch` assigns it as-is to `Error.message`, producing a non-readable message (e.g. `[object Object]`).
- 401 from an expired session is thrown as a normal `ApiError`; there is no global redirect to the login page.
- Successful non-204 responses with an empty or non-JSON body make `response.json()` throw a raw `SyntaxError` (not `ApiError`).
- Caller headers are spread after the default, so callers can override `Content-Type`.

## Requirements

### Functional Requirements

- **FR-001**: `apiFetch` MUST prefix every path with `/api/backend/`.
- **FR-002**: `apiFetch` MUST set `Content-Type: application/json` when a non-FormData body is present.
- **FR-003**: `apiFetch` MUST throw `ApiError(status, message)` for non-OK responses, using `detail` or falling back to `statusText`.
- **FR-004**: `apiFetch` MUST return `undefined` for 204 responses.
- **FR-005**: The app MUST provide exactly one `QueryClient` with query defaults `staleTime: 30_000`, `retry: 1`.
- **FR-006**: Request/response services SHOULD use `apiFetch` rather than calling `fetch`/`axios` directly (Constitution II). [NEEDS CLARIFICATION: upload services need progress events that `fetch` cannot provide — should `api-client` expose an axios-based upload helper?]
- **FR-007**: [NEEDS CLARIFICATION: should a 401 anywhere trigger a redirect to the role's login page?]

### Key Entities

- **ApiError**: `Error` subclass with `status: number`, `message: string`.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every request/response service function routes through `apiFetch` (target: 100%, current: all except the two upload helpers and the SSE chat call).
- **SC-002**: Every backend error with a string `detail` is shown to users verbatim.

## Assumptions

- Backend errors follow FastAPI's `{ "detail": ... }` envelope.
