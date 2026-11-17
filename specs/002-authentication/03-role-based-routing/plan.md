# Implementation Plan: Role-Based Routing

**Branch**: `002-authentication` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

A single Next.js `middleware.ts` decodes the `session` cookie on every page request and returns `next()` or a redirect. `lib/roles.ts` centralises role → path mappings. `/unauthorized` is a static page; `app/(protected)/page.tsx` is a server-side fallback redirect for `/`.

## Files Involved

| File | Role |
|---|---|
| `middleware.ts` | `PUBLIC_PATHS`, cookie decode/expiry, admin gate, `/` redirect, `config.matcher` |
| `lib/roles.ts` | `roleHomePath()`, `loginPathForRole()`, `loginPathForPathname()` |
| `lib/jwt.ts` | `decodeJwtPayload()`, `isJwtExpired()` (Edge-safe) |
| `lib/env.ts` | `SESSION_COOKIE_NAME` |
| `app/unauthorized/page.tsx` | "Access denied" + `Button render={<Link href="/chat" />}` |
| `app/(protected)/page.tsx` | Server component: `cookies()` → `redirect(roleHomePath(role) \| "/login")` |
| `tests/e2e/utils.ts` | `makeFakeJwt()`, `loginAs()` set a fake httpOnly cookie for routing tests |

## State & Data Flow

Request → middleware:

1. Public path prefix? → `next()`.
2. No cookie → redirect `loginPathForPathname`.
3. Undecodable/expired → redirect `loginPathForPathname` + delete cookie.
4. `/admin*` and role ≠ admin → redirect `/unauthorized`.
5. `/` → redirect `roleHomePath(role)`.
6. else `next()`.

## Error / Loading Handling

Malformed tokens are caught in `decodeJwtPayload` (returns `null`). No other error paths.

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. BFF Security Boundary | PASS | Explicitly UX-only (comments in `lib/jwt.ts`, `middleware.ts`); proxy is not gated here and FastAPI re-validates. |
| II. Layered Data Access | PASS | No data access. |
| III. Contract-First | PASS | Depends only on JWT claims documented in [../contracts/auth.md](../contracts/auth.md). |
| IV. Test Every User Story | PARTIAL | US1 (missing cookie) and US2 covered by `tests/e2e/auth.spec.ts` and `tests/e2e/role-gating.spec.ts`. Expired/malformed-token path (US1 scenario 3) and US3 (`/` redirect) have no tests. |
| V. Pinned Stack & Base UI | PASS | `render` prop on `/unauthorized` button. |
| VI. Simplicity | PASS | One middleware, pure helper functions. |
