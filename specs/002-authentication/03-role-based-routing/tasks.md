---
description: "Tasks for Role-Based Routing (retro-documented)"
---

# Tasks: Role-Based Routing

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/auth.md](../contracts/auth.md)

**Legend**: `[X]` = implemented in current code (file cited); `[ ]` = gap.

## Phase 1: Foundational

- [X] T001 [P] Edge-safe JWT decode and expiry check in lib/jwt.ts
- [X] T002 [P] `roleHomePath()`, `loginPathForPathname()` in lib/roles.ts
- [X] T003 Middleware matcher excluding `api`, `_next/static`, `_next/image`, `favicon.ico` in middleware.ts
- [X] T004 [P] Test helpers `makeFakeJwt()`, `loginAs()` in tests/e2e/utils.ts

## Phase 2: User Story 1 - Unauthenticated redirects (P1)

- [X] T005 [US1] Public paths `/login`, `/admin/login`, `/unauthorized` in middleware.ts
- [X] T006 [US1] Missing cookie → `loginPathForPathname()` redirect in middleware.ts
- [X] T007 [US1] Undecodable/expired token → redirect and delete cookie in middleware.ts
- [X] T008 [US1] E2E: unauthenticated `/admin` → `/admin/login`, `/chat` → `/login` in tests/e2e/auth.spec.ts
- [ ] T009 [US1] GAP: No test for expired or malformed token (redirect + cookie deletion) in tests/e2e/auth.spec.ts
- [ ] T010 [US1] GAP: `PUBLIC_PATHS` prefix match is broader than intended (e.g. `/login-anything`, `/unauthorizedX`) — match exact path or path + "/" in middleware.ts

## Phase 3: User Story 2 - Admin area gating (P1)

- [X] T011 [US2] Non-admin on `/admin*` → `/unauthorized` in middleware.ts
- [X] T012 [US2] "Access denied" page with "Back to chat" link in app/unauthorized/page.tsx
- [X] T013 [US2] E2E: employee/customer blocked, admin allowed in tests/e2e/role-gating.spec.ts
- [ ] T014 [US2] GAP: Commerce pages (`/shop`, `/cart`, `/orders`, `/tickets`) are not role-gated for non-customers [NEEDS CLARIFICATION] in middleware.ts

## Phase 4: User Story 3 - Root redirect (P2)

- [X] T015 [US3] `/` → `roleHomePath(role)` in middleware.ts
- [X] T016 [US3] Defense-in-depth server redirect in app/(protected)/page.tsx
- [ ] T017 [US3] GAP: No Playwright test for `/` redirect per role in tests/e2e/role-gating.spec.ts

## Gap summary

- T009 — expired/malformed-token path untested (Constitution IV).
- T010 — overly broad public-path prefix match.
- T014 — commerce routes reachable by any authenticated role (needs clarification).
- T017 — root redirect untested (Constitution IV).
