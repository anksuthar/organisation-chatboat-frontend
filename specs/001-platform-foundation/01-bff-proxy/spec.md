# Feature Specification: BFF Backend Proxy

**Feature Branch**: `001-platform-foundation`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented)

**Input**: Existing code `app/api/backend/[...path]/route.ts`, `lib/env.ts`.

## User Scenarios & Testing

### User Story 1 - Authenticated data calls without exposing the token (Priority: P1)

A signed-in user's browser calls `/api/backend/<path>`; the server attaches the JWT from the httpOnly `session` cookie and forwards the call to FastAPI, so the token and backend URL never reach client JS.

**Why this priority**: Every data feature depends on it; it is the core security boundary (Constitution I).

**Independent Test**: With a `session` cookie set, call `GET /api/backend/categories` against a stub backend and assert the stub received `Authorization: Bearer <cookie value>` at `/api/v1/categories`.

**Acceptance Scenarios**:

1. **Given** a `session` cookie, **When** the browser sends `GET /api/backend/documents?status=x`, **Then** the server requests `${BACKEND_URL}/api/v1/documents?status=x` with `authorization: Bearer <token>` and `cache: no-store`.
2. **Given** no `session` cookie, **When** the browser calls `/api/backend/...`, **Then** the request is forwarded without an `authorization` header and the backend's (expected 401) response is returned unchanged.
3. **Given** the backend returns status 4xx/5xx with a JSON body, **When** proxied, **Then** the same status and body reach the browser.

---

### User Story 2 - Streaming uploads and SSE (Priority: P1)

Multipart uploads and the chat SSE stream pass through the proxy without being buffered.

**Why this priority**: Upload progress and token-by-token chat rendering depend on it (Constitution I, last bullet).

**Independent Test**: Proxy a stub SSE endpoint emitting events with delays; assert the browser receives the first event before the stream ends.

**Acceptance Scenarios**:

1. **Given** a `POST` with `multipart/form-data`, **When** proxied, **Then** `content-type` (incl. boundary) is forwarded and the body is streamed (`duplex: "half"`).
2. **Given** a backend `text/event-stream` response, **When** proxied, **Then** the body stream is returned as-is with `content-encoding` and `content-length` removed.

---

### User Story 3 - Server-only backend configuration (Priority: P2)

Operators configure the backend location with `BACKEND_URL` (server env), defaulting to `http://localhost:8000`.

**Why this priority**: Needed for deployment; default keeps local dev zero-config.

**Independent Test**: Start with `BACKEND_URL` set to a stub; verify proxied calls hit it and the value does not appear in client chunks.

**Acceptance Scenarios**:

1. **Given** `BACKEND_URL` unset, **When** a call is proxied, **Then** it targets `http://localhost:8000/api/v1/...`.
2. **Given** `BACKEND_URL=https://api.internal`, **When** a call is proxied, **Then** it targets `https://api.internal/api/v1/...`.

### Edge Cases

- `PATCH`/`HEAD`/`OPTIONS` → 405 from Next.js (handlers not exported).
- Backend unreachable / DNS failure → `fetch` throws; no try/catch, so Next.js returns a generic 500 (HTML), and `apiFetch` surfaces `statusText`.
- Browser headers other than `content-type` (e.g. `accept`, `last-event-id`, `if-none-match`) are not forwarded.
- Backend `set-cookie` headers would be passed through to the browser (all headers except encoding/length are copied).
- Expired cookie is still forwarded; FastAPI rejects it (middleware does not run on `/api/*`).

## Requirements

### Functional Requirements

- **FR-001**: The proxy MUST map `/api/backend/<segments>` to `${BACKEND_URL}/api/v1/<segments>` and preserve the query string.
- **FR-002**: The proxy MUST read the `session` cookie server-side and, if present, send `authorization: Bearer <token>`.
- **FR-003**: The proxy MUST forward the request `content-type` header.
- **FR-004**: The proxy MUST stream the request body for non-GET/HEAD methods using `duplex: "half"`.
- **FR-005**: The proxy MUST return the backend status and body stream unchanged, removing `content-encoding` and `content-length`.
- **FR-006**: The proxy MUST support GET, POST, PUT and DELETE.
- **FR-007**: The proxy MUST disable fetch caching (`cache: "no-store"`).
- **FR-008**: `BACKEND_URL` MUST be read only from `lib/env.ts` and default to `http://localhost:8000`.
- **FR-009**: The proxy MUST NOT perform authorization itself; FastAPI is authoritative.
- **FR-010**: [NEEDS CLARIFICATION: expected behaviour when the backend is unreachable — currently an unhandled 500; should it return a JSON `{detail}` 502?]

### Key Entities

- **Session cookie**: name `session`, httpOnly, holds the FastAPI JWT (set by 002-authentication).
- **Proxied request**: method, path segments, query, content-type, streamed body.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 0 occurrences of the JWT or `BACKEND_URL` value in client JS bundles.
- **SC-002**: SSE first-token latency through the proxy within the same order as direct backend (no full-buffer wait).
- **SC-003**: All four supported methods round-trip status and body unchanged.

## Assumptions

- All backend routes live under `/api/v1/`.
- The backend accepts `Authorization: Bearer` and does not use cookies.
