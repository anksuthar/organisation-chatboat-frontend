# Feature Specification: Browse Categories

**Feature Branch**: `003-knowledge-categories`
**Created**: 2026-11-16
**Status**: Implemented (retroactive)
**Parent**: [../spec.md](../spec.md)

## User Scenarios & Testing

### User Story 1 - View all categories (Priority: P1)

An admin opens **Categories** from the sidebar and sees every knowledge-base category with its
name and description, plus per-row Edit/Delete actions.

**Why this priority**: Entry point for all category management; other stories act on rows in
this table.

**Independent Test**: Mock `GET /api/backend/categories` with a fixed array, log in as admin,
visit `/admin/categories`, assert each name/description renders.

**Acceptance Scenarios**:

1. **Given** an admin session and the backend returns categories, **When** the admin visits
   `/admin/categories`, **Then** a heading "Categories", a "New category" button, and a table
   with columns "Name", "Description", "Actions" are shown, one row per category in backend order.
2. **Given** a category whose `description` is `null` or `""`, **When** the table renders,
   **Then** the Description cell shows "—".
3. **Given** a category named `X`, **When** the row renders, **Then** it has icon buttons with
   accessible names "Edit X" and "Delete X".
4. **Given** the request is in flight, **When** the page renders, **Then** three skeleton rows
   are shown in place of data.

---

### User Story 2 - Empty state (Priority: P2)

**Why this priority**: First-run guidance for a fresh install.

**Independent Test**: Mock the list as `[]` and assert the empty message.

**Acceptance Scenarios**:

1. **Given** the backend returns `[]`, **When** loading finishes, **Then** a single row reads
   "No categories yet. Create one to get started."

---

### User Story 3 - Admin-only access (Priority: P1)

**Acceptance Scenarios**:

1. **Given** an `employee` or `customer` session, **When** they navigate to `/admin/categories`,
   **Then** `middleware.ts` redirects them to `/unauthorized`.
2. **Given** no session, **When** visiting `/admin/categories`, **Then** they are redirected to
   `/admin/login`.

### Edge Cases

- **List request fails** (non-2xx / network): `CategoryTable` does not read `isError`; once
  loading ends with no data, the table body is empty (no skeleton, no empty-state text, no error
  message, no toast). [NEEDS CLARIFICATION: intended error UI for a failed list load]
- Long descriptions are rendered as-is (no truncation).
- No pagination, sorting or search.

## Requirements

### Functional Requirements

- **FR-001**: The page MUST fetch categories via `useCategories()` (React Query key
  `["categories"]`) from `GET /api/backend/categories`.
- **FR-002**: While loading, the table MUST show 3 skeleton rows spanning all columns.
- **FR-003**: When loaded and empty, the table MUST show "No categories yet. Create one to get
  started."
- **FR-004**: Each row MUST show `name` (medium weight), `description` or "—", and Edit/Delete
  icon buttons labelled `Edit {name}` / `Delete {name}`.
- **FR-005**: Route MUST be restricted to `admin` by `middleware.ts` (UX only; backend enforces).
- **FR-006**: The list cache MUST be refreshed after any category mutation (invalidation of
  `["categories"]`).

### Key Entities

- **Category** — see [../contracts/categories.md](../contracts/categories.md).

## Success Criteria

- **SC-001**: Admin sees the current category list within one request after page load.
- **SC-002**: Non-admin roles never see the page content.

## Assumptions

- Category volume is small; full list render is acceptable.
