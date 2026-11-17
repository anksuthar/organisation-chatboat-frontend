# Feature Specification: Product Admin

**Feature Branch**: `006-commerce`
**Created**: 2026-11-16
**Status**: Implemented (retroactive)
**Input**: Existing code — `app/(protected)/admin/products/**`, `components/products/*`, `hooks/use-products.ts`, `services/products.ts`

## User Scenarios & Testing

### User Story 1 - Browse and filter the product list (Priority: P1)

An admin opens **Products** and sees all products in a table, optionally filtered by product category.

**Why this priority**: Entry point for every other admin product action.

**Independent Test**: Mock `GET /api/backend/products` and `GET /api/backend/product-categories`, load `/admin/products` as admin.

**Acceptance Scenarios**:

1. **Given** products exist, **Then** the table shows Name, SKU, Category (category name, `#{id}` if the category is unknown, or "Uncategorized"), Price (`$` + price string), Stock, Status badge ("Active"/"Inactive") and actions "View {name}" / "Delete {name}".
2. **Given** the filter "All categories" is changed to a category, **Then** the list is refetched with `?category_id={id}`.
3. **Given** loading, **Then** 3 skeleton rows; **Given** an empty list, **Then** "No products yet."
4. **Given** a non-admin, **When** visiting any `/admin/products*` URL, **Then** they are redirected to `/unauthorized`.

---

### User Story 2 - Create a product with photos (Priority: P1)

The admin clicks **Add product** (or sidebar "Add Product"), drops photos, fills the form, and submits; a progress bar tracks the multipart upload.

**Why this priority**: Without products there is nothing to sell.

**Independent Test**: Mock `POST /api/backend/products/upload`, submit the form at `/admin/products/new`, assert redirect to `/admin/products`.

**Acceptance Scenarios**:

1. **Given** the drop zone, **When** JPG/PNG/WebP files are dropped or chosen, **Then** thumbnails appear, each with a "Remove {filename}" button; other file types are rejected by the drop zone. With no files, "No photos added yet (optional)" is shown.
2. **Given** missing Name, Price, SKU or Stock quantity, **When** "Create product" is clicked, **Then** "Name is required" / "Price is required" / "SKU is required" / "Stock quantity is required" is shown and nothing is sent. Stock defaults to `0`.
3. **Given** valid input, **When** submitted, **Then** a progress bar appears, the button reads "Uploading… {n}%" and is disabled; on success toast "Product created" and navigation to `/admin/products`.
4. **Given** the upload fails, **Then** an error toast is shown, progress resets to 0 and the user stays on the form.

---

### User Story 3 - View and edit a product (Priority: P2)

From the list, the admin opens a product detail page showing Price, Stock, Category, Status, description and photos, and edits it in a dialog.

**Why this priority**: Corrections and stock/price changes after creation.

**Independent Test**: Mock `GET /api/backend/products/{id}` and `PUT /api/backend/products/{id}`.

**Acceptance Scenarios**:

1. **Given** `/admin/products/{id}`, **Then** the heading is the product name with "SKU {sku}" beneath, plus four stat cards and the description when present.
2. **When** Edit is clicked, **Then** a dialog "Edit product" opens prefilled with Name, Price, Stock quantity, Category and Status (Active/Inactive).
3. **When** saved with valid input, **Then** button reads "Saving…", toast "Product updated", dialog closes and data refetches. Required-field messages match US2.

---

### User Story 4 - Manage product photos (Priority: P2)

On the detail page the admin adds more photos or removes existing ones.

**Independent Test**: Mock `POST /api/backend/products/{id}/images` and `DELETE /api/backend/products/{id}/images/{imageId}`.

**Acceptance Scenarios**:

1. **Given** no photos, **Then** "No photos yet." is shown.
2. **When** "Add photos" is clicked and files are chosen (JPEG/PNG/WebP, multiple), **Then** they are uploaded, toast "Images added", and the gallery refetches; the button is disabled while uploading.
3. **When** hovering a thumbnail and clicking "Remove photo", **Then** the image is deleted immediately (no confirm) with toast "Image removed".

---

### User Story 5 - Delete a product (Priority: P3)

The admin deletes a product from the list row or the detail page after confirmation.

**Acceptance Scenarios**:

1. **Given** the list, **When** "Delete {name}" → Delete, **Then** a confirm dialog (`Delete "{name}"?` — "This removes the product and its images. Past orders referencing it are unaffected. This cannot be undone.") precedes the DELETE, then toast "Product deleted".
2. **Given** the detail page, **When** Delete is confirmed, **Then** after success the admin is navigated to `/admin/products`; on failure an error toast is shown and the page stays.

### Edge Cases

- Detail fetch fails or product does not exist: the skeleton is shown indefinitely (no error / not-found state).
- `price` is validated only as non-empty; negative/non-numeric values are prevented only by `<input type="number" min="0">`, not by zod.
- Upload failures show axios' generic message ("Request failed with status code N"), not the backend `detail`.
- Category cannot be cleared once set: neither form offers a "No category" option, and an empty value is omitted from the payload rather than sent as `null`.
- Description cannot be edited after creation: the edit dialog has no description field although `ProductUpdateInput.description` exists.
- Duplicate SKU: handled only by whatever backend error is returned. [NEEDS CLARIFICATION: is SKU immutable? The edit dialog does not expose it and `ProductUpdateInput` has no `sku`.]

## Requirements

### Functional Requirements

- **FR-001**: List MUST call `GET /api/backend/products` with optional `category_id`, and resolve category names via `useProductCategories()`.
- **FR-002**: Create MUST validate with zod — `name` 1–255, `description` ≤2000 optional, `price` non-empty, `sku` 1–64, `stockQuantity` non-empty, `categoryId` optional — and submit `multipart/form-data` to `/api/backend/products/upload` with zero or more `images` parts.
- **FR-003**: Create MUST show upload progress (percent) from axios `onUploadProgress` and reset it on success/failure.
- **FR-004**: Edit MUST send `name`, `price`, `stock_quantity` (number), `is_active` (boolean) and `category_id` when set, via `PUT /api/backend/products/{id}`.
- **FR-005**: Photo add MUST accept `image/jpeg,image/png,image/webp` (multiple); photo remove MUST be a single click.
- **FR-006**: Thumbnails MUST load through `/api/backend/products/{id}/images/{imageId}/file`.
- **FR-007**: Delete MUST require confirmation; all mutations MUST invalidate `["products"]` and toast success/error.
- **FR-008**: All routes are under `/admin` and gated to admins by `middleware.ts` (UX only).

### Key Entities

- **ProductItem / ProductDetail / ProductImage** — see [contracts/products.md](../contracts/products.md).
- **ProductCategory** — used for filter and select options.

## Success Criteria

- **SC-001**: An admin can create a product with several photos from a single form submission.
- **SC-002**: Edits and photo changes appear on the detail page without manual reload.

## Assumptions

- Inactive products remain visible to admins; hiding them from customers is a backend concern.
- Photo display order is backend-defined (`display_order` is not used for sorting in the UI).
