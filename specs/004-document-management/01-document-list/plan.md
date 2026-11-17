# Implementation Plan: Document List

**Branch**: `004-document-management` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

`/admin/documents` renders the client `DocumentTable`, which keeps the category filter in local
state, reads `useDocuments(filter)` and `useCategories()`, and renders a Base UI table with
status badges and row actions.

## Files Involved

| File | Role |
|------|------|
| `app/(protected)/admin/documents/page.tsx` | Route → `<DocumentTable />` |
| `components/documents/document-table.tsx` | Heading, filter `Select`, Upload link button, table, row actions, delete `AlertDialog` |
| `components/documents/document-status-badge.tsx` | Status → label + colour classes |
| `hooks/use-documents.ts` | `useDocuments` (conditional polling via `hasInFlightDocument`) |
| `hooks/use-categories.ts` | `useCategories` for filter options / name lookup |
| `services/documents.ts` | `listDocuments(categoryId?)` → `apiFetch("documents[?category_id=]")` |
| `types/document.ts` | `DocumentItem`, `DocumentStatus` |
| `components/ui/select.tsx`, `table.tsx`, `skeleton.tsx`, `button.tsx`, `badge.tsx` | UI |

## State & Data Flow

- Local: `categoryFilter: string` (default `"all"`), `deletingDocument`.
- `Select onValueChange={(v) => setCategoryFilter(v ?? "all")}` (Base UI `null` handled).
- `useDocuments(categoryFilter === "all" ? undefined : Number(categoryFilter))`.
- Polling: `refetchInterval: (q) => hasInFlightDocument(q.state.data) ? 3000 : false`.
- Upload button: `<Button render={<Link href="/admin/documents/upload" />}>`.

## Error / Loading Handling

- Loading: 3 skeleton rows; empty: "No documents yet.".
- Errors: not handled (gap).

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I. BFF | PASS | |
| II. Layered | PASS | Hook-only data access from the component. |
| III. Contract-First | PASS (caveat) | List + `category_id` documented; mock exists. |
| IV. Tests | VIOLATION | US1/US2 covered by `tests/e2e/documents.spec.ts` (badge transition); US3 filter untested; row content (category name, pages, "—") not asserted. |
| V. Base UI | PASS | `render` prop for link buttons; `null` handled in filter. |
| VI. Simplicity | PASS | |
