# Implementation Plan: Session & Logout

**Branch**: `002-authentication` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

The session is the httpOnly cookie itself — no server-side session store. `/api/auth/me` decodes it; `useAuth()` caches the result in React Query; logout deletes the cookie and hard-reloads to the role's login page.

## Files Involved

| File | Role |
|---|---|
| `app/api/auth/me/route.ts` | Decode cookie → `{ id, email, role }` or 401 `null` |
| `app/api/auth/logout/route.ts` | Delete `session` cookie, `{ ok: true }` |
| `services/auth.ts` | `getCurrentUser()`, `logout()` |
| `hooks/use-auth.ts` | `useQuery(["auth","me"])`, `logout()` orchestration |
| `lib/jwt.ts` | `decodeJwtPayload()`, `isJwtExpired()` |
| `lib/roles.ts` | `loginPathForRole()` |
| `lib/env.ts` | `SESSION_COOKIE_NAME` |
| Consumers: `components/layout/app-sidebar.tsx`, `components/layout/site-header.tsx` | Read `user`, call `logout()` |

## State & Data Flow

- Read: `useAuth()` → `getCurrentUser()` → `GET /api/auth/me` → cached under `["auth","me"]` indefinitely. `getCurrentUser` never throws on HTTP errors, so the query succeeds with `null`.
- Logout: `redirectTo = loginPathForRole(user?.role ?? "employee")` → `POST /api/auth/logout` → `queryClient.clear()` → `window.location.href = redirectTo`.

## Error / Loading Handling

- 401 from `me` → `user: null` (no error state).
- Logout request failure → unhandled rejection; no redirect.
- No re-fetch on window focus matters since `staleTime` is infinite.

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. BFF Security Boundary | PASS | Token never leaves the server; `me` returns only claims needed for UX. |
| II. Layered Data Access | PASS | Components → `useAuth` (React Query) → `services/auth.ts` → `/api/auth/*`. |
| III. Contract-First | PASS | [../contracts/auth.md](../contracts/auth.md). |
| IV. Test Every User Story | VIOLATION | US1: `/api/auth/me` is only mocked (`mockMe`), no assertion on derived UI or the 401 path. US2 (logout): no test at all. |
| V. Pinned Stack & Base UI | PASS | N/A. |
| VI. Simplicity | PASS | Stateless cookie session; no auth library. |
