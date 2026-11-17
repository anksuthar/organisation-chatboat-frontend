# Implementation Plan: Authentication & Role-Based Access

**Branch**: `002-authentication` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-authentication/spec.md` (retro-documented; code already exists)

## Summary

Session lifecycle is handled by three Next.js Route Handlers under `app/api/auth/` (login/me/logout) — the only browser-facing endpoints outside the generic `/api/backend/*` proxy. Login exchanges credentials with FastAPI server-side and sets the httpOnly cookie; `me` decodes the cookie; logout deletes it. Edge `middleware.ts` decodes the same cookie to redirect by authentication state and role.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Next.js 15.5.20 App Router, React 19.1.0

**Primary Dependencies**: `react-hook-form` 7 + `@hookform/resolvers` + `zod` 4 (login form), `@tanstack/react-query` 5 (`useAuth`), Next.js middleware (Edge runtime)

**Storage**: httpOnly `session` cookie holding the FastAPI JWT; `maxAge` derived from the JWT `exp`

**Testing**: Playwright — `tests/e2e/auth.spec.ts`, `tests/e2e/role-gating.spec.ts`, helpers in `tests/e2e/utils.ts` (`makeFakeJwt`, `loginAs`, `mockMe`)

**Target Platform**: Node.js 20 (route handlers), Edge runtime (middleware), modern browsers

**Project Type**: Web application frontend (BFF)

**Constraints**: No crypto/jose dependency — JWT decoding uses Edge-safe `atob`; no signature verification in the frontend

**Scale/Scope**: 3 route handlers, 1 middleware, 3 pages, 1 form component, 1 hook, 1 service, 2 lib modules

## Architecture & Data Flow

```text
Login
  components/auth/login-form.tsx ─ services/auth.ts#login ─► POST /api/auth/login (route handler)
      └─► POST ${BACKEND_URL}/api/v1/auth/login ─► { access_token }
      ◄─ 200 { role } + Set-Cookie: session=<jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=exp-now
  └─ router.push(roleHomePath(role)); router.refresh()

Current user
  hooks/use-auth.ts (useQuery ["auth","me"], staleTime ∞) ─ services/auth.ts#getCurrentUser ─► GET /api/auth/me
      └─ decodeJwtPayload(cookie) ─► { id, email, role } | 401 null

Logout
  useAuth().logout ─ services/auth.ts#logout ─► POST /api/auth/logout (deletes cookie)
  └─ queryClient.clear(); window.location.href = loginPathForRole(role)

Every page navigation (non-/api, non-static)
  middleware.ts ─ decodeJwtPayload/isJwtExpired ─► next | redirect(login) | redirect(/unauthorized) | redirect(role home)
```

Note: `services/auth.ts` uses `fetch` directly against `/api/auth/*`, not `apiFetch` — allowed by Constitution I ("or `app/api/auth/*` for session lifecycle"); `apiFetch` is hard-wired to `/api/backend/`.

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. BFF Security Boundary | PASS | Token set httpOnly in `app/api/auth/login/route.ts`; login response body only contains `role`; middleware checks are explicitly UX-only (comments in `lib/jwt.ts`, `middleware.ts`). |
| II. Layered Data Access | PASS | Form → `services/auth.ts`; user state via `hooks/use-auth.ts` (React Query). Login form uses react-hook-form + zod. Login itself is not a `useMutation` (direct service call in `onSubmit`) — acceptable since it does not touch cached server state, but noted. |
| III. Contract-First | PASS (with unknowns) | [contracts/auth.md](contracts/auth.md); backend login response fields beyond `access_token` and error codes beyond 401 are UNVERIFIED. |
| IV. Test Every User Story | VIOLATION | Login and `/admin` gating are covered; logout, `/api/auth/me` failure, expired-token redirect, `/` role redirect and client-side validation messages have no tests. |
| V. Pinned Stack & Base UI | PASS | `Button render={<Link/>}` on `/unauthorized`; hand-written `components/ui/form.tsx` used. |
| VI. Simplicity | PASS | No auth library; ~30-line JWT decode. |

## Project Structure

### Documentation (this feature)

```text
specs/002-authentication/
├── spec.md
├── plan.md
├── contracts/auth.md
├── 01-login/{spec,plan,tasks}.md
├── 02-session-and-logout/{spec,plan,tasks}.md
└── 03-role-based-routing/{spec,plan,tasks}.md
```

### Source Code (repository root)

```text
app/
├── login/page.tsx                 # general sign-in
├── admin/login/page.tsx           # admin portal sign-in (outside (protected))
├── unauthorized/page.tsx          # access denied
├── (protected)/page.tsx           # "/" fallback redirect by role
└── api/auth/
    ├── login/route.ts             # credentials → FastAPI → httpOnly cookie
    ├── me/route.ts                # cookie → { id, email, role }
    └── logout/route.ts            # delete cookie
components/auth/login-form.tsx     # RHF + zod form, optional requireRole
hooks/use-auth.ts                  # useAuth(): user, isLoading, logout()
services/auth.ts                   # login(), logout(), getCurrentUser()
lib/jwt.ts                         # decodeJwtPayload(), isJwtExpired()
lib/roles.ts                       # roleHomePath(), loginPathForRole(), loginPathForPathname()
lib/env.ts                         # SESSION_COOKIE_NAME, BACKEND_URL
types/user.ts                      # UserRole, AuthUser
middleware.ts                      # auth + role routing
tests/e2e/auth.spec.ts
tests/e2e/role-gating.spec.ts
tests/e2e/utils.ts
```

**Structure Decision**: Auth route handlers live beside the generic proxy under `app/api/`; login pages sit outside `(protected)` so they render without the sidebar shell.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Principle IV coverage gaps | Existing code predates the constitution | Not a justified deviation — tracked as GAP tasks. |
