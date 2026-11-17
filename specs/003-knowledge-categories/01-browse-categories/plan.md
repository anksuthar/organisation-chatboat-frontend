# Implementation Plan: Browse Categories

**Branch**: `003-knowledge-categories` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

Server page renders the client `CategoryTable`, which reads `useCategories()` and renders a
shadcn/Base UI `Table` with loading, empty and populated states.

## Files Involved

| File | Role |
|------|------|
| `app/(protected)/admin/categories/page.tsx` | Route; server component returning `<CategoryTable />` |
| `components/categories/category-table.tsx` | Heading, "New category" button, table, row actions, hosts form + delete dialogs |
| `hooks/use-categories.ts` | `useCategories()` — `useQuery({ queryKey: ["categories"], queryFn: listCategories })` |
| `services/categories.ts` | `listCategories()` → `apiFetch("categories")` |
| `services/api-client.ts` | `apiFetch` → `fetch("/api/backend/...")`, `ApiError` |
| `types/category.ts` | `Category` |
| `middleware.ts` | `/admin/**` admin-only redirect |
| `components/layout/app-sidebar.tsx` | "Categories" nav item (admin nav) |
| `components/ui/table.tsx`, `components/ui/skeleton.tsx`, `components/ui/button.tsx` | UI primitives |

## State & Data Flow

- Server state: React Query `["categories"]` (default `staleTime`, no polling).
- Local UI state in `CategoryTable`: `formOpen`, `editingCategory`, `deletingCategory`
  (drive sub-features 02 and 03).
- Rendering: `isLoading` → 3 skeleton rows; `!isLoading && length === 0` → empty row;
  otherwise `categories.map(...)`.

## Error / Loading Handling

- Loading: skeleton rows.
- Error: not handled (no `isError` branch, no toast for queries) — gap.

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I. BFF | PASS | `apiFetch` → `/api/backend/categories`. |
| II. Layered | PASS | Component uses hook only. |
| III. Contract-First | PASS (caveat) | GET documented; not reconciled with backend OpenAPI. |
| IV. Tests | VIOLATION | Empty state covered in `tests/e2e/categories.spec.ts`; populated-from-fixture rendering, "—" description, loading skeleton and `/admin/categories` role-gating not tested. |
| V. Base UI | PASS | |
| VI. Simplicity | PASS | |
