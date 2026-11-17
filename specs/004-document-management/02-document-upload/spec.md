# Feature Specification: Document Upload

**Feature Branch**: `004-document-management`
**Created**: 2026-11-16
**Status**: Implemented (retroactive)
**Parent**: [../spec.md](../spec.md)

## User Scenarios & Testing

### User Story 1 - Upload a PDF into a category (Priority: P1)

An admin drops (or browses for) one PDF, confirms a title, picks a category and clicks Upload.
A progress bar tracks the transfer; on success they land on the document list where the new
document shows as processing.

**Why this priority**: Without uploads there is no knowledge base.

**Independent Test**: Covered by `tests/e2e/documents.spec.ts` — set the file input, fill
Title, choose "HR Policy" in the Category combobox, click Upload, expect URL `/admin/documents`.

**Acceptance Scenarios**:

1. **Given** `/admin/documents/upload`, **Then** an "Upload document" heading, a dashed drop
   zone ("Drag & drop a PDF here, or click to browse" / "PDF only, up to 20MB"), a Title input
   (placeholder "e.g. Leave Policy 2026"), a Category select (placeholder "Select a category")
   and a full-width "Upload" button (disabled until a file is chosen) are shown.
2. **Given** an empty Title, **When** a PDF `report.pdf` is dropped, **Then** Title is
   auto-filled with `report` (trailing `.pdf` stripped, case-insensitive); if Title already has
   a value it is kept.
3. **Given** a selected file, **Then** the drop zone shows the file name, size in MB (2 dp) and a
   "Remove" button that clears the file without opening the file picker.
4. **Given** valid inputs, **When** "Upload" is clicked, **Then** a multipart
   `POST /api/backend/documents/upload` is sent with `title`, `category_id`, `file`; while
   pending a progress bar is shown and the button reads "Uploading… {n}%" (disabled).
5. **Given** a 2xx response, **Then** a toast "Document uploaded — processing started" appears,
   `["documents"]` queries are invalidated, and the browser navigates to `/admin/documents`.

---

### User Story 2 - Validation (Priority: P2)

**Acceptance Scenarios**:

1. **Given** empty Title, **When** submitting, **Then** "Title is required" is shown (max 255
   chars also enforced).
2. **Given** no category selected, **When** submitting, **Then** "Category is required" is shown.
3. **Given** a non-PDF file or more than one file is dropped, **Then** react-dropzone rejects it
   and nothing is selected — no message is shown.

---

### User Story 3 - Upload failure (Priority: P2)

**Acceptance Scenarios**:

1. **Given** the backend responds non-2xx, **Then** an error toast is shown, progress resets to
   0, and the admin stays on the upload page with inputs intact.

### Edge Cases

- **Error text**: the upload uses axios, so the toast shows axios's generic
  `"Request failed with status code N"` rather than the backend `detail`.
- **Size limit**: "up to 20MB" is display text only — no `maxSize` is configured on the
  dropzone; enforcement (if any) is backend-side and **UNVERIFIED**.
- **"Select a PDF file first"**: `onSubmit` sets this error on Title when no file is chosen, but
  the submit button is disabled whenever `!file`, so this path is effectively unreachable.
- **Category select `null`**: Base UI `onValueChange` may emit `null`; it is passed straight to
  `field.onChange`, which would yield zod's generic type error instead of "Category is required".
- Removing the file does not clear an auto-filled title.
- Categories list fails/empty: the select has no options; no hint to create a category first.
- `mutateAsync` rejection is not caught in `onSubmit` (unhandled promise rejection after toast).

## Requirements

### Functional Requirements

- **FR-001**: Drop zone MUST accept a single file of type `application/pdf` / `.pdf`
  (`maxFiles: 1`).
- **FR-002**: Form MUST use react-hook-form + zod
  `{ title: string().min(1,"Title is required").max(255), categoryId: string().min(1,"Category is required") }`.
- **FR-003**: Title MUST be auto-filled from the file name (minus `.pdf`) only when empty.
- **FR-004**: Upload MUST send multipart fields `title`, `category_id` (stringified number),
  `file` to `/api/backend/documents/upload`.
- **FR-005**: Upload progress MUST be reported as an integer percentage
  (`round(loaded/total*100)`) and shown via `Progress` and the button label.
- **FR-006**: On success MUST invalidate `["documents"]`, toast, reset progress, and
  `router.push("/admin/documents")`.
- **FR-007**: On error MUST toast `error.message` and reset progress.
- **FR-008**: Upload button MUST be disabled while pending or when no file is selected.

### Key Entities

- **Upload input**: `{ file: File; title: string; categoryId: number }`; response `DocumentItem`
  — see [../contracts/documents.md](../contracts/documents.md).

## Success Criteria

- **SC-001**: An admin can upload a PDF in ≤ 4 interactions (drop, pick category, upload; title
  auto-filled).
- **SC-002**: Upload progress is visible for the whole transfer.

## Assumptions

- Backend ingests asynchronously and returns immediately with `pending`/`processing`.
