# Implementation Plan: Login

**Branch**: `002-authentication` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

Two server-component pages render the client `LoginForm`. The form validates with react-hook-form + zod, calls `services/auth.ts#login` → `POST /api/auth/login`; the route handler exchanges credentials with FastAPI and sets the httpOnly cookie. The admin portal passes `requireRole="admin"` and undoes the session on mismatch.

## Files Involved

| File | Role |
|---|---|
| `app/login/page.tsx` | General sign-in page, link to `/admin/login` |
| `app/admin/login/page.tsx` | Dark-styled admin portal, `LoginForm requireRole="admin"`, link to `/login` |
| `components/auth/login-form.tsx` | `loginSchema`, `useForm` + `zodResolver`, `serverError` state, submit logic |
| `components/ui/form.tsx`, `input.tsx`, `button.tsx` | Hand-written RHF form wrapper and UI primitives |
| `services/auth.ts` | `login(email, password)`, `logout()` |
| `app/api/auth/login/route.ts` | Backend call, cookie set, `{ role }` response |
| `lib/jwt.ts` | `decodeJwtPayload()` for `role` and `exp` |
| `lib/roles.ts` | `roleHomePath()` |
| `lib/env.ts` | `BACKEND_URL`, `SESSION_COOKIE_NAME` |
| `middleware.ts` | `/login`, `/admin/login` in `PUBLIC_PATHS` |

## State & Data Flow

1. RHF state `{ email, password }` → zod validation (client-only).
2. `onSubmit` → clear `serverError` → `login()` → `fetch("/api/auth/login")`.
3. Route: `request.json()` → `fetch(BACKEND_URL/api/v1/auth/login)` → on !ok return backend JSON/status; on ok decode `access_token`, set cookie, return `{ role }`.
4. Client: if `requireRole && role !== requireRole` → `logout()` + `serverError`; else `router.push(roleHomePath(role))`, `router.refresh()`.

## Error / Loading Handling

- Loading: `form.formState.isSubmitting` → disabled button, "Signing in…".
- Field errors: `<FormMessage />` per field.
- Server errors: `serverError` paragraph (`text-destructive`) above the button.
- Route handler has no try/catch (backend down / non-JSON → 500).

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. BFF Security Boundary | PASS | JWT set httpOnly server-side; response body exposes only `role`; backend URL server-only. |
| II. Layered Data Access | PASS | Form uses RHF + zod; network via `services/auth.ts`. Not wrapped in a React Query mutation (no cached state touched). |
| III. Contract-First | PASS | [../contracts/auth.md](../contracts/auth.md). |
| IV. Test Every User Story | PARTIAL | US1, US2 covered in `tests/e2e/auth.spec.ts`; US3 only the server-error scenario — client validation messages untested. Tests mock `/api/auth/login`, so the route handler's cookie logic is never executed under test. |
| V. Pinned Stack & Base UI | PASS | Uses hand-written `components/ui/form.tsx`. |
| VI. Simplicity | PASS | One shared form with an optional `requireRole` prop. |
