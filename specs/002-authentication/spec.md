# Feature Specification: Authentication & Role-Based Access

**Feature Branch**: `002-authentication`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented from existing code)

**Input**: Document the existing login (general and admin portals), cookie session lifecycle (me/logout), and role-based route gating.

## Purpose

Let users sign in with email/password against FastAPI, hold the resulting JWT in an httpOnly cookie managed by Next.js route handlers (BFF), expose the current user to the UI without exposing the token, and route each role to the pages it may use. Frontend role checks are UX routing only; FastAPI is the authorization authority (Constitution I).

## Actors / Roles

| Role | Login page | Home after login | Access to `/admin/**` |
|---|---|---|---|
| `admin` | `/admin/login` (dedicated) or `/login` | `/admin` | Yes |
| `employee` | `/login` | `/chat` | No → `/unauthorized` |
| `customer` | `/login` | `/chat` | No → `/unauthorized` |
| Unauthenticated visitor | — | — | Redirected to `/admin/login` (for `/admin*`) or `/login` |

There is no self-service sign-up in the frontend; accounts are created against the backend directly (README).

## Sub-specifications

| # | Sub-spec | Summary |
|---|---|---|
| 01 | [Login](01-login/spec.md) | `/login` and `/admin/login` pages sharing `LoginForm` (zod validation); `POST /api/auth/login` calls FastAPI and sets the httpOnly `session` cookie; admin portal rejects non-admin accounts. |
| 02 | [Session & logout](02-session-and-logout/spec.md) | `GET /api/auth/me` decodes the cookie server-side into `{id,email,role}`; `useAuth()` exposes it; logout clears the cookie, the React Query cache and hard-redirects to the role's login page. |
| 03 | [Role-based routing](03-role-based-routing/spec.md) | `middleware.ts` redirects unauthenticated/expired sessions to the right login page, blocks non-admins from `/admin/**` via `/unauthorized`, and sends `/` to the role home; `app/(protected)/page.tsx` is a fallback. |

## Cross-cutting Requirements

- **CR-001**: The JWT MUST only be stored in the httpOnly `session` cookie (`sameSite=lax`, `secure` in production, `path=/`), never returned to client JS.
- **CR-002**: JWT payloads are decoded without signature verification (`lib/jwt.ts`) and MUST only drive UX decisions (routing, nav, labels).
- **CR-003**: Role → home mapping (`roleHomePath`) and role/path → login page mapping (`loginPathForRole`, `loginPathForPathname`) MUST be defined once in `lib/roles.ts`.
- **CR-004**: Every role-restricted story MUST have Playwright role-gating coverage (Constitution IV).

## Success Criteria

- **SC-001**: Each role lands on its home page in one submit after valid credentials.
- **SC-002**: 0 non-admin sessions created via the admin portal (session discarded on role mismatch).
- **SC-003**: 100% of unauthenticated requests to protected pages are redirected to a login page before any page code runs.
- **SC-004**: The JWT is not observable via `document.cookie` or any JSON response to the browser.

## Assumptions

- FastAPI issues JWTs with `sub`, `role`, `email`, `exp`, `iat` claims (inferred from `lib/jwt.ts` and `tests/e2e/utils.ts`).
- Roles are exactly `admin`, `employee`, `customer` (`types/user.ts`).
