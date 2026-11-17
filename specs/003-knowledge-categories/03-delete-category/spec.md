# Feature Specification: Delete Category

**Feature Branch**: `003-knowledge-categories`
**Created**: 2026-11-16
**Status**: Implemented (retroactive)
**Parent**: [../spec.md](../spec.md)

## User Scenarios & Testing

### User Story 1 - Delete a category with confirmation (Priority: P2)

The admin clicks the trash icon on a row, confirms in an alert dialog, and the category is
removed from the table.

**Why this priority**: Housekeeping; less frequent than create/edit.

**Independent Test**: Seed one category in the mock, click "Delete {name}", click "Delete"
(exact), assert the empty state reappears.

**Acceptance Scenarios**:

1. **Given** a row for category `X`, **When** the admin clicks "Delete X", **Then** an alert
   dialog opens titled `Delete "X"?` with the description "This cannot be undone. Documents in
   this category will need to be reassigned or removed separately." and buttons "Cancel" /
   "Delete".
2. **Given** the dialog, **When** "Delete" is clicked, **Then** the dialog closes immediately,
   `DELETE /api/backend/categories/{id}` is sent, and on 2xx a "Category deleted" toast appears
   and the list refetches without `X`.
3. **Given** the dialog, **When** "Cancel" is clicked or it is dismissed, **Then** no request is
   sent.
4. **Given** the backend rejects the delete, **Then** an error toast shows the backend `detail`
   (or status text) and the row remains.

### Edge Cases

- The dialog closes before the request resolves (fire-and-forget `mutate`), so there is no
  in-dialog pending state; rapid repeated deletes of different rows are possible.
- Documents still assigned to the category: the frontend only warns; actual behaviour
  (cascade, block with error, orphan) is backend-defined and **UNVERIFIED**. There is no UI
  anywhere in the frontend to reassign a document's category, so "reassigned" in the warning
  text has no supporting flow. [NEEDS CLARIFICATION: intended behaviour/wording when documents
  exist in the category]
- After a delete, `["documents"]` queries are **not** invalidated; document views may show the
  fallback `#{category_id}` label once the category list refetches.

## Requirements

### Functional Requirements

- **FR-001**: Each row MUST expose a delete button labelled `Delete {name}`.
- **FR-002**: Deletion MUST require confirmation via `AlertDialog`.
- **FR-003**: Confirm MUST call `useDeleteCategory().mutate(id)` → `DELETE categories/{id}`.
- **FR-004**: On success the hook MUST invalidate `["categories"]` and toast "Category deleted".
- **FR-005**: On failure the hook MUST toast `error.message`.

### Key Entities

- **Category** — see [../contracts/categories.md](../contracts/categories.md).

## Success Criteria

- **SC-001**: No category is deleted without an explicit confirmation click.

## Assumptions

- Delete returns 204 with empty body (per E2E mock).
