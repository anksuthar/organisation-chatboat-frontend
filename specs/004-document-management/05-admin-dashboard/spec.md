# Feature Specification: Admin Dashboard

**Feature Branch**: `004-document-management`
**Created**: 2026-11-16
**Status**: Implemented (retroactive)
**Parent**: [../spec.md](../spec.md)

## User Scenarios & Testing

### User Story 1 - At-a-glance knowledge-base health (Priority: P2)

After login an admin lands on `/admin` (via `middleware.ts` / `lib/roles.ts` `roleHomePath`) and
sees counts of categories and documents by processing state, plus a shortcut to upload.

**Why this priority**: Convenience overview; all data is also available on the list pages.

**Independent Test**: Mock `GET categories` (n items) and `GET documents` (mixed statuses);
visit `/admin`; assert each card value.

**Acceptance Scenarios**:

1. **Given** an admin session, **When** visiting `/admin`, **Then** heading "Admin dashboard"
   and a button "Upload document" (link to `/admin/documents/upload`) are shown.
2. **Then** four cards are shown:
   - **Categories** = number of categories
   - **Processed documents** = documents with status `processed`
   - **In progress** = documents with status `pending` or `processing`
   - **Failed** = documents with status `failed`
3. **Given** either query is loading, **Then** its dependent card values show "…".
4. **Then** a footer line links "categories" → `/admin/categories` and "documents" →
   `/admin/documents`.
5. **Given** any document is in flight, **Then** counts update automatically (shares
   `useDocuments()` 3 s polling and its `["documents","all"]` cache with the list page).

---

### User Story 2 - Admin-only (Priority: P1)

**Acceptance Scenarios**:

1. **Given** an `employee` or `customer` session, **When** visiting `/admin`, **Then** they are
   redirected to `/unauthorized` ("Access denied" heading). *(Tested in
   `tests/e2e/role-gating.spec.ts`.)*
2. **Given** an admin session, **Then** `/admin` renders the "Admin dashboard" heading.
   *(Tested in `tests/e2e/role-gating.spec.ts`.)*

### Edge Cases

- **Query errors**: counts fall back to `0` (`?? 0`) with no error indication — a backend outage
  looks like an empty knowledge base.
- Counts are computed client-side from the full document list (no backend stats endpoint).
- The dashboard does not include commerce entities (products, product categories, orders).

## Requirements

### Functional Requirements

- **FR-001**: Page MUST use `useCategories()` and `useDocuments()` (no category filter).
- **FR-002**: Counts MUST be derived client-side by filtering `status`.
- **FR-003**: Loading values MUST render as "…".
- **FR-004**: "Upload document" MUST use `<Button render={<Link …/>}>` (Base UI `render` prop).
- **FR-005**: Route MUST be admin-only via `middleware.ts`.

### Key Entities

- **Category**, **DocumentItem** — see [../contracts/](../contracts/).

## Success Criteria

- **SC-001**: Admin sees accurate category/document counts on landing without visiting other pages.

## Assumptions

- Document volume is small enough to fetch the full list for counting.
