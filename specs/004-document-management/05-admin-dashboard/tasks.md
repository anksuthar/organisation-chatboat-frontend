---
description: "Tasks for Admin Dashboard (retroactive — [X] = verified in code)"
---

# Tasks: Admin Dashboard

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/documents.md](../contracts/documents.md), [../contracts/categories.md](../contracts/categories.md)

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [X] T001 [P] `roleHomePath` sends admins to `/admin` in lib/roles.ts
- [X] T002 [P] "Dashboard" admin sidebar link in components/layout/app-sidebar.tsx

## Phase 2: User Story 1 - Knowledge-base health (P2)

- [X] T003 [US1] "Admin dashboard" heading and "Upload document" link button in app/(protected)/admin/page.tsx
- [X] T004 [US1] Four stat cards (Categories, Processed documents, In progress, Failed) with "…" loading values in app/(protected)/admin/page.tsx
- [X] T005 [US1] Footer links to `/admin/categories` and `/admin/documents` in app/(protected)/admin/page.tsx
- [ ] T006 [US1] GAP: Show an error indicator instead of `0` when `useCategories`/`useDocuments` fail in app/(protected)/admin/page.tsx
- [ ] T007 [P] [US1] GAP: Playwright test asserting card values from mixed-status document fixtures in tests/e2e/role-gating.spec.ts (or a new tests/e2e/admin-dashboard.spec.ts)

## Phase 3: User Story 2 - Admin-only (P1)

- [X] T008 [US2] `/admin/**` admin-only redirect in middleware.ts
- [X] T009 [US2] E2E: employee and customer redirected to `/unauthorized`; admin sees dashboard heading in tests/e2e/role-gating.spec.ts

## Gap summary

- T006 — fetch errors displayed as zero counts.
- T007 — dashboard counts untested.
