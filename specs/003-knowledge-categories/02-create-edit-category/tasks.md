---
description: "Tasks for Create & Edit Category (retroactive — [X] = verified in code)"
---

# Tasks: Create & Edit Category

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/categories.md](../contracts/categories.md)

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [X] T001 [P] Define `CategoryCreateInput` / `CategoryUpdateInput` in types/category.ts
- [X] T002 [P] Implement `createCategory` (POST) and `updateCategory` (PUT `categories/{id}`) in services/categories.ts
- [X] T003 Implement `useCreateCategory` / `useUpdateCategory` with `["categories"]` invalidation and success/error toasts in hooks/use-categories.ts
- [X] T004 Build shared `CategoryFormDialog` with zod schema (name 1–255 "Name is required", description ≤ 2000) and reset-on-open in components/categories/category-form-dialog.tsx

## Phase 2: User Story 1 - Create a category (P1)

- [X] T005 [US1] "New category" button opening the dialog in create mode in components/categories/category-table.tsx
- [X] T006 [US1] Submit path calling `createCategory.mutateAsync` then closing the dialog in components/categories/category-form-dialog.tsx
- [X] T007 [US1] "Saving…" disabled state while pending in components/categories/category-form-dialog.tsx
- [X] T008 [US1] E2E create happy path in tests/e2e/categories.spec.ts

## Phase 3: User Story 2 - Edit a category (P1)

- [X] T009 [US2] "Edit {name}" button opening the dialog pre-filled in components/categories/category-table.tsx
- [X] T010 [US2] Submit path calling `updateCategory.mutateAsync({ id, input })` in components/categories/category-form-dialog.tsx
- [X] T011 [US2] E2E edit happy path in tests/e2e/categories.spec.ts

## Phase 4: User Story 3 - Validation and failure feedback (P2)

- [X] T012 [US3] Field-level zod messages via `FormMessage` in components/categories/category-form-dialog.tsx
- [X] T013 [US3] Error toast from `ApiError.message`; dialog stays open on failure in hooks/use-categories.ts
- [ ] T014 [P] [US3] GAP: Playwright test that empty Name shows "Name is required" and sends no POST in tests/e2e/categories.spec.ts
- [ ] T015 [P] [US3] GAP: Playwright test that a mocked 4xx `{ detail }` on POST/PUT shows the detail in a toast and keeps the dialog open in tests/e2e/categories.spec.ts
- [ ] T016 [US3] GAP: Catch the `mutateAsync` rejection in `onSubmit` to avoid an unhandled promise rejection (toast already shown by hook) in components/categories/category-form-dialog.tsx

## Gap summary

- T014 — validation not covered by E2E.
- T015 — backend error path not covered by E2E.
- T016 — unhandled rejection on failed save.
