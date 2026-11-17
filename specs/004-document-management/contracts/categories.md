# Contract: Categories (read-only use)

This feature only **reads** categories. The full contract is owned by
[`specs/003-knowledge-categories/contracts/categories.md`](../../003-knowledge-categories/contracts/categories.md).

## Endpoint used here

- **Call**: `GET /api/backend/categories` → backend `GET /api/v1/categories`
- **Response 200**: `Category[]` where
  `Category = { id: number; name: string; description: string | null; created_at: string }`
- **Used by**: `useCategories()` in
  - `components/documents/document-table.tsx` (filter options, name lookup)
  - `components/documents/document-upload-form.tsx` (category select)
  - `components/documents/document-detail.tsx` (name lookup)
  - `app/(protected)/admin/page.tsx` (count)
- **Mocked in**: `tests/e2e/documents.spec.ts`, `tests/e2e/role-gating.spec.ts`
- **Errors**: query errors are not surfaced in any of the above views (selects are simply empty;
  names fall back to `#{category_id}`).
