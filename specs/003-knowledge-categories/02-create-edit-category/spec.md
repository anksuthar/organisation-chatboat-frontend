# Feature Specification: Create & Edit Category

**Feature Branch**: `003-knowledge-categories`
**Created**: 2026-11-16
**Status**: Implemented (retroactive)
**Parent**: [../spec.md](../spec.md)

## User Scenarios & Testing

### User Story 1 - Create a category (Priority: P1)

The admin clicks **New category**, enters a name and optional description, and saves. The new
category appears in the table.

**Why this priority**: Documents cannot be uploaded without at least one category.

**Independent Test**: Mock `GET`/`POST /api/backend/categories`; open the dialog, fill "Name",
click "Save", assert a cell with the exact name appears.

**Acceptance Scenarios**:

1. **Given** the categories page, **When** the admin clicks "New category", **Then** a dialog
   titled "New category" opens with empty "Name" (placeholder "e.g. Leave Policy") and
   "Description" (placeholder "Optional description") fields, and "Cancel" / "Save" buttons.
2. **Given** the dialog with Name "Leave Policy", **When** "Save" is clicked, **Then**
   `POST /api/backend/categories` is sent with `{ "name": "Leave Policy", "description": "" }`,
   a "Category created" toast is shown, the dialog closes and the list refetches showing
   "Leave Policy".
3. **Given** the request is in flight, **Then** the submit button reads "Saving…" and is disabled.

---

### User Story 2 - Edit a category (Priority: P1)

**Independent Test**: Seed one category, click "Edit {name}", change Name, Save, assert the
updated cell.

**Acceptance Scenarios**:

1. **Given** a row for category `X`, **When** the admin clicks "Edit X", **Then** the same
   dialog opens titled "Edit category", pre-filled with `X`'s name and description (`null`
   description becomes `""`).
2. **Given** edited values, **When** "Save" is clicked, **Then**
   `PUT /api/backend/categories/{id}` is sent with `{ name, description }`, a "Category updated"
   toast is shown, the dialog closes, and the list refetches.

---

### User Story 3 - Validation and failure feedback (Priority: P2)

**Acceptance Scenarios**:

1. **Given** an empty Name, **When** "Save" is clicked, **Then** no request is sent and
   "Name is required" is shown under the field.
2. **Given** Name > 255 chars or Description > 2000 chars, **When** "Save" is clicked, **Then**
   zod's default max-length message is shown and no request is sent.
3. **Given** the backend responds non-2xx, **When** saving, **Then** an error toast shows the
   backend `detail` (or HTTP status text) and the dialog stays open with values intact.
4. **Given** the dialog is open, **When** "Cancel" is clicked or the dialog is dismissed,
   **Then** it closes without a request; reopening resets the form to the target category (or
   blank for create).

### Edge Cases

- Whitespace-only names pass client validation (no `.trim()`); backend behaviour
  **UNVERIFIED**.
- Clearing the description on edit sends `""` (not `null`); whether the backend normalises it is
  **UNVERIFIED**.
- Duplicate names: no client check; relies on backend error → toast.
- On error, `mutateAsync` rejects inside `form.handleSubmit`, so the rejection propagates
  (unhandled promise rejection in console) after the toast is shown.

## Requirements

### Functional Requirements

- **FR-001**: One dialog component MUST serve both create (no `category` prop) and edit
  (`category` provided); title switches between "New category" and "Edit category".
- **FR-002**: The form MUST use react-hook-form + zod schema
  `{ name: string().min(1, "Name is required").max(255), description: string().max(2000).optional() }`.
- **FR-003**: Each time the dialog opens, the form MUST reset to the target category's values
  (or blanks).
- **FR-004**: Create MUST call `POST categories`; edit MUST call `PUT categories/{id}`; both via
  `services/categories.ts`.
- **FR-005**: On success the hook MUST invalidate `["categories"]` and toast
  "Category created" / "Category updated"; the dialog MUST then close.
- **FR-006**: On failure the hook MUST toast `error.message`; the dialog MUST remain open.
- **FR-007**: The Save button MUST be disabled and read "Saving…" while either mutation is pending.

### Key Entities

- **CategoryCreateInput** `{ name, description? }`, **CategoryUpdateInput** `{ name?, description? }`
  — see [../contracts/categories.md](../contracts/categories.md).

## Success Criteria

- **SC-001**: An admin can create or rename a category in ≤ 3 interactions after opening the page.
- **SC-002**: Invalid input never reaches the backend.

## Assumptions

- No optimistic updates; the table updates after refetch.
