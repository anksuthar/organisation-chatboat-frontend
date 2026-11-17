# Tasks: Product Category Admin

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/product-categories.md](../contracts/product-categories.md)

**Format**: `[ID] [P?] [Story] Description` — `[X]` = verified present in code; `GAP:` = required by spec/constitution but missing.

## Phase 1: Foundational

- [X] T001 [P] Define `ProductCategory`, `ProductCategoryCreateInput`, `ProductCategoryUpdateInput` in types/product-category.ts
- [X] T002 [P] Implement list/create/update/delete wrappers over `apiFetch` in services/product-categories.ts
- [X] T003 Implement React Query hooks with `["product-categories"]` invalidation and toasts in hooks/use-product-categories.ts
- [X] T004 Add "Product Categories" entry to `adminNavItems` in components/layout/app-sidebar.tsx

## Phase 2: User Story 1 - View product categories (P1)

- [X] T005 [US1] Render route component in app/(protected)/admin/product-categories/page.tsx
- [X] T006 [US1] Table with skeleton rows, empty-state row, "—" for empty description in components/product-categories/product-category-table.tsx
- [X] T007 [US1] Admin-only redirect for `/admin/**` in middleware.ts
- [ ] T008 [US1] GAP: Playwright test for list, loading and empty state with mocked `GET /api/backend/product-categories` in tests/e2e/product-categories.spec.ts
- [ ] T009 [US1] GAP: Playwright role-gating test that employee/customer visiting `/admin/product-categories` land on `/unauthorized` in tests/e2e/role-gating.spec.ts
- [ ] T010 [US1] GAP: Render an error state when `useProductCategories()` fails (currently blank table) in components/product-categories/product-category-table.tsx

## Phase 3: User Story 2 - Create and edit (P1)

- [X] T011 [US2] zod schema (`name` 1–255 required, `description` ≤2000) and create/edit dialog in components/product-categories/product-category-form-dialog.tsx
- [X] T012 [US2] Reset form from selected category on open in components/product-categories/product-category-form-dialog.tsx
- [X] T013 [US2] "New category" button and pencil action wiring in components/product-categories/product-category-table.tsx
- [ ] T014 [US2] GAP: Playwright test for create, edit prefill, "Name is required" validation and success toast in tests/e2e/product-categories.spec.ts
- [ ] T015 [US2] GAP: Catch `mutateAsync` rejection in `onSubmit` to avoid unhandled promise rejection in components/product-categories/product-category-form-dialog.tsx

## Phase 4: User Story 3 - Delete (P2)

- [X] T016 [US3] Confirm `AlertDialog` and `deleteCategory.mutate` in components/product-categories/product-category-table.tsx
- [ ] T017 [US3] GAP: Playwright test for delete confirm/cancel with mocked `DELETE /api/backend/product-categories/{id}` in tests/e2e/product-categories.spec.ts

## Phase 5: Cross-cutting

- [ ] T018 GAP: Verify contracts/product-categories.md against backend OpenAPI (incl. delete → products uncategorised claim) and link the backend spec (Constitution III) in specs/006-commerce/contracts/product-categories.md

## Gap summary

- T008, T014, T017: no E2E coverage for any user story (Constitution IV).
- T009: no role-gating test for this admin route.
- T010: query errors are silently rendered as an empty table.
- T015: unhandled rejection on failed submit.
- T018: contract not verified against backend (Constitution III).
