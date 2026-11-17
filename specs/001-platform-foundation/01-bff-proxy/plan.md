# Implementation Plan: BFF Backend Proxy

**Branch**: `001-platform-foundation` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

One Next.js Route Handler file exports `GET`, `POST`, `PUT`, `DELETE`, each awaiting the dynamic `params.path` array and delegating to a shared `proxy()` function that rebuilds the URL, injects the bearer token and pipes bodies.

## Files Involved

| File | Role |
|---|---|
| `app/api/backend/[...path]/route.ts` | `proxy(request, path)` + method exports |
| `lib/env.ts` | `BACKEND_URL` (default `http://localhost:8000`), `SESSION_COOKIE_NAME = "session"` |
| `.env.local.example` | Documents `BACKEND_URL` as server-only |
| `middleware.ts` | Matcher excludes `api` — proxy is not route-gated |

## State & Data Flow

1. `cookies().get("session")` → token (server-only).
2. `new URL(\`${BACKEND_URL}/api/v1/${path.join("/")}\`)`, `search` copied from `request.nextUrl`.
3. New `Headers`: `content-type` (if any), `authorization: Bearer <token>` (if any).
4. `fetch(target, { method, headers, body: request.body (non-GET/HEAD), duplex: "half", cache: "no-store" })`.
5. Copy response headers, delete `content-encoding` and `content-length`, return `new Response(backendResponse.body, { status })`.

No client state. No caching.

## Error / Loading Handling

- Backend errors: passed through verbatim (status + body).
- Network failure to backend: not caught → framework 500.
- Missing cookie: request forwarded unauthenticated; backend decides.

## Contracts

[../contracts/bff-proxy.md](../contracts/bff-proxy.md)

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. BFF Security Boundary | PASS | Token from httpOnly cookie, attached server-side; `BACKEND_URL` server-only; request and response streamed. `lib/env.ts` lacks `import "server-only"` guard (comment only). |
| II. Layered Data Access | PASS | Proxy is the terminal layer of the mandated chain. |
| III. Contract-First | PASS | Generic contract documented. |
| IV. Test Every User Story | VIOLATION | No test executes the route handler: E2E tests intercept `/api/backend/*` in the browser via `page.route()`, so token injection, path mapping and streaming are untested. |
| V. Pinned Stack & Base UI | PASS | Uses Next 15 async `params`/`cookies()` APIs. |
| VI. Simplicity | PASS | Single generic handler, no per-endpoint code. |
