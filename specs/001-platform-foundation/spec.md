# Feature Specification: Platform Foundation

**Feature Branch**: `001-platform-foundation`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented from existing code)

**Input**: Document the existing cross-cutting platform: BFF backend proxy, browser API client, app shell (layouts, providers, protected layout, sidebar navigation), theming and fallback pages.

## Purpose

Every other feature (knowledge-base chat, documents, categories, commerce, tickets, profile) depends on this layer. It provides:

1. A same-origin Backend-for-Frontend proxy so the browser never sees the FastAPI URL or the JWT.
2. A single typed fetch wrapper with uniform error handling for request/response calls.
3. A consistent authenticated application shell (sidebar, header, role-aware navigation).
4. Global providers (React Query, theming, toasts, tooltips) and fallback pages.

## Actors / Roles

| Actor | Relevance to this feature |
|---|---|
| Admin (`admin`) | Sees the "Admin" nav group plus the "General" group (Chat, Profile, Settings). |
| Employee (`employee`) | Sees the "General" nav group (Chat, Profile, Settings). |
| Customer (`customer`) | Sees the "Shop" nav group (Chat, Shop, Cart, My Orders, Support Tickets, Profile, Settings). |
| Any visitor | Sees the 404 page for unknown routes (after middleware auth checks). |
| FastAPI backend | Upstream system reached only via the proxy; the authorization authority. |

Role identity comes from feature [002-authentication](../002-authentication/spec.md).

## Sub-specifications

| # | Sub-spec | Summary |
|---|---|---|
| 01 | [BFF backend proxy](01-bff-proxy/spec.md) | `app/api/backend/[...path]/route.ts` forwards GET/POST/PUT/DELETE to `${BACKEND_URL}/api/v1/<path>`, attaching `Authorization: Bearer <session cookie>` and streaming bodies both ways. |
| 02 | [API client](02-api-client/spec.md) | `services/api-client.ts` `apiFetch<T>()` calls `/api/backend/<path>`, sets JSON content type, maps non-2xx to `ApiError(status, detail)`, returns `undefined` on 204. |
| 03 | [App shell & navigation](03-app-shell-navigation/spec.md) | Root layout + providers, protected layout with collapsible sidebar, role-aware nav groups, header with role badge, logout entry, mobile sheet behaviour. |
| 04 | [Theming & fallback pages](04-theming-and-fallback-pages/spec.md) | Light/dark/system theming via `next-themes`, header theme toggle, themed toasts, and the 404 page. |

## Cross-cutting Requirements

- **CR-001**: The raw JWT MUST never be readable by client-side JS; it lives only in the httpOnly `session` cookie and is attached server-side (Constitution I).
- **CR-002**: `BACKEND_URL` MUST be read only in server code via `lib/env.ts` and MUST NOT be `NEXT_PUBLIC_`-prefixed.
- **CR-003**: Browser code MUST reach the backend only through `/api/backend/*` (data) or `/api/auth/*` (session lifecycle).
- **CR-004**: Request and response bodies MUST be streamed unbuffered through the proxy (multipart uploads, SSE chat).
- **CR-005**: Server state in the browser MUST be managed by a single React Query `QueryClient` (default `staleTime` 30 s, `retry` 1).
- **CR-006**: All pages under `app/(protected)/` MUST render inside the shared shell (sidebar + header).

## Success Criteria

- **SC-001**: No client bundle contains the backend base URL or the JWT value (verifiable by grepping built client chunks for `BACKEND_URL`'s value).
- **SC-002**: 100% of browser data calls go to same-origin `/api/backend/*` or `/api/auth/*` paths.
- **SC-003**: Chat SSE tokens and upload progress are observed incrementally in the browser (no buffering at the proxy).
- **SC-004**: Each role sees exactly its documented navigation items after login.
- **SC-005**: Theme choice persists across reloads and follows the OS preference by default.

## Assumptions

- The backend exposes all resources under `/api/v1/` and returns FastAPI-style `{ "detail": ... }` error bodies.
- Authorization is enforced by FastAPI on every proxied request; the frontend only does UX routing.
