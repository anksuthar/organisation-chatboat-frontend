# Contract: Generic BFF Proxy (`/api/backend/*`)

Source of truth for this document: `app/api/backend/[...path]/route.ts`, `lib/env.ts`, `services/api-client.ts`. Resource-specific endpoints are documented in the contracts of the features that use them.

## Path mapping

| Browser call | Forwarded to |
|---|---|
| `<METHOD> /api/backend/<p1>/<p2>/...?<query>` | `<METHOD> ${BACKEND_URL}/api/v1/<p1>/<p2>/...?<query>` |

- `BACKEND_URL` defaults to `http://localhost:8000` when unset (`lib/env.ts`).
- Query string is copied verbatim (`targetUrl.search = request.nextUrl.search`).
- Supported methods: `GET`, `POST`, `PUT`, `DELETE`. `PATCH`, `HEAD`, `OPTIONS` are not exported → Next.js returns 405. (No service currently uses PATCH.)

## Request

| Aspect | Behaviour |
|---|---|
| Headers forwarded | `content-type` only (if present). All other browser headers (e.g. `accept`, `last-event-id`, cookies) are dropped. |
| Auth header added | `authorization: Bearer <value of cookie "session">` — only when the cookie exists. Unauthenticated requests are forwarded without it. |
| Body | Streamed (`request.body`, `duplex: "half"`) for every method except GET/HEAD. |
| Caching | `cache: "no-store"`. |

## Response

| Aspect | Behaviour |
|---|---|
| Status | Backend status passed through unchanged. |
| Headers | All backend headers copied except `content-encoding` and `content-length` (removed). |
| Body | Backend body stream returned unbuffered (JSON, SSE, binary files). |

## Error envelope (as consumed by `services/api-client.ts`)

```json
{ "detail": "<string>" }
```

- `apiFetch` uses `detail` as `ApiError.message`; falls back to `response.statusText` if `detail` is missing or the body is not JSON.
- Shape of FastAPI 422 validation `detail` (array of objects) — UNVERIFIED (not visible in frontend code); `apiFetch` does not flatten it.

## Error codes handled

| Code | Where | Handling |
|---|---|---|
| any non-2xx | `apiFetch` | throws `ApiError(status, message)` |
| 204 | `apiFetch` | resolves `undefined` |
| 401 / 403 | — | No global handling (no redirect to login); surfaced per feature via `ApiError`. |
| Backend unreachable | proxy | Unhandled `fetch` rejection → Next.js default 500. |

## Authorization

Not enforced by the proxy. `middleware.ts` excludes `/api/*`; FastAPI validates the bearer token on every request.
