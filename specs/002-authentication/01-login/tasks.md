---
description: "Tasks for Login (retro-documented)"
---

# Tasks: Login

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/auth.md](../contracts/auth.md)

**Legend**: `[X]` = implemented in current code (file cited); `[ ]` = gap.

## Phase 1: Foundational

- [X] T001 [P] `UserRole`, `AuthUser` types in types/user.ts
- [X] T002 [P] Edge-safe `decodeJwtPayload()` in lib/jwt.ts
- [X] T003 [P] `roleHomePath()` in lib/roles.ts
- [X] T004 Mark `/login`, `/admin/login` public in middleware.ts

## Phase 2: User Story 1 - General login (P1)

- [X] T005 [US1] Login route: forward credentials to `${BACKEND_URL}/api/v1/auth/login`, pass through errors in app/api/auth/login/route.ts
- [X] T006 [US1] Set httpOnly `session` cookie with `exp`-derived `maxAge`, return `{ role }` in app/api/auth/login/route.ts
- [X] T007 [P] [US1] `login()` client service with `detail` / "Login failed" error in services/auth.ts
- [X] T008 [US1] `LoginForm` with RHF + zod, submit state, redirect to `roleHomePath(role)` + `router.refresh()` in components/auth/login-form.tsx
- [X] T009 [US1] General login page with admin-portal link in app/login/page.tsx
- [X] T010 [US1] E2E: admin/employee/customer login redirects in tests/e2e/auth.spec.ts
- [ ] T011 [US1] GAP: Login route handler has no error handling for malformed request JSON, non-JSON backend responses or backend unreachable (uncaught → 500) in app/api/auth/login/route.ts
- [ ] T012 [US1] GAP: Route handler's cookie-setting is never executed in tests (`/api/auth/login` is fully mocked); add a test that stubs only the backend in tests/e2e/auth.spec.ts

## Phase 3: User Story 2 - Admin portal (P1)

- [X] T013 [US2] Admin portal page using `LoginForm requireRole="admin"` and link back to `/login` in app/admin/login/page.tsx
- [X] T014 [US2] Discard session via `logout()` and show "This sign-in is for admin accounts only." on role mismatch in components/auth/login-form.tsx
- [X] T015 [US2] E2E: admin portal success and non-admin rejection in tests/e2e/auth.spec.ts

## Phase 4: User Story 3 - Validation and error feedback (P2)

- [X] T016 [US3] zod messages "Enter a valid email address" / "Password is required" in components/auth/login-form.tsx
- [X] T017 [US3] Inline server error paragraph in components/auth/login-form.tsx
- [X] T018 [US3] E2E: wrong credentials show inline error in tests/e2e/auth.spec.ts
- [ ] T019 [US3] GAP: No test for client-side validation messages (and that no request is sent) in tests/e2e/auth.spec.ts
- [ ] T020 [US3] GAP: FastAPI 422 array `detail` produces an unreadable error message in services/auth.ts

## Phase 5: Polish

- [ ] T021 GAP: Already-authenticated users are not redirected away from `/login` / `/admin/login` [NEEDS CLARIFICATION whether desired] in middleware.ts
- [ ] T022 GAP: Successful login does not reset the `["auth","me"]` React Query cache (stale user possible when switching accounts without logout) in components/auth/login-form.tsx

## Gap summary

- T011 — login route handler lacks error handling (500 on backend failure).
- T012 — real cookie-setting path untested.
- T019 — client validation untested (Constitution IV).
- T020 — 422 errors unreadable.
- T021 — logged-in users can still view login pages (needs clarification).
- T022 — possible stale cached user after account switch.
