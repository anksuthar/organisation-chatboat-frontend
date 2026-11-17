# Feature Specification: Document Detail

**Feature Branch**: `004-document-management`
**Created**: 2026-11-16
**Status**: Implemented (retroactive)
**Parent**: [../spec.md](../spec.md)

## User Scenarios & Testing

### User Story 1 - Inspect a document and its extracted chunks (Priority: P1)

From the list, an admin clicks "View {title}" and sees the document's metadata and every text
chunk the ingestion pipeline extracted, to verify what the assistant can cite.

**Why this priority**: Only way to verify ingestion quality.

**Independent Test**: Mock `GET /api/backend/documents/{id}` with a processed `DocumentDetail`
containing chunks; visit `/admin/documents/{id}`; assert metadata cards and chunk text.

**Acceptance Scenarios**:

1. **Given** `/admin/documents/{id}`, **When** data loads, **Then** the page shows the title
   (h1), filename, action buttons Replace / Reprocess / Delete (see
   [04-document-actions](../04-document-actions/spec.md)), and four cards: **Status** (badge),
   **Category** (name or `#{category_id}`), **Pages** (`total_pages` or "—"),
   **Chunks embedded** (`chunks.length` when `processed`, otherwise "—").
2. **Then** "Uploaded {relative time}" is shown beneath the cards.
3. **Given** chunks exist, **Then** an "Extracted chunks" section lists each chunk in a
   scrollable area with header "Chunk #{chunk_index} · Page {page_number}" and the chunk text
   as plain text.
4. **Given** no chunks and status `processed`, **Then** "No chunks were extracted." is shown;
   given no chunks and any other status, "Chunks will appear once processing finishes." is shown.
5. **Given** loading (or no data), **Then** a single large skeleton is shown.

---

### User Story 2 - See why processing failed (Priority: P1)

**Acceptance Scenarios**:

1. **Given** `status === "failed"` and a non-null `error_message`, **Then** a destructive alert
   titled "Processing failed" shows the `error_message`.
2. **Given** `status === "failed"` and `error_message` null, **Then** no alert is shown (only the
   Failed badge).

---

### User Story 3 - Live status while processing (Priority: P2)

**Acceptance Scenarios**:

1. **Given** the document is `pending` or `processing`, **Then** it refetches every 3 s; polling
   stops once `processed` or `failed`, and chunks/counts appear without reload.

### Edge Cases

- **Not found / request error**: `useDocument` errors leave `document` undefined, so the
  skeleton is shown indefinitely — no "not found" or error message.
- **Non-numeric route id**: `Number(id)` yields `NaN`; request goes to `documents/NaN`.
- **Cache-key collision** with the filtered list (`["documents", id]` vs
  `["documents", categoryId]`): the detail can receive a cached `DocumentItem[]` and crash on
  `document.chunks.length`.
- Very large chunk counts are all rendered (no virtualisation/pagination).
- Chunk text is rendered as plain escaped text, not via `react-markdown` (see parent plan).

## Requirements

### Functional Requirements

- **FR-001**: Route `app/(protected)/admin/documents/[id]/page.tsx` MUST await `params` and pass
  `Number(id)` to `DocumentDetail`.
- **FR-002**: Data MUST come from `useDocument(id)` (key `["documents", id]`) →
  `GET /api/backend/documents/{id}`.
- **FR-003**: `useDocument` MUST poll every 3000 ms while status is `pending`/`processing`.
- **FR-004**: Category name MUST resolve via `useCategories()` with `#{id}` fallback.
- **FR-005**: Failed documents with an `error_message` MUST show the "Processing failed" alert.
- **FR-006**: Chunks MUST be listed with index, page number and text inside a `ScrollArea`.

### Key Entities

- **DocumentDetail**, **Chunk** — see [../contracts/documents.md](../contracts/documents.md).

## Success Criteria

- **SC-001**: An admin can confirm what text was extracted from a document in one click from
  the list.
- **SC-002**: A failed ingestion's reason is visible without backend log access.

## Assumptions

- `chunks` is always present (possibly empty) in the detail response.
