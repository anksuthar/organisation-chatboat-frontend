# Feature Specification: Profile & Settings

**Feature Branch**: `008-profile-settings`
**Created**: 2026-11-16
**Status**: Implemented (retroactive spec — documents existing code)
**Input**: Reverse-engineered from `app/(protected)/profile/page.tsx`, `app/(protected)/settings/page.tsx`, `components/profile/shipping-details-form.tsx`, `components/layout/theme-toggle.tsx`, `hooks/use-profile.ts`.

## Purpose

Gives every signed-in user a page showing their account identity and a settings page for
appearance (light/dark theme). Customers additionally maintain shipping and contact details
used by the commerce feature (see `specs/006-commerce/`).

## Actors / Roles

| Role | `/profile` | `/settings` |
|------|-----------|-------------|
| `customer` | Account details + Shipping & contact details form | Theme toggle |
| `employee` | Account details only | Theme toggle |
| `admin` | Account details only | Theme toggle |

All three roles get "Profile" and "Settings" in the sidebar's main nav
(`staffNavItems` for admin/employee, `customerNavItems` for customers). Neither route is
role-gated by `middleware.ts` beyond requiring a valid session.

## Sub-specifications

| # | Sub-feature | Summary |
|---|-------------|---------|
| 01 | [Profile](01-profile/spec.md) | Read-only account details (email, role) from the session, plus a customer-only shipping/contact form backed by `GET/PUT /api/backend/profile` |
| 02 | [Settings: appearance](02-settings-appearance/spec.md) | Light/dark theme toggle via `next-themes`, on the Settings page and in the site header |

## Cross-cutting Requirements

- **CR-001**: Account identity MUST come from the BFF session endpoint `/api/auth/me` (JWT decoded server-side), not from the backend profile resource.
- **CR-002**: Profile reads/writes MUST go through `services/profile.ts` → `/api/backend/profile`.
- **CR-003**: Theme state is client-only (`next-themes`, `attribute="class"`, `defaultTheme="system"`), persisted by `next-themes` in browser storage; no backend call.

## Success Criteria

- **SC-001**: Any signed-in user can see which account and role they are signed in with in one click from the sidebar.
- **SC-002**: A customer can save shipping details and see them prefilled on the next visit.
- **SC-003**: Every user story has a Playwright test with mocked `/api/auth/me` and `/api/backend/profile` (currently **not met**).

## Assumptions

- The backend `profile` resource is customer-oriented; non-customers are never shown the form, so whether the endpoint works for them is irrelevant to the UI (UNVERIFIED).
- Changing name, email or password is out of scope; no UI exists for it.
