# Implementation Plan: Product Admin

**Branch**: `006-commerce` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

Three admin routes (list, new, detail) over the `products` resource, with a multipart upload
path (axios, for progress) and JSON CRUD via `apiFetch`.

## Files Involved

| Layer | Path |
|-------|------|
| Routes | `app/(protected)/admin/products/page.tsx`, `app/(protected)/admin/products/new/page.tsx`, `app/(protected)/admin/products/[id]/page.tsx` (awaits `params`, passes `Number(id)`) |
| Components | `components/products/product-table.tsx`, `components/products/product-upload-form.tsx`, `components/products/product-detail.tsx`, `components/products/product-edit-dialog.tsx` |
| Hooks | `hooks/use-products.ts` — `useProducts`, `useProduct`, `useUploadProduct` (adds local `progress` state), `useUpdateProduct`, `useAddProductImages`, `useRemoveProductImage`, `useDeleteProduct`; `hooks/use-product-categories.ts` — `useProductCategories` |
| Service | `services/products.ts` (`apiFetch` + `axios.post` for upload; `productImageUrl()` helper) |
| Types | `types/product.ts`, `types/product-category.ts` |
| Guard / Nav | `middleware.ts`; `components/layout/app-sidebar.tsx` ("Products", "Add Product") |
| Libraries | `react-dropzone` (drop zone), `axios` (upload progress), `components/ui/{progress,select,dialog,alert-dialog,card,badge,table,form}.tsx` |

## State & Data Flow

- **List**: local `categoryFilter` ("all" | id string) → `useProducts({ categoryId })`, key `["products", categoryId|"all", ""]`. Filter `Select` handles Base UI `null` with `value ?? "all"`.
- **Create**: local `images: File[]` + derived `previews` (object URLs revoked on change/unmount). `onSubmit` → `upload.mutateAsync({ input, images })` → `router.push("/admin/products")`.
- **Detail**: `useProduct(id)` key `["products", id]`; `useProductCategories()` for the name. Hidden `<input type="file">` triggered by "Add photos"; value reset after each selection.
- **Edit dialog**: RHF form reset from `product` on every open; string form values converted to numbers/booleans before `PUT`.
- All mutations invalidate prefix `["products"]` (refreshes list and detail).

## Error / Loading Handling

- List: skeleton rows / "No products yet."; query error not displayed.
- Detail: `isLoading || !product` → skeleton (also on error — never resolves).
- Mutations: hook-level `toast.error(error.message)`; `mutateAsync` callers (create, edit, detail delete) do not catch, so pages stay put on failure.
- Upload: progress reset to 0 on both success and error.

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF | PASS | `axios.post("/api/backend/products/upload")`, `apiFetch`, `<img src="/api/backend/...">` |
| II. Layered | PASS (note) | `axios` used inside `services/products.ts` for progress (justified in feature plan Complexity Tracking); forms use RHF + zod |
| III. Contract-First | VIOLATION | [contracts/products.md](../contracts/products.md) reconstructed retroactively |
| IV. E2E per story | VIOLATION | No product admin tests |
| V. Base UI | VIOLATION (minor) | Category/Status `Select`s in `product-upload-form.tsx` and `product-edit-dialog.tsx` pass `onValueChange={field.onChange}` without handling `null` |
| VI. Simplicity | PASS | Same shape as documents upload feature |
