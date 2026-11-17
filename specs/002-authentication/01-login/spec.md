# Feature Specification: Login

**Feature Branch**: `002-authentication`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented)

**Input**: Existing code `app/login/page.tsx`, `app/admin/login/page.tsx`, `components/auth/login-form.tsx`, `services/auth.ts#login`, `app/api/auth/login/route.ts`.

## User Scenarios & Testing

### User Story 1 - Sign in via the general login page (Priority: P1)

Any user (admin, employee, customer) enters email and password at `/login` and lands on their role's home page.

**Why this priority**: Nothing else is reachable without a session.

**Independent Test**: `tests/e2e/auth.spec.ts` — "admin login redirects to the admin dashboard", "employee login redirects to chat", "customer login redirects to chat".

**Acceptance Scenarios**:

1. **Given** valid admin credentials, **When** the user submits on `/login`, **Then** the session cookie is set and the browser navigates to `/admin`.
2. **Given** valid employee or customer credentials, **When** submitted on `/login`, **Then** the browser navigates to `/chat`.
3. **Given** the form is submitting, **When** the request is in flight, **Then** the button shows "Signing in…" and is disabled.
4. **Given** the `/login` page, **When** it renders, **Then** it shows "Knowledge Base", "Sign in to continue" and a "Sign in here" link to `/admin/login` after "Store administrator?".

---

### User Story 2 - Sign in via the admin portal (Priority: P1)

Administrators use a visually distinct `/admin/login` portal that only accepts admin accounts.

**Why this priority**: Keeps the admin entry point separate from customer/employee sign-in.

**Independent Test**: `tests/e2e/auth.spec.ts` — "admin can sign in through the dedicated admin login page", "a non-admin account is rejected on the admin login page".

**Acceptance Scenarios**:

1. **Given** valid admin credentials, **When** submitted on `/admin/login`, **Then** the browser navigates to `/admin`.
2. **Given** valid credentials for a non-admin account, **When** submitted on `/admin/login`, **Then** the just-created session is discarded via `POST /api/auth/logout`, the message "This sign-in is for admin accounts only." is shown, and the URL stays on `/admin/login`.
3. **Given** the `/admin/login` page, **When** it renders, **Then** it shows a shield icon, "Admin Portal", "Sign in with your administrator account" and a "Go to the regular sign-in" link to `/login` after "Not an administrator?".

---

### User Story 3 - Validation and error feedback (Priority: P2)

Users get immediate feedback for malformed input and readable messages for rejected credentials.

**Why this priority**: Prevents pointless requests and clarifies failures.

**Independent Test**: `tests/e2e/auth.spec.ts` — "wrong credentials show an inline error" (server error only; client validation untested).

**Acceptance Scenarios**:

1. **Given** an invalid email, **When** the user submits, **Then** "Enter a valid email address" appears under the field and no request is sent.
2. **Given** an empty password, **When** the user submits, **Then** "Password is required" appears and no request is sent.
3. **Given** the backend responds 401 `{"detail":"Incorrect email or password"}`, **When** the user submits, **Then** that text is shown in red above the button and the URL stays on the login page.
4. **Given** an error response without `detail`, **When** submitted, **Then** "Login failed" is shown.

### Edge Cases

- An already-authenticated user visiting `/login` or `/admin/login` sees the form (no redirect to home); signing in again overwrites the cookie.
- An admin may sign in through `/login` (no role restriction there).
- If the JWT payload cannot be decoded, the login route returns `{ role: null }` and a 1-hour cookie; the form pushes to `/chat` (`roleHomePath(null)`), where middleware then rejects the undecodable token, deletes the cookie and redirects to `/login`.
- FastAPI 422 `detail` arrays become `Error(detail)` → unreadable message.
- Backend unreachable or returning non-JSON → route handler throws → 500; the client's `response.json()` may throw, and the form shows the parse error message.
- Login does not invalidate the `["auth","me"]` query; `router.refresh()` plus the fact that the login pages are outside the shell (no cached user yet) makes this harmless in normal flow. [NEEDS CLARIFICATION: if a different user signs in within the same tab without logout, the cached `useAuth()` user (staleTime ∞) could be stale.]

## Requirements

### Functional Requirements

- **FR-001**: The system MUST provide `/login` and `/admin/login` pages, both rendering `LoginForm`, outside the protected shell.
- **FR-002**: `LoginForm` MUST validate with zod: `email` valid address ("Enter a valid email address"), `password` non-empty ("Password is required").
- **FR-003**: On submit, the client MUST `POST /api/auth/login` with `{email, password}`.
- **FR-004**: The login route MUST forward the body to `${BACKEND_URL}/api/v1/auth/login` and, on failure, return the backend's status and JSON body.
- **FR-005**: On success, the login route MUST set the `session` cookie (httpOnly, `sameSite=lax`, `secure` in production, `path=/`, `maxAge = max(exp − now, 0)`, or 3600 s if undecodable) and return only `{ role }`.
- **FR-006**: On success, the client MUST navigate to `roleHomePath(role)` (`/admin` for admin, `/chat` otherwise) and call `router.refresh()`.
- **FR-007**: When `requireRole` is set (admin portal) and the returned role differs, the client MUST call logout and show "This sign-in is for {requireRole} accounts only.".
- **FR-008**: The submit button MUST show "Signing in…" and be disabled while submitting.
- **FR-009**: Server error text MUST come from `detail`, falling back to "Login failed".

### Key Entities

- **Credentials**: `{ email: string, password: string }`.
- **Login result**: `{ role: UserRole }` (client type; route may return `null`).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Valid credentials reach the role home page in one submit.
- **SC-002**: Non-admin accounts never retain a session after using the admin portal.
- **SC-003**: Invalid input never triggers a network request.

## Assumptions

- Accounts are provisioned outside the frontend (no sign-up/forgot-password pages exist).
