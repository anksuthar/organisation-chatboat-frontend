# Feature Specification: Role-Based Routing

**Feature Branch**: `002-authentication`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented)

**Input**: Existing code `middleware.ts`, `lib/roles.ts`, `lib/jwt.ts`, `app/unauthorized/page.tsx`, `app/(protected)/page.tsx`.

All checks here are UX routing; FastAPI enforces authorization on every proxied call (Constitution I).

## User Scenarios & Testing

### User Story 1 - Unauthenticated visitors are sent to the right login page (Priority: P1)

A visitor without a valid session who opens any protected page is redirected to `/admin/login` for `/admin*` paths and to `/login` otherwise.

**Why this priority**: Prevents rendering protected UI without a session.

**Independent Test**: `tests/e2e/auth.spec.ts` — "unauthenticated visit to /admin redirects to the admin login", "unauthenticated visit to /chat redirects to /login".

**Acceptance Scenarios**:

1. **Given** no `session` cookie, **When** visiting `/admin` (or any `/admin/...` other than `/admin/login`), **Then** redirect to `/admin/login`.
2. **Given** no `session` cookie, **When** visiting `/chat` (or any other non-public page), **Then** redirect to `/login`.
3. **Given** a `session` cookie that is undecodable or whose `exp` has passed, **When** visiting a protected page, **Then** redirect to the matching login page and delete the cookie.
4. **Given** any visitor, **When** visiting `/login`, `/admin/login` or `/unauthorized`, **Then** the page renders without auth checks.

---

### User Story 2 - Non-admins are kept out of the admin area (Priority: P1)

Employees and customers who open `/admin/**` see an "Access denied" page.

**Why this priority**: Admin pages are useless (and backend-rejected) for other roles; clear feedback beats broken pages.

**Independent Test**: `tests/e2e/role-gating.spec.ts` — employee and customer redirected to `/unauthorized`; admin can access `/admin`.

**Acceptance Scenarios**:

1. **Given** an `employee` or `customer` session, **When** visiting any path starting with `/admin` (except `/admin/login`), **Then** redirect to `/unauthorized`, which shows heading "Access denied", the text "You don't have permission to view this page. If you think this is a mistake, contact an administrator." and a "Back to chat" button linking to `/chat`.
2. **Given** an `admin` session, **When** visiting `/admin`, **Then** the admin dashboard renders.

---

### User Story 3 - Root URL goes to the role's home (Priority: P2)

Opening `/` takes a signed-in user straight to their home page.

**Why this priority**: Convenience; also the target of the 404 "Back home" link.

**Independent Test**: With an admin cookie, visit `/` and assert URL `/admin`; with employee/customer, `/chat`.

**Acceptance Scenarios**:

1. **Given** an admin session, **When** visiting `/`, **Then** redirect to `/admin`.
2. **Given** an employee or customer session, **When** visiting `/`, **Then** redirect to `/chat`.
3. **Given** middleware did not redirect (defense in depth), **When** `app/(protected)/page.tsx` renders, **Then** it redirects to the role home if the cookie decodes, otherwise to `/login`.

### Edge Cases

- `PUBLIC_PATHS` uses `startsWith`, so any path beginning with `/login`, `/admin/login` or `/unauthorized` (e.g. `/login-help`, `/admin/login/x`) bypasses auth checks.
- Only `/admin*` is role-gated. Customer-oriented pages (`/shop`, `/cart`, `/orders`, `/tickets`) are reachable by employees and admins by URL, and nothing gates staff-only pages from customers; the sidebar merely hides them. [NEEDS CLARIFICATION: should middleware gate commerce routes to `customer`?]
- Middleware does not run for `/api/*`, `/_next/static`, `/_next/image`, `favicon.ico`.
- The `/` fallback page does not check `exp` (middleware already does).
- `/unauthorized` always offers "Back to chat", which is valid for both non-admin roles.

## Requirements

### Functional Requirements

- **FR-001**: Middleware MUST run on all paths except `api`, `_next/static`, `_next/image`, `favicon.ico`.
- **FR-002**: Paths starting with `/login`, `/admin/login`, `/unauthorized` MUST be public.
- **FR-003**: Missing cookie MUST redirect to `loginPathForPathname(pathname)` (`/admin/login` for `/admin*`, else `/login`).
- **FR-004**: Undecodable or expired token MUST redirect as in FR-003 and delete the `session` cookie.
- **FR-005**: Non-admin roles on `/admin*` MUST be redirected to `/unauthorized`.
- **FR-006**: `/` MUST redirect to `roleHomePath(role)` (`/admin` or `/chat`).
- **FR-007**: Role decisions MUST use the unverified JWT payload only for routing; no data access decisions are made in the frontend.

### Key Entities

- **Route class**: public (`PUBLIC_PATHS`), admin (`/admin*`), other protected.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of non-admin visits to `/admin*` end on `/unauthorized`.
- **SC-002**: 100% of visits with missing/expired cookies end on a login page with the cookie removed.

## Assumptions

- Middleware runs on the Edge runtime; decoding uses only `atob` (no Node crypto).
