# Feature Specification: Document Actions (Reprocess, Replace, Delete)

**Feature Branch**: `004-document-management`
**Created**: 2026-11-16
**Status**: Implemented (retroactive)
**Parent**: [../spec.md](../spec.md)

| Action | Document list row | Document detail page |
|--------|-------------------|----------------------|
| Reprocess | Yes (icon "Reprocess {title}") | Yes ("Reprocess" button) |
| Replace file | No | Yes ("Replace" button → dialog) |
| Delete | Yes (icon "Delete {title}" → confirm) | Yes ("Delete" button → confirm → redirect) |

## User Scenarios & Testing

### User Story 1 - Reprocess a document (Priority: P1)

Re-run ingestion, e.g. after a failure or pipeline change.

**Independent Test**: Mock `POST /api/backend/documents/reprocess/{id}`; click "Reprocess X" in
the list; assert the request and the "Reprocessing started" toast.

**Acceptance Scenarios**:

1. **Given** a row or detail page for document `X`, **When** Reprocess is clicked, **Then**
   `POST /api/backend/documents/reprocess/{id}` is sent with no body.
2. **Given** a 2xx response, **Then** toast "Reprocessing started" appears and all
   `["documents"]` queries are invalidated (list/detail refetch; polling resumes if the new
   status is `pending`/`processing`).
3. **Given** a reprocess request is pending, **Then** Reprocess buttons using that mutation
   instance are disabled (in the list this disables every row's Reprocess button).
4. **Given** an error, **Then** an error toast shows the backend `detail` or status text.

---

### User Story 2 - Replace a document's file (Priority: P2)

Upload a new PDF version for an existing document, keeping its id/title/category.

**Independent Test**: Mock `PUT /api/backend/documents/{id}/replace`; open detail, click
Replace, set a file, click Replace; assert multipart request and toast.

**Acceptance Scenarios**:

1. **Given** the detail page, **When** "Replace" is clicked, **Then** a dialog "Replace document"
   opens with a file input (`accept="application/pdf"`) and Cancel / Replace buttons; Replace is
   disabled until a file is chosen.
2. **When** Replace is clicked with a file, **Then** `PUT /api/backend/documents/{id}/replace`
   is sent as multipart with field `file`; the button reads "Replacing…" and is disabled while
   pending.
3. **Given** success, **Then** toast "Document replaced — reprocessing started", `["documents"]`
   invalidated, the selected file cleared and the dialog closed.
4. **Given** failure, **Then** an error toast is shown and the dialog stays open.

---

### User Story 3 - Delete a document (Priority: P1)

**Independent Test**: Mock `DELETE /api/backend/documents/{id}` (204); confirm in list; assert
the row disappears after refetch.

**Acceptance Scenarios**:

1. **Given** Delete is clicked (list or detail), **Then** an alert dialog `Delete "{title}"?`
   with "This removes the file, its extracted chunks, and its vectors. This cannot be undone."
   and Cancel / Delete is shown.
2. **From the list**: on confirm the dialog closes immediately and
   `DELETE /api/backend/documents/{id}` is sent; on success toast "Document deleted" and the
   list refetches.
3. **From the detail page**: on confirm the request is awaited with the dialog still open; on
   success toast "Document deleted" and navigation to `/admin/documents`; on failure an error
   toast is shown and the admin stays on the page with the dialog open.
4. **When** Cancel is clicked, **Then** no request is sent.

### Edge Cases

- Replace file input only hints PDF via `accept`; any file chosen through "All files" is sent;
  backend validation **UNVERIFIED**.
- Replace dialog does not reset `file` on Cancel; if the dialog content unmounts on close the
  input appears empty on reopen while the Replace button is still enabled with the old file.
- Detail-page Delete button (`AlertDialogAction`, a plain button) is not disabled while the
  delete is pending → double-click can send two DELETE requests.
- After a successful detail-page delete, invalidation also refetches the now-deleted
  `["documents", id]` query (expected 404) before navigation completes.
- `mutateAsync` rejections in replace dialog and detail delete are not caught (unhandled
  promise rejection after the error toast).
- Reprocess has no confirmation step.

## Requirements

### Functional Requirements

- **FR-001**: Reprocess MUST call `POST documents/reprocess/{id}` via `useReprocessDocument`.
- **FR-002**: Replace MUST call `PUT documents/{id}/replace` with multipart `file` via
  `useReplaceDocument` (through `apiFetch`, which omits the JSON content-type for `FormData`).
- **FR-003**: Delete MUST require confirmation and call `DELETE documents/{id}` via
  `useDeleteDocument`.
- **FR-004**: All three mutations MUST invalidate `["documents"]` on success and toast:
  "Reprocessing started" / "Document replaced — reprocessing started" / "Document deleted".
- **FR-005**: All three MUST toast `error.message` on failure.
- **FR-006**: Detail-page delete MUST navigate to `/admin/documents` only after success.

### Key Entities

- **DocumentItem** (response of reprocess/replace) — see [../contracts/documents.md](../contracts/documents.md).

## Success Criteria

- **SC-001**: A failed document can be retried in one click from either view.
- **SC-002**: No document is deleted without explicit confirmation.

## Assumptions

- Replace and reprocess both trigger asynchronous re-ingestion server-side (per toast copy).
