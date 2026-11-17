# Tasks: Profile

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/profile.md](../contracts/profile.md), [../contracts/auth-me.md](../contracts/auth-me.md)

**Format**: `[ID] [P?] [Story] Description` — `[X]` = verified present in code; `GAP:` = required by spec/constitution but missing.

## Phase 1: Foundational

- [X] T001 [P] Define `Profile`, `ProfileUpdateInput` in types/profile.ts
- [X] T002 [P] `getProfile`, `updateProfile` over `apiFetch` in services/profile.ts
- [X] T003 `useProfile`, `useUpdateProfile` with `["profile"]` invalidation and toasts in hooks/use-profile.ts
- [X] T004 "Profile" entry in `staffNavItems` and `customerNavItems` in components/layout/app-sidebar.tsx

## Phase 2: User Story 1 - Account details (P1)

- [X] T005 [US1] Account details card (email, role, skeleton) using `useAuth()` in app/(protected)/profile/page.tsx
- [ ] T006 [US1] GAP: Playwright test that `/profile` shows email and role for admin, employee and customer with mocked `/api/auth/me` in tests/e2e/profile.spec.ts

## Phase 3: User Story 2 - Shipping & contact details (P1, customer)

- [X] T007 [US2] Customer-only render of `ShippingDetailsForm` in app/(protected)/profile/page.tsx
- [X] T008 [US2] RHF + zod form, prefill via `form.reset`, camel↔snake mapping, "Saving…" state in components/profile/shipping-details-form.tsx
- [ ] T009 [US2] GAP: Playwright test for prefill, save (`PUT /api/backend/profile` payload, "Profile updated" toast) and error toast in tests/e2e/profile.spec.ts
- [ ] T010 [US2] GAP: Playwright test that employee/admin do not see the shipping card and no `/api/backend/profile` request is made in tests/e2e/profile.spec.ts
- [X] T011 [US2] GAP: Show an error state and block Save when `useProfile()` fails, to avoid overwriting stored details with empty strings, in components/profile/shipping-details-form.tsx — FIXED (2026-11-16): form is rendered only once profile data exists; otherwise `<QueryError>` with Retry is shown, so Save can't submit empty strings
- [X] T012 [US2] GAP: Catch `mutateAsync` rejection in `onSubmit` in components/profile/shipping-details-form.tsx — FIXED (2026-11-16): `onSubmit` wraps `mutateAsync` in try/catch (hook already toasts the error)

## Phase 4: Cross-cutting

- [ ] T013 GAP: Verify contracts/profile.md against backend OpenAPI (empty-string vs null semantics, validation, role policy) and link backend spec (Constitution III) in specs/008-profile-settings/contracts/profile.md

## Gap summary

- T006, T009, T010: no E2E coverage for any user story or the role-conditional form (Constitution IV).
- T011: FIXED (2026-11-16) — QueryError + Retry, form not rendered without loaded profile.
- T012: FIXED (2026-11-16) — rejection caught; hook's onError toast is the feedback.
- T013: contract unverified (Constitution III).
