---
description: "Tasks for BFF Backend Proxy (retro-documented)"
---

# Tasks: BFF Backend Proxy

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/bff-proxy.md](../contracts/bff-proxy.md)

**Legend**: `[X]` = implemented in current code (file cited); `[ ]` = gap.

## Phase 1: Setup

- [X] T001 [P] Define server-only `BACKEND_URL` (default `http://localhost:8000`) and `SESSION_COOKIE_NAME` in lib/env.ts
- [X] T002 [P] Provide `BACKEND_URL` template without `NEXT_PUBLIC_` prefix in .env.local.example
- [X] T003 Exclude `/api/*` from route middleware in middleware.ts (`config.matcher`)

## Phase 2: User Story 1 - Authenticated data calls (P1)

- [X] T004 [US1] Build target URL `${BACKEND_URL}/api/v1/<path>` and copy query string in app/api/backend/[...path]/route.ts
- [X] T005 [US1] Read `session` cookie server-side and set `authorization: Bearer <token>` in app/api/backend/[...path]/route.ts
- [X] T006 [US1] Forward `content-type`, set `cache: "no-store"` in app/api/backend/[...path]/route.ts
- [X] T007 [US1] Export GET/POST/PUT/DELETE handlers delegating to `proxy()` in app/api/backend/[...path]/route.ts
- [X] T008 [US1] Pass backend status and headers through unchanged in app/api/backend/[...path]/route.ts
- [ ] T009 [US1] GAP: No test exercises the route handler (all E2E specs mock `/api/backend/*` in the browser); add a Playwright test that lets the request reach the Next server with a stubbed `BACKEND_URL` and asserts the Bearer header/path mapping in tests/e2e/
- [ ] T010 [US1] GAP: Catch backend network failures and return a JSON `{ "detail": ... }` 502 instead of an unhandled 500 in app/api/backend/[...path]/route.ts (pending FR-010 clarification)

## Phase 3: User Story 2 - Streaming uploads and SSE (P1)

- [X] T011 [US2] Stream request body with `duplex: "half"` for non-GET/HEAD in app/api/backend/[...path]/route.ts
- [X] T012 [US2] Return backend body stream unbuffered, stripping `content-encoding`/`content-length` in app/api/backend/[...path]/route.ts
- [ ] T013 [US2] GAP: No test verifies unbuffered streaming through the proxy (chat SSE test mocks the proxy URL itself) in tests/e2e/

## Phase 4: User Story 3 - Server-only configuration (P2)

- [X] T014 [US3] Read backend URL only via lib/env.ts (imported only by server files: route handlers, middleware.ts)
- [ ] T015 [P] [US3] GAP: Add `import "server-only"` (or equivalent build-time guard) so lib/env.ts cannot be pulled into a client bundle by mistake in lib/env.ts

## Gap summary

- T009 — proxy route handler has zero test coverage (Constitution IV).
- T010 — backend-unreachable produces an unhandled 500 (non-JSON).
- T013 — streaming behaviour untested.
- T015 — server-only enforcement of `lib/env.ts` is by comment only.
