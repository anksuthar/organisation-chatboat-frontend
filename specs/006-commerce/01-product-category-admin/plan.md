# Implementation Plan: Product Category Admin

**Branch**: `006-commerce` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

Single admin page rendering a table + create/edit dialog + delete confirm, backed by
four React Query hooks over the `product-categories` resource.

## Files Involved

| Layer | Path |
|-------|------|
| Route | `app/(protected)/admin/product-categories/page.tsx` (server, renders `ProductCategoryTable`) |
| Components | `components/product-categories/product-category-table.tsx`, `components/product-categories/product-category-form-dialog.tsx` |
| Hooks | `hooks/use-product-categories.ts` — `useProductCategories`, `useCreateProductCategory`, `useUpdateProductCategory`, `useDeleteProductCategory` |
| Service | `services/product-categories.ts` |
| Types | `types/product-category.ts` |
| Routing guard | `middleware.ts` (`/admin` prefix → admin only) |
| Nav | `components/layout/app-sidebar.tsx` (`adminNavItems`) |
| UI primitives | `components/ui/{table,dialog,alert-dialog,form,input,textarea,button,skeleton}.tsx` |

## State & Data Flow

- `ProductCategoryTable` holds local UI state: `formOpen`, `editingCategory`, `deletingCategory`.
- Data: `useProductCategories()` → `listProductCategories()` → `GET /api/backend/product-categories`, key `["product-categories"]`.
- Create/edit: dialog `onSubmit` → `mutateAsync` → on success the hook invalidates the key + `toast.success`, then the dialog closes via `onOpenChange(false)`.
- Delete: `AlertDialogAction` → `deleteCategory.mutate(id)` and clears `deletingCategory` immediately (not awaited).

## Error / Loading Handling

- Loading: 3 skeleton rows. Empty: explanatory row.
- Mutation errors: `toast.error(error.message)` from the hook; `mutateAsync` rejection is not caught in `onSubmit`, so the dialog stays open (and an unhandled rejection is raised from `handleSubmit`).
- Query error: not handled (blank table body).

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF | PASS | `apiFetch` → `/api/backend/product-categories` |
| II. Layered | PASS | page → component → hook → service; RHF + zod form; invalidation on every mutation |
| III. Contract-First | VIOLATION | Contract reconstructed retroactively ([contracts/product-categories.md](../contracts/product-categories.md)); not cross-checked with backend OpenAPI |
| IV. E2E per story | VIOLATION | No `tests/e2e/product-categories.spec.ts`; role-gating test covers only `/admin` |
| V. Base UI | PASS | No `asChild`; no `Select` used |
| VI. Simplicity | PASS | Mirrors `components/categories/*` |
