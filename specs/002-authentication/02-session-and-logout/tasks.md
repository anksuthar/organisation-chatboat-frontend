---
description: "Tasks for Session & Logout (retro-documented)"
---

# Tasks: Session & Logout

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/auth.md](../contracts/auth.md)

**Legend**: `[X]` = implemented in current code (file cited); `[ ]` = gap.

## Phase 1: Foundational

- [X] T001 [P] `decodeJwtPayload()` and `isJwtExpired()` in lib/jwt.ts
- [X] T002 [P] `loginPathForRole()` in lib/roles.ts
- [X] T003 [P] `AuthUser` type in types/user.ts

## Phase 2: User Story 1 - Know who is signed in (P1)

- [X] T004 [US1] `GET /api/auth/me` returning `{ id, email, role }` or 401 `null` in app/api/auth/me/route.ts
- [X] T005 [US1] `getCurrentUser()` returning `null` on non-2xx in services/auth.ts
- [X] T006 [US1] `useAuth()` query `["auth","me"]`, `staleTime: Infinity`, exposes `user`/`isLoading` in hooks/use-auth.ts
- [X] T007 [US1] Test helper `mockMe(role)` used in tests/e2e/role-gating.spec.ts (mock only)
- [ ] T008 [US1] GAP: No test asserts UI derived from the current user (role badge, footer email) or the `null`/401 path in tests/e2e/
- [ ] T009 [US1] GAP: Expired session mid-use is not detected client-side (cached user, backend 401s, no redirect) — see 001-platform-foundation/02-api-client T011 — in hooks/use-auth.ts

## Phase 3: User Story 2 - Log out (P1)

- [X] T010 [US2] `POST /api/auth/logout` deleting the `session` cookie in app/api/auth/logout/route.ts
- [X] T011 [US2] `logout()` client service in services/auth.ts
- [X] T012 [US2] Role-aware redirect, `queryClient.clear()`, hard navigation in hooks/use-auth.ts
- [X] T013 [US2] Footer logout trigger in components/layout/app-sidebar.tsx
- [ ] T014 [US2] GAP: No Playwright test for logout (admin → `/admin/login`, others → `/login`, cookie cleared) in tests/e2e/auth.spec.ts
- [ ] T015 [US2] GAP: Logout network failure is unhandled (no catch, no redirect, no toast) in hooks/use-auth.ts
- [ ] T016 [US2] GAP: JWT not revoked at the backend on logout [NEEDS CLARIFICATION; backend support UNVERIFIED] in app/api/auth/logout/route.ts

## Gap summary

- T008 — current-user rendering and 401 path untested (Constitution IV).
- T009 — no client-side session-expiry handling.
- T014 — logout untested (Constitution IV).
- T015 — logout failure unhandled.
- T016 — token remains valid server-side after logout (needs clarification).
