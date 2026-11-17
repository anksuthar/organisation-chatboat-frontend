# Feature Specification: Shop Browse & Product Detail

**Feature Branch**: `006-commerce`
**Created**: 2026-11-16
**Status**: Implemented (retroactive)
**Input**: Existing code — `app/(protected)/shop/**`, `components/shop/*`

## User Scenarios & Testing

### User Story 1 - Browse, search and filter products (Priority: P1)

A customer opens **Shop** and sees a grid of product cards; they can type a search term and choose a category.

**Why this priority**: Discovery is the first step of any purchase.

**Independent Test**: Mock `GET /api/backend/products*` and `GET /api/backend/product-categories`, load `/shop` as a customer.

**Acceptance Scenarios**:

1. **Given** products exist, **Then** each card shows a grey placeholder tile (linked to `/shop/{id}`), the product name (linked), `$price`, and an "Add to cart" button.
2. **When** the customer types in "Search products…", **Then** after 300 ms of no typing the list is refetched with `?q={text}`.
3. **When** a category is chosen from the "All categories" select, **Then** the list is refetched with `?category_id={id}` (combinable with `q`).
4. **Given** loading, **Then** 8 skeleton tiles; **Given** no results, **Then** "No products found."

---

### User Story 2 - View product detail (Priority: P1)

The customer opens a product to see its photos, description, price and stock.

**Independent Test**: Mock `GET /api/backend/products/{id}` and load `/shop/{id}`.

**Acceptance Scenarios**:

1. **Given** a product with photos, **Then** images are shown in a 2-column grid loaded via `/api/backend/products/{id}/images/{imageId}/file`; with no photos a grey square is shown.
2. **Then** name, `$price`, description (if any) and "{n} in stock" are shown.
3. **Given** `stock_quantity <= 0`, **Then** an "Out of stock" badge replaces the stock line and the quantity input and button are disabled.

---

### User Story 3 - Add a product to the cart (Priority: P1)

From a card (quantity 1) or from the detail page (chosen quantity), the customer adds the product to their server-side cart.

**Independent Test**: Mock `POST /api/backend/cart/items`; assert payload and toast.

**Acceptance Scenarios**:

1. **Given** an in-stock card, **When** "Add to cart" is clicked, **Then** `POST cart/items` is sent with `{ product_id, quantity: 1 }`, the button is disabled while pending, and toast "Added to cart" appears.
2. **Given** the detail page, **When** the quantity is set and "Add to cart" clicked, **Then** the chosen quantity (minimum 1) is sent.
3. **Given** an out-of-stock product (card or detail), **Then** "Add to cart" is disabled and the card shows an "Out of stock" badge.
4. **Given** the backend rejects the add (e.g. insufficient stock), **Then** an error toast with the backend message appears.

### Edge Cases

- Product cards never show photos — `GET products` returns `ProductItem` without images, so the card uses a placeholder. [NEEDS CLARIFICATION: intended, or should cards show the first image?]
- Detail quantity input clamps to ≥1 (`Math.max(1, …)`; empty → 1) but values above `stock_quantity` can be typed (only the `max` attribute limits the spinner); the backend must reject over-stock adds.
- List fetch error: nothing is rendered below the toolbar (no error, no empty state). Detail fetch error / unknown id: indefinite skeleton.
- Inactive products: the frontend does not filter `is_active`; visibility depends on the backend (UNVERIFIED).
- Route access: `/shop` is linked only in the customer sidebar, but any authenticated role can open it by URL.

## Requirements

### Functional Requirements

- **FR-001**: The grid MUST load products via `useProducts({ categoryId, q })` and categories via `useProductCategories()`.
- **FR-002**: Search MUST be debounced 300 ms; the pending timer MUST be cleared on unmount.
- **FR-003**: The category select MUST map Base UI `null` to "all".
- **FR-004**: Out-of-stock (`stock_quantity <= 0`) MUST disable add-to-cart on both card and detail.
- **FR-005**: Add-to-cart MUST call `POST /api/backend/cart/items`, invalidate `["cart"]`, and toast "Added to cart" or the error message.
- **FR-006**: Product images MUST be loaded through the BFF proxy URL from `productImageUrl()`.

### Key Entities

- **ProductItem / ProductDetail** — [contracts/products.md](../contracts/products.md)
- **CartItemCreateInput** `{ product_id, quantity }` — [contracts/cart.md](../contracts/cart.md)

## Success Criteria

- **SC-001**: A customer can find a product by name and add it to the cart in under three interactions from `/shop`.
- **SC-002**: The search box issues at most one list request per 300 ms pause in typing.

## Assumptions

- Search semantics (name/description/SKU, case sensitivity) are defined by the backend's `q` parameter.
