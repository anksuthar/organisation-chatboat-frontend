# Feature Specification: Knowledge-Base Categories (Admin)

**Feature Branch**: `003-knowledge-categories`
**Created**: 2026-11-16
**Status**: Implemented (retroactive spec — documents existing code)
**Input**: Reverse-engineered from `app/(protected)/admin/categories/page.tsx`, `components/categories/*`, `hooks/use-categories.ts`, `services/categories.ts`, `types/category.ts`, `tests/e2e/categories.spec.ts`.

## Purpose

Admins organise knowledge-base PDF documents into **categories** (e.g. "Leave Policy",
"HR Policy"). Every uploaded document must belong to exactly one category (see
`004-document-management`), and the document list can be filtered by category. This feature
covers the admin screen at `/admin/categories` for listing, creating, editing and deleting those
categories.

Out of scope: **product categories** (`/admin/product-categories`, `services/product-categories.ts`)
belong to the commerce feature, not here.

## Actors / Roles

| Role | Access |
|------|--------|
| `admin` | Full access to `/admin/categories` (list, create, edit, delete). |
| `employee`, `customer` | No access — `middleware.ts` redirects any `/admin/**` path to `/unauthorized`. FastAPI is the authorisation authority for the underlying endpoints. |
| Unauthenticated | Redirected to `/admin/login` by `middleware.ts`. |

## Sub-specifications

| # | Sub-spec | Summary |
|---|----------|---------|
| 01 | [Browse categories](01-browse-categories/spec.md) | Table of all categories with loading skeleton and empty state. |
| 02 | [Create & edit category](02-create-edit-category/spec.md) | Shared dialog form (name + optional description) validated with zod; success/error toasts. |
| 03 | [Delete category](03-delete-category/spec.md) | Confirmation dialog, then delete and refresh the list. |

## Cross-cutting Requirements

- **CR-001**: All category API calls MUST go through `services/categories.ts` → `apiFetch`
  (`services/api-client.ts`) → `/api/backend/categories*` (BFF proxy). No direct FastAPI calls.
- **CR-002**: Server state MUST be held in React Query under the single key `["categories"]`;
  every successful mutation MUST invalidate that key.
- **CR-003**: Every mutation outcome MUST be surfaced with a `sonner` toast — success text is
  fixed ("Category created" / "Category updated" / "Category deleted"); error text is the
  backend `detail` string, or the HTTP status text if the body has no `detail`.
- **CR-004**: The categories list is shared with `004-document-management` (document table
  filter, upload form category select, detail/list category-name lookup, admin dashboard count)
  via the same `useCategories()` hook and cache key.
- **CR-005**: The page is reachable from the admin sidebar entry "Categories"
  (`components/layout/app-sidebar.tsx`) and from the admin dashboard link.

## Key Entities

- **Category**: `id` (number), `name` (string, 1–255 chars), `description` (string | null,
  ≤ 2000 chars on input), `created_at` (ISO timestamp string). See
  [contracts/categories.md](contracts/categories.md).

## Success Criteria

- **SC-001**: An admin can create, rename and delete a category from a single screen without a
  page reload; the table reflects each change after the mutation resolves.
- **SC-002**: Non-admins can never render `/admin/categories` (redirected before render).
- **SC-003**: Every category user story is covered by a Playwright test with a mocked backend
  (currently partially met — see sub-spec task gap summaries).

## Assumptions

- Category deletion semantics for documents still attached to the category are decided by the
  backend; the frontend only warns ("Documents in this category will need to be reassigned or
  removed separately").
- No pagination, search or sorting — the list is assumed small enough to render in full, in the
  order the backend returns it.
