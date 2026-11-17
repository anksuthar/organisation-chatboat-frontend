# Feature Specification: Product Category Admin

**Feature Branch**: `006-commerce`
**Created**: 2026-11-16
**Status**: Implemented (retroactive)
**Input**: Existing code — `app/(protected)/admin/product-categories/page.tsx`, `components/product-categories/*`, `hooks/use-product-categories.ts`

## User Scenarios & Testing

### User Story 1 - View product categories (Priority: P1)

An admin opens **Product Categories** from the sidebar and sees every category with its name and description.

**Why this priority**: Categories drive the product forms and the shop filter; listing is the base of all other stories.

**Independent Test**: Mock `GET /api/backend/product-categories` and load `/admin/product-categories` as admin.

**Acceptance Scenarios**:

1. **Given** an admin and categories exist, **When** the page loads, **Then** a table shows heading "Product Categories" and one row per category with Name, Description (or "—" when empty) and Edit/Delete icon buttons labelled "Edit {name}" / "Delete {name}".
2. **Given** the list is loading, **Then** three skeleton rows are shown.
3. **Given** no categories exist, **Then** the row "No product categories yet. Create one to get started." is shown.
4. **Given** a non-admin (employee/customer), **When** they open `/admin/product-categories`, **Then** middleware redirects them to `/unauthorized`.

---

### User Story 2 - Create and edit a category (Priority: P1)

The admin clicks **New category** (or the pencil icon on a row), fills a dialog with Name and optional Description, and saves.

**Why this priority**: Without categories, products cannot be categorised.

**Independent Test**: Mock `POST`/`PUT` and assert the dialog, validation, toast and refetch.

**Acceptance Scenarios**:

1. **Given** the dialog is open in create mode, **Then** the title is "New category" and fields are empty.
2. **Given** edit mode for a category, **Then** the title is "Edit category" and fields are prefilled from the row (null description → empty).
3. **Given** Name is empty, **When** Save is clicked, **Then** "Name is required" is shown and no request is sent.
4. **Given** valid input, **When** Save is clicked, **Then** the Save button shows "Saving…" and is disabled, the request is sent, the toast "Category created" / "Category updated" appears, the dialog closes and the list refetches.
5. **Given** the backend rejects the request, **Then** an error toast with the backend `detail` is shown and the dialog stays open.

---

### User Story 3 - Delete a category (Priority: P2)

The admin clicks the trash icon, confirms in an alert dialog, and the category is removed.

**Why this priority**: Clean-up is less frequent than creation.

**Independent Test**: Mock `DELETE /api/backend/product-categories/{id}` and verify the confirm flow.

**Acceptance Scenarios**:

1. **Given** a row, **When** the trash icon is clicked, **Then** an alert dialog titled `Delete "{name}"?` explains "This cannot be undone. Products in this category become uncategorized rather than being deleted."
2. **When** Cancel is clicked, **Then** nothing is sent.
3. **When** Delete is clicked, **Then** the dialog closes immediately, the DELETE is sent, the toast "Category deleted" appears and the list refetches; on failure an error toast appears.

### Edge Cases

- List request fails: no rows and no empty-state message are rendered; no error is shown to the user.
- Name over 255 chars or description over 2000 chars: zod rejects with its default max-length message.
- Clearing an existing description sends `description: ""` (not `null`); how the backend stores it is UNVERIFIED.
- Duplicate category names: whatever the backend returns is shown as an error toast (frontend has no uniqueness check).

## Requirements

### Functional Requirements

- **FR-001**: The page MUST list categories from `GET /api/backend/product-categories` with loading skeletons and an empty-state message.
- **FR-002**: Create and edit MUST share one dialog (`ProductCategoryFormDialog`) validated by zod: `name` 1–255 chars (required), `description` ≤ 2000 chars (optional).
- **FR-003**: The dialog MUST reset its fields from the selected category each time it opens.
- **FR-004**: Delete MUST require confirmation in an `AlertDialog`.
- **FR-005**: Each successful mutation MUST invalidate `["product-categories"]` and show a success toast; failures MUST show the error message as a toast.
- **FR-006**: The route MUST be reachable only by admins at the routing layer (`middleware.ts` `/admin` prefix check); the backend remains the authority.

### Key Entities

- **ProductCategory**: `id`, `name`, `description | null`, `created_at` (see [contracts/product-categories.md](../contracts/product-categories.md)).

## Success Criteria

- **SC-001**: An admin can create a category and see it in the table within one refetch cycle, without reloading the page.
- **SC-002**: Invalid input never reaches the backend (client-side zod validation).

## Assumptions

- The admin sidebar entry "Product Categories" (`components/layout/app-sidebar.tsx`) is the entry point.
- Product categories are a separate resource from knowledge-base document categories (`/admin/categories`).
