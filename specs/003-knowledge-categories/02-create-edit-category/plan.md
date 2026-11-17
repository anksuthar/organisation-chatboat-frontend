# Implementation Plan: Create & Edit Category

**Branch**: `003-knowledge-categories` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

`CategoryTable` owns `formOpen` + `editingCategory` state and renders `CategoryFormDialog`.
The dialog is a react-hook-form/zod form that calls `useCreateCategory` or `useUpdateCategory`
depending on whether a category is passed.

## Files Involved

| File | Role |
|------|------|
| `components/categories/category-table.tsx` | "New category" button (`openCreateDialog`) and per-row Edit button (`openEditDialog`); renders the dialog |
| `components/categories/category-form-dialog.tsx` | Dialog, zod schema, `useEffect` reset on open, submit handler |
| `hooks/use-categories.ts` | `useCreateCategory`, `useUpdateCategory` (invalidate + toasts) |
| `services/categories.ts` | `createCategory` (POST), `updateCategory` (PUT) |
| `types/category.ts` | `CategoryCreateInput`, `CategoryUpdateInput` |
| `components/ui/dialog.tsx`, `components/ui/form.tsx` (hand-written), `components/ui/input.tsx`, `components/ui/textarea.tsx`, `components/ui/button.tsx` | UI |

## State & Data Flow

1. Click "New category" → `editingCategory = null`, `formOpen = true`.
   Click "Edit X" → `editingCategory = X`, `formOpen = true`.
2. `useEffect([open, category])` → `form.reset({ name, description })`.
3. Submit → zod validate → `mutateAsync` (create or update) → `onSuccess`: invalidate
   `["categories"]`, toast → component calls `onOpenChange(false)`.
4. Failure → `onError` toast; `mutateAsync` rejects, so `onOpenChange(false)` is skipped and the
   dialog stays open.

## Error / Loading Handling

- Pending: Save disabled, label "Saving…".
- Validation errors: `FormMessage` under each field.
- API errors: toast with `ApiError.message` (backend `detail` or status text). Rejection is not
  caught in `onSubmit` (console unhandled rejection).

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I. BFF | PASS | |
| II. Layered | PASS | rhf + zod; hooks invalidate `["categories"]`. |
| III. Contract-First | PASS (caveat) | POST/PUT documented; duplicate-name/422 behaviour UNVERIFIED. |
| IV. Tests | VIOLATION | Create + edit happy paths covered (`tests/e2e/categories.spec.ts`); validation message and backend-error toast not covered. |
| V. Base UI | PASS | Uses hand-written `components/ui/form.tsx`. |
| VI. Simplicity | PASS | Single shared dialog for create/edit. |
