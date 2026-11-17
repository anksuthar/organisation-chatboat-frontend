# Implementation Plan: Knowledge-Base Categories (Admin)

**Branch**: `003-knowledge-categories` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)
**Input**: Retroactive plan for existing code.

## Summary

A single client-rendered admin screen (`/admin/categories`) that lists categories in a table and
offers create/edit (one shared dialog form) and delete (confirmation dialog). Data flows through
React Query hooks → a thin service → the generic BFF proxy.

## Technical Context

**Language/Version**: TypeScript (strict), React 19 via Next.js 15.5 App Router
**Primary Dependencies**: `@tanstack/react-query` v5, `react-hook-form` + `zod` v4 +
`@hookform/resolvers`, shadcn/ui on `@base-ui/react` (Dialog, AlertDialog, Table, Skeleton,
Button, Input, Textarea), `sonner` toasts, `lucide-react` icons
**Storage**: N/A (server state in React Query cache only)
**Testing**: Playwright E2E with mocked `/api/backend/*` and `/api/auth/*`
(`tests/e2e/categories.spec.ts`)
**Target Platform**: Modern desktop browsers
**Project Type**: Web frontend (BFF pattern)
**Performance Goals**: N/A (small admin list, no pagination)
**Constraints**: JWT never exposed to client JS; all calls via `/api/backend/*`
**Scale/Scope**: 1 route, 2 components, 1 hook module, 1 service, 1 type module

## Architecture & Data Flow

```text
app/(protected)/admin/categories/page.tsx   (server component, renders <CategoryTable/>)
  └─ components/categories/category-table.tsx        ("use client")
       ├─ useCategories()           ─┐
       ├─ useDeleteCategory()        │  hooks/use-categories.ts  (React Query, key ["categories"])
       └─ components/categories/category-form-dialog.tsx
            ├─ useCreateCategory()   │
            └─ useUpdateCategory()  ─┘
                   └─ services/categories.ts → apiFetch (services/api-client.ts)
                          └─ fetch("/api/backend/categories[/id]")
                                 └─ app/api/backend/[...path]/route.ts
                                        └─ ${BACKEND_URL}/api/v1/categories[/id]  (+ Bearer from httpOnly cookie)
```

Route protection: `middleware.ts` (redirects non-admins from `/admin/**` to `/unauthorized`;
unauthenticated to `/admin/login`). Layout/sidebar: `app/(protected)/layout.tsx`,
`components/layout/app-sidebar.tsx`.

Mutations: `onSuccess` → `invalidateQueries(["categories"])` + success toast; `onError` →
`toast.error(error.message)`.

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I. BFF Security Boundary | PASS | Only `apiFetch` → same-origin `/api/backend/*`; no token handling in client code. |
| II. Layered Data Access | PASS | page → component → hook → service → api-client; React Query with invalidation on every mutation; form uses react-hook-form + zod. |
| III. Contract-First | PASS (caveat) | Endpoints documented in [contracts/categories.md](contracts/categories.md); derived from frontend code + mocks only, not yet reconciled with backend OpenAPI. `types/category.ts` matches the mocks. |
| IV. Test Every User Story | VIOLATION | One test covers create/edit/delete happy path + empty state. Missing: validation (empty name), error toasts, role-gating of `/admin/categories` specifically, loading state. See sub-spec gap tasks. |
| V. Pinned Stack & Base UI | PASS | Uses `components/ui/*` (Base UI) and hand-written `components/ui/form.tsx`; no `asChild`. |
| VI. Simplicity | PASS | No extra abstractions or dependencies. |

## Project Structure

### Documentation

```text
specs/003-knowledge-categories/
├── spec.md
├── plan.md
├── contracts/categories.md
├── 01-browse-categories/{spec,plan,tasks}.md
├── 02-create-edit-category/{spec,plan,tasks}.md
└── 03-delete-category/{spec,plan,tasks}.md
```

### Source Code

```text
app/(protected)/admin/categories/page.tsx
components/categories/category-table.tsx
components/categories/category-form-dialog.tsx
hooks/use-categories.ts
services/categories.ts
services/api-client.ts            (shared)
types/category.ts
app/api/backend/[...path]/route.ts (shared BFF proxy)
middleware.ts                     (shared route guard)
tests/e2e/categories.spec.ts
tests/e2e/utils.ts                (loginAs, mockMe)
```

**Structure Decision**: Standard repo layering (app → components → hooks → services → types).

## Complexity Tracking

No violations requiring justification (Principle IV gap is a missing-test gap, tracked as tasks,
not a design deviation).
