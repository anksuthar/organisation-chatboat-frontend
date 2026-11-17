# Implementation Plan: Delete Category

**Branch**: `003-knowledge-categories` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

`CategoryTable` stores the row to delete in `deletingCategory`; a Base UI `AlertDialog` is open
while it is non-null. Confirm calls `useDeleteCategory().mutate(id)` and clears the state.

## Files Involved

| File | Role |
|------|------|
| `components/categories/category-table.tsx` | Trash button, `deletingCategory` state, `AlertDialog` |
| `hooks/use-categories.ts` | `useDeleteCategory` (invalidate `["categories"]`, toasts) |
| `services/categories.ts` | `deleteCategory(id)` → `DELETE categories/{id}` |
| `services/api-client.ts` | Returns `undefined` on 204 |
| `components/ui/alert-dialog.tsx` | Confirmation UI |

## State & Data Flow

Trash click → `setDeletingCategory(row)` → dialog open → "Delete" → `mutate(id)` +
`setDeletingCategory(null)` → `onSuccess` invalidate + toast / `onError` toast.

## Error / Loading Handling

- No pending indicator (dialog closes immediately).
- Error surfaced via toast only.

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I. BFF | PASS | |
| II. Layered | PASS | Invalidates `["categories"]`; does not invalidate `["documents"]` (acceptable — documents only reference `category_id`). |
| III. Contract-First | PASS (caveat) | Delete-with-documents behaviour UNVERIFIED. |
| IV. Tests | VIOLATION | Happy path covered (`tests/e2e/categories.spec.ts`); cancel and backend-error paths not covered. |
| V. Base UI | PASS | |
| VI. Simplicity | PASS | |
