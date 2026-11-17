---
description: "Tasks for Document Actions (retroactive — [X] = verified in code)"
---

# Tasks: Document Actions (Reprocess, Replace, Delete)

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/documents.md](../contracts/documents.md)

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [X] T001 [P] Implement `reprocessDocument`, `replaceDocument` (FormData), `deleteDocument` in services/documents.ts
- [X] T002 Implement `useReprocessDocument`, `useReplaceDocument`, `useDeleteDocument` with `["documents"]` invalidation and toasts in hooks/use-documents.ts

## Phase 2: User Story 1 - Reprocess (P1)

- [X] T003 [P] [US1] Row "Reprocess {title}" button, disabled while pending, in components/documents/document-table.tsx
- [X] T004 [P] [US1] Header "Reprocess" button, disabled while pending, in components/documents/document-detail.tsx
- [ ] T005 [P] [US1] GAP: Playwright test mocking `POST documents/reprocess/{id}` (request sent, "Reprocessing started" toast, status refetch) in tests/e2e/documents.spec.ts

## Phase 3: User Story 2 - Replace file (P2)

- [X] T006 [US2] `DocumentReplaceDialog` with PDF file input, "Replacing…" state, close on success in components/documents/document-replace-dialog.tsx
- [X] T007 [US2] "Replace" header button opening the dialog in components/documents/document-detail.tsx
- [ ] T008 [US2] GAP: Convert replace dialog to react-hook-form + zod (file required, PDF type) per Constitution II in components/documents/document-replace-dialog.tsx
- [ ] T009 [US2] GAP: Reset selected `file` when the dialog closes (Cancel/dismiss), and catch `mutateAsync` rejection, in components/documents/document-replace-dialog.tsx
- [ ] T010 [P] [US2] GAP: Playwright test mocking `PUT documents/{id}/replace` (multipart `file`, toast, dialog closes) in tests/e2e/documents.spec.ts

## Phase 4: User Story 3 - Delete (P1)

- [X] T011 [P] [US3] Row delete with `AlertDialog` confirmation in components/documents/document-table.tsx
- [X] T012 [P] [US3] Detail delete with confirmation, await, then `router.push("/admin/documents")` in components/documents/document-detail.tsx
- [ ] T013 [US3] GAP: Disable the detail-page confirm button while `deleteDocument.isPending` and catch the rejection, to prevent duplicate DELETEs / unhandled rejection, in components/documents/document-detail.tsx
- [ ] T014 [P] [US3] GAP: Playwright tests for delete from list and from detail (confirm, cancel, redirect) in tests/e2e/documents.spec.ts

## Gap summary

- T005 — reprocess untested.
- T008 — replace dialog bypasses rhf + zod (Constitution II).
- T009 — stale file after cancel; unhandled rejection.
- T010 — replace untested.
- T013 — double-submit possible on detail delete; unhandled rejection.
- T014 — delete untested.
