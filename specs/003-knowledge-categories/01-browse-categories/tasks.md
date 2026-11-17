---
description: "Tasks for Browse Categories (retroactive — [X] = verified in code)"
---

# Tasks: Browse Categories

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/categories.md](../contracts/categories.md)

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [X] T001 [P] Define `Category` type in types/category.ts
- [X] T002 [P] Implement `listCategories()` via `apiFetch("categories")` in services/categories.ts
- [X] T003 Implement `useCategories()` with query key `["categories"]` in hooks/use-categories.ts
- [X] T004 [P] Admin-only `/admin/**` redirect to `/unauthorized` in middleware.ts
- [X] T005 [P] "Categories" admin sidebar link to `/admin/categories` in components/layout/app-sidebar.tsx

## Phase 2: User Story 1 - View all categories (P1)

- [X] T006 [US1] Route rendering `<CategoryTable />` in app/(protected)/admin/categories/page.tsx
- [X] T007 [US1] Table with Name / Description / Actions columns, "—" for empty description in components/categories/category-table.tsx
- [X] T008 [US1] Per-row `Edit {name}` / `Delete {name}` aria-labelled icon buttons in components/categories/category-table.tsx
- [X] T009 [US1] 3-row skeleton while `isLoading` in components/categories/category-table.tsx
- [ ] T010 [P] [US1] GAP: Playwright test rendering a non-empty fixture list (name, "—" for null description, action buttons) in tests/e2e/categories.spec.ts
- [ ] T011 [US1] GAP: Handle `isError` from `useCategories()` with a visible error state/retry in components/categories/category-table.tsx (currently renders an empty table body)

## Phase 3: User Story 2 - Empty state (P2)

- [X] T012 [US2] "No categories yet. Create one to get started." row in components/categories/category-table.tsx
- [X] T013 [US2] E2E assertion of empty state in tests/e2e/categories.spec.ts

## Phase 4: User Story 3 - Admin-only access (P1)

- [X] T014 [US3] Redirect logic in middleware.ts
- [ ] T015 [P] [US3] GAP: Playwright role-gating test that `employee`/`customer` visiting `/admin/categories` land on `/unauthorized` in tests/e2e/role-gating.spec.ts (current tests only cover `/admin`)

## Gap summary

- T010 — no E2E test for populated list rendering.
- T011 — failed list load shows nothing (no error UI).
- T015 — no role-gating test for `/admin/categories`.
