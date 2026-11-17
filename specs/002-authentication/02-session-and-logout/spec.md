# Feature Specification: Session & Logout

**Feature Branch**: `002-authentication`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented)

**Input**: Existing code `app/api/auth/me/route.ts`, `app/api/auth/logout/route.ts`, `hooks/use-auth.ts`, `services/auth.ts`, `lib/jwt.ts`, `lib/roles.ts#loginPathForRole`.

## User Scenarios & Testing

### User Story 1 - Know who is signed in (Priority: P1)

Client components (sidebar, header, role-specific UI) read the current user's id, email and role without access to the token.

**Why this priority**: Drives navigation and identity display across the app.

**Independent Test**: With a `session` cookie for role X, open a protected page and assert the header badge shows X (tests currently mock `/api/auth/me` with `mockMe(role)` in `tests/e2e/role-gating.spec.ts` but don't assert UI derived from it).

**Acceptance Scenarios**:

1. **Given** a valid, unexpired `session` cookie, **When** the client calls `GET /api/auth/me`, **Then** it receives `{ id: Number(sub), email, role }`.
2. **Given** no cookie, an undecodable token, or an expired `exp`, **When** `/api/auth/me` is called, **Then** it responds 401 with body `null`, and `useAuth().user` is `null`.
3. **Given** the user has been fetched once, **When** other components call `useAuth()`, **Then** the cached value is reused for the life of the `QueryClient` (`staleTime: Infinity`).

---

### User Story 2 - Log out (Priority: P1)

A signed-in user clicks the sidebar footer button to end the session and returns to the appropriate login page.

**Why this priority**: Required for shared devices and account switching.

**Independent Test**: As admin, click the footer button, assert `POST /api/auth/logout` was called and the URL becomes `/admin/login`; as employee/customer, `/login`.

**Acceptance Scenarios**:

1. **Given** an admin session, **When** the user logs out, **Then** `POST /api/auth/logout` deletes the `session` cookie, the React Query cache is cleared and the browser hard-navigates to `/admin/login`.
2. **Given** an employee or customer session, **When** the user logs out, **Then** the browser hard-navigates to `/login`.
3. **Given** the user is unknown (`/api/auth/me` failed), **When** logout runs, **Then** the destination defaults to `/login` (role treated as `employee`).

### Edge Cases

- `/api/auth/me` trusts the decoded payload without signature verification (UX-only by design).
- `/api/auth/me` and `/api/backend/*` are excluded from middleware; an expired session mid-use leaves `useAuth().user` cached (staleTime ∞) while backend calls start failing with 401 — no automatic redirect until the next full navigation hits middleware.
- If `POST /api/auth/logout` rejects (network error), `logout()` throws before clearing the cache or redirecting; the sidebar's `onClick={() => logout()}` has no catch.
- Logout only deletes the cookie; the JWT remains valid at the backend until `exp`. [NEEDS CLARIFICATION: is server-side revocation required? Backend support UNVERIFIED.]
- `isLoading` is exposed but no consumer renders a loading state.

## Requirements

### Functional Requirements

- **FR-001**: `GET /api/auth/me` MUST read the `session` cookie server-side and return `{ id, email, role }` or 401 `null` when missing/undecodable/expired.
- **FR-002**: `isJwtExpired` MUST treat `exp * 1000 < Date.now()` as expired.
- **FR-003**: `getCurrentUser()` MUST return `null` for any non-2xx response.
- **FR-004**: `useAuth()` MUST expose `{ user, isLoading, logout }` using query key `["auth","me"]` with `staleTime: Infinity`.
- **FR-005**: `POST /api/auth/logout` MUST delete the `session` cookie and return `{ ok: true }`.
- **FR-006**: `logout()` MUST compute the redirect via `loginPathForRole(role ?? "employee")` before the request, then call the logout endpoint, `queryClient.clear()`, and set `window.location.href` (full reload).

### Key Entities

- **AuthUser**: `{ id: number; email: string; role: "admin" | "employee" | "customer" }`.
- **JwtPayload**: `{ sub, role, email, exp, iat }`.

## Success Criteria

### Measurable Outcomes

- **SC-001**: After logout, no cached server state from the previous user is observable (cache cleared + full reload).
- **SC-002**: `/api/auth/me` never returns the raw token.

## Assumptions

- The JWT's `email` claim is present (used directly; undefined otherwise).
