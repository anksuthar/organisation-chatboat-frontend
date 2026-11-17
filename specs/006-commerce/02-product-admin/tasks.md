# Tasks: Product Admin

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/products.md](../contracts/products.md)

**Format**: `[ID] [P?] [Story] Description` — `[X]` = verified present in code; `GAP:` = required by spec/constitution but missing.

## Phase 1: Foundational

- [X] T001 [P] Define `ProductItem`, `ProductDetail`, `ProductImage`, `ProductCreateInput`, `ProductUpdateInput` in types/product.ts
- [X] T002 [P] Implement list/get/update/delete/addImages/removeImage via `apiFetch`, upload via `axios` with progress, and `productImageUrl()` in services/products.ts
- [X] T003 Implement React Query hooks with `["products"]` invalidation, toasts and upload `progress` state in hooks/use-products.ts
- [X] T004 Add "Products" and "Add Product" entries to `adminNavItems` in components/layout/app-sidebar.tsx

## Phase 2: User Story 1 - Browse and filter (P1)

- [X] T005 [US1] Route component in app/(protected)/admin/products/page.tsx
- [X] T006 [US1] Table with category filter (`null` → "all"), category name resolution, status badge, skeleton/empty states in components/products/product-table.tsx
- [ ] T007 [US1] GAP: Playwright test for list rendering and `?category_id=` filter with mocked backend in tests/e2e/products.spec.ts
- [ ] T008 [US1] GAP: Playwright role-gating test for `/admin/products`, `/admin/products/new`, `/admin/products/{id}` in tests/e2e/role-gating.spec.ts
- [ ] T009 [US1] GAP: Render an error state when `useProducts()` fails in components/products/product-table.tsx

## Phase 3: User Story 2 - Create with photos (P1)

- [X] T010 [US2] Route component in app/(protected)/admin/products/new/page.tsx
- [X] T011 [US2] zod schema, dropzone (JPEG/PNG/WebP), previews with object-URL cleanup, progress bar and redirect in components/products/product-upload-form.tsx
- [ ] T012 [US2] GAP: Playwright test for required-field messages, multipart submit, progress and redirect in tests/e2e/products.spec.ts
- [ ] T013 [US2] GAP: Surface backend `detail` for axios upload errors (currently "Request failed with status code N") in services/products.ts
- [ ] T014 [US2] GAP: Validate `price` as a non-negative decimal and `stockQuantity` as a non-negative integer in zod (currently only non-empty) in components/products/product-upload-form.tsx
- [ ] T015 [US2] GAP: Handle `null` from Base UI `Select.onValueChange` for `categoryId` (Constitution V) in components/products/product-upload-form.tsx

## Phase 4: User Story 3 - View and edit (P2)

- [X] T016 [US3] Route component awaiting `params` in app/(protected)/admin/products/[id]/page.tsx
- [X] T017 [US3] Detail header, stat cards, description in components/products/product-detail.tsx
- [X] T018 [US3] Edit dialog with zod schema, reset-on-open, string→number/boolean mapping in components/products/product-edit-dialog.tsx
- [ ] T019 [US3] GAP: Playwright test for detail render and edit flow in tests/e2e/products.spec.ts
- [ ] T020 [US3] GAP: Show an error / not-found state instead of an indefinite skeleton when `useProduct()` fails in components/products/product-detail.tsx
- [ ] T021 [US3] GAP: Allow editing `description` (supported by `ProductUpdateInput`, missing from dialog) in components/products/product-edit-dialog.tsx
- [ ] T022 [US3] GAP: Allow clearing the category (no "No category" option; empty value is omitted, never `null`) in components/products/product-edit-dialog.tsx
- [ ] T023 [US3] GAP: Handle `null` from `Select.onValueChange` for `categoryId`/`isActive` (Constitution V) in components/products/product-edit-dialog.tsx

## Phase 5: User Story 4 - Manage photos (P2)

- [X] T024 [US4] "Add photos" hidden file input (multiple, JPEG/PNG/WebP) and hover "Remove photo" button in components/products/product-detail.tsx
- [ ] T025 [US4] GAP: Playwright test for add/remove photo with mocked `POST .../images` and `DELETE .../images/{imageId}` in tests/e2e/products.spec.ts

## Phase 6: User Story 5 - Delete (P3)

- [X] T026 [US5] Confirmed delete from list in components/products/product-table.tsx
- [X] T027 [US5] Confirmed delete from detail with redirect to `/admin/products` in components/products/product-detail.tsx
- [ ] T028 [US5] GAP: Playwright test for delete from list and from detail in tests/e2e/products.spec.ts

## Phase 7: Cross-cutting

- [ ] T029 GAP: Verify contracts/products.md against backend OpenAPI (status codes, SKU uniqueness, category clearing, delete side-effects) and link backend spec (Constitution III) in specs/006-commerce/contracts/products.md

## Gap summary

- T007, T012, T019, T025, T028: no E2E coverage for any user story (Constitution IV).
- T008: no role-gating test for product admin routes.
- T009, T020: query errors render blank table / endless skeleton.
- T013: axios upload errors hide the backend message.
- T014: weak numeric validation (HTML attributes only).
- T015, T023: Base UI `Select` `null` case unhandled (Constitution V).
- T021, T022: description and category cannot be edited/cleared after creation.
- T029: contract not verified against backend (Constitution III).
