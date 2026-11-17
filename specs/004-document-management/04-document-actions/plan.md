# Implementation Plan: Document Actions

**Branch**: `004-document-management` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

Three React Query mutations in `hooks/use-documents.ts` back the row actions in
`DocumentTable` and the header actions in `DocumentDetail`; replace uses a small dedicated
dialog component.

## Files Involved

| File | Role |
|------|------|
| `components/documents/document-table.tsx` | Row Reprocess (`mutate`), row Delete → `AlertDialog` (`mutate`, closes immediately) |
| `components/documents/document-detail.tsx` | Replace (opens dialog), Reprocess (`mutate`), Delete → `AlertDialog` (`mutateAsync` then `router.push("/admin/documents")`) |
| `components/documents/document-replace-dialog.tsx` | File input (`accept="application/pdf"`), local `file` state, `mutateAsync`, close on success |
| `hooks/use-documents.ts` | `useReprocessDocument`, `useReplaceDocument`, `useDeleteDocument` |
| `services/documents.ts` | `reprocessDocument` (POST `documents/reprocess/{id}`), `replaceDocument` (PUT `documents/{id}/replace`, `FormData`), `deleteDocument` (DELETE `documents/{id}`) |
| `services/api-client.ts` | Skips JSON content-type for `FormData`; 204 → `undefined` |
| `components/ui/alert-dialog.tsx` | `AlertDialogAction` is a plain `Button` (does not auto-close); `AlertDialogCancel` is a Close |
| `components/ui/dialog.tsx`, `input.tsx` | Replace dialog UI |

## State & Data Flow

- List: `deletingDocument` state drives the confirm dialog; confirm → `mutate(id)` + clear.
- Detail: `replaceOpen`, `deleteOpen` booleans.
- All mutations → `invalidateQueries(["documents"])` → active list/detail queries refetch →
  polling re-engages if the returned status is in flight.

## Error / Loading Handling

- Reprocess: button disabled while `isPending`.
- Replace: button disabled while no file or pending; label "Replacing…".
- Delete: no pending indicator in either view.
- Errors: toast from hook `onError`; detail delete and replace leave their dialogs open.

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I. BFF | PASS | All via `apiFetch` → `/api/backend/documents…`. |
| II. Layered | VIOLATION | Replace dialog is a form without react-hook-form + zod (file presence checked ad hoc). Layering and invalidation otherwise correct. |
| III. Contract-First | PASS (caveat) | Endpoints documented; no mocks exist for any of the three — shapes/status codes UNVERIFIED. |
| IV. Tests | VIOLATION | None of reprocess / replace / delete has a Playwright test. |
| V. Base UI | PASS | |
| VI. Simplicity | PASS | |
