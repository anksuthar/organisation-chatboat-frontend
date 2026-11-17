# Feature Specification: Document List

**Feature Branch**: `004-document-management`
**Created**: 2026-11-16
**Status**: Implemented (retroactive)
**Parent**: [../spec.md](../spec.md)

## User Scenarios & Testing

### User Story 1 - See all documents and their processing status (Priority: P1)

An admin opens **Documents** and sees every uploaded document with its category, page count,
status badge and upload age.

**Why this priority**: Primary view for monitoring the knowledge base.

**Independent Test**: Mock `GET /api/backend/documents*` and `/categories`; visit
`/admin/documents`; assert rows and badges.

**Acceptance Scenarios**:

1. **Given** an admin session, **When** visiting `/admin/documents`, **Then** a "Documents"
   heading, a category filter select, an "Upload" button (link to `/admin/documents/upload`) and
   a table with columns Title, Category, Pages, Status, Uploaded, Actions are shown.
2. **Given** a document, **Then** its row shows `title`, the category name resolved from
   `useCategories()` (or `#{category_id}` if unknown), `total_pages` or "—", a status badge
   (Pending / Processing / Processed / Failed), and relative upload time (e.g. "2 minutes ago").
3. **Given** a document titled `X`, **Then** the Actions cell has icon buttons "View X" (link to
   `/admin/documents/{id}`), "Reprocess X" and "Delete X" (actions specified in
   [04-document-actions](../04-document-actions/spec.md)).
4. **Given** loading, **Then** 3 skeleton rows are shown; **given** an empty result, **Then**
   "No documents yet." is shown.

---

### User Story 2 - Live status updates while processing (Priority: P1)

**Why this priority**: Ingestion is asynchronous; admins need to know when a document is
searchable without refreshing.

**Independent Test**: Covered by `tests/e2e/documents.spec.ts` — mock returns "processing" for
the first two GETs then "processed"; assert "Processing" then "Processed" badges (exact match).

**Acceptance Scenarios**:

1. **Given** at least one listed document is `pending` or `processing`, **When** the list is
   displayed, **Then** it refetches every 3 s.
2. **Given** all listed documents are `processed` or `failed`, **Then** polling stops.

---

### User Story 3 - Filter by category (Priority: P2)

**Independent Test**: Mock two categories and assert `GET documents?category_id=2` after
selecting the second.

**Acceptance Scenarios**:

1. **Given** the filter, **Then** options are "All categories" plus one per category.
2. **When** a category is selected, **Then** `GET /api/backend/documents?category_id={id}` is
   issued and the table shows its result; selecting "All categories" (or a `null` value) issues
   `GET /api/backend/documents` without a query.

### Edge Cases

- **List request fails**: no `isError` handling — the table body is empty, no message/toast.
- **Cache-key collision**: the filtered list key `["documents", categoryId]` equals the detail
  key `["documents", id]` when ids coincide; list and detail data overwrite each other and can
  crash the render (`documents.map is not a function`).
- Polling continues only while the component is mounted; React Query default pauses interval
  refetching while the tab is in the background.
- Filter state is local (not in URL); it resets on navigation.

## Requirements

### Functional Requirements

- **FR-001**: The list MUST use `useDocuments(categoryId?)` with key
  `["documents", categoryId ?? "all"]`.
- **FR-002**: `refetchInterval` MUST be 3000 ms when any document in the current data has
  status `pending` or `processing`, otherwise `false`.
- **FR-003**: The filter MUST default to "all"; a numeric selection MUST be passed as
  `category_id` query param.
- **FR-004**: Category names MUST resolve via `useCategories()`, falling back to `#{id}`.
- **FR-005**: Status MUST render via `DocumentStatusBadge` (distinct colour per status).
- **FR-006**: Upload age MUST render with `date-fns` `formatDistanceToNow(..., { addSuffix: true })`.
- **FR-007**: Route MUST be admin-only via `middleware.ts`.

### Key Entities

- **DocumentItem**, **DocumentStatus** — see [../contracts/documents.md](../contracts/documents.md).

## Success Criteria

- **SC-001**: A status change on the backend is reflected in the list within ~3 s while any
  document is in flight.
- **SC-002**: No polling traffic when all documents are terminal.

## Assumptions

- Backend applies the `category_id` filter server-side.
