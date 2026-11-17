# Implementation Plan: Document Management (Admin)

**Branch**: `004-document-management` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)
**Input**: Retroactive plan for existing code.

## Summary

Four admin routes (dashboard, list, upload, detail) backed by one hook module
(`hooks/use-documents.ts`) and one service (`services/documents.ts`). Ingestion progress is
tracked by conditional React Query polling (3 s while any visible document is `pending` or
`processing`). Upload uses axios for progress events; all other calls use `apiFetch`.

## Technical Context

**Language/Version**: TypeScript (strict), React 19.1, Next.js 15.5.20 App Router
**Primary Dependencies**: `@tanstack/react-query` v5, `react-hook-form` + `zod` v4,
`react-dropzone` v15, `axios` v1 (upload progress), `date-fns` v4 (`formatDistanceToNow`),
shadcn/ui on `@base-ui/react` (Table, Select, Dialog, AlertDialog, Card, Alert, Badge,
Progress, ScrollArea, Skeleton), `sonner`, `lucide-react`
**Storage**: N/A (React Query cache; global defaults in `app/providers.tsx`: `staleTime: 30_000`, `retry: 1`)
**Testing**: Playwright E2E, mocked backend (`tests/e2e/documents.spec.ts`, `tests/e2e/role-gating.spec.ts`)
**Target Platform**: Modern desktop browsers
**Project Type**: Web frontend (BFF pattern)
**Performance Goals**: Status changes visible within ~3 s of backend change while polling
**Constraints**: JWT never exposed to client JS; multipart body streamed through proxy unbuffered
**Scale/Scope**: 4 routes, 5 document components, 1 hook module (6 hooks), 1 service (6 functions)

## Architecture & Data Flow

```text
app/(protected)/admin/page.tsx ("use client")            → useCategories(), useDocuments()
app/(protected)/admin/documents/page.tsx                 → components/documents/document-table.tsx
app/(protected)/admin/documents/upload/page.tsx          → components/documents/document-upload-form.tsx
app/(protected)/admin/documents/[id]/page.tsx (async, awaits params, Number(id))
                                                         → components/documents/document-detail.tsx
                                                              └─ document-replace-dialog.tsx
                                                              └─ document-status-badge.tsx (also used by table)

hooks/use-documents.ts
  useDocuments(categoryId?)  key ["documents", categoryId ?? "all"]  poll 3 s if any in flight
  useDocument(id)            key ["documents", id]                    poll 3 s if in flight
  useUploadDocument()        + local `progress` state
  useReplaceDocument / useReprocessDocument / useDeleteDocument
  (all mutations: invalidate ["documents"], toast)

services/documents.ts
  listDocuments, getDocument, replaceDocument, reprocessDocument, deleteDocument → apiFetch → /api/backend/documents…
  uploadDocument → axios.post("/api/backend/documents/upload", FormData, { onUploadProgress })

app/api/backend/[...path]/route.ts → ${BACKEND_URL}/api/v1/documents…  (Bearer from httpOnly cookie)
```

Known design defect: the list key `["documents", categoryId]` and the detail key
`["documents", id]` share the same shape. When a category id equals a document id, list
(`DocumentItem[]`) and detail (`DocumentDetail`) data collide in one cache entry; with the 30 s
global `staleTime` the detail view can receive an array (→ `document.chunks.length` throws), or
the list can receive an object (→ `documents.map` throws). Tracked as a gap in
[01-document-list/tasks.md](01-document-list/tasks.md) and
[03-document-detail/tasks.md](03-document-detail/tasks.md).

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I. BFF Security Boundary | PASS | All calls (including axios upload) are same-origin `/api/backend/*`; proxy streams multipart request bodies (`duplex: "half"`). |
| II. Layered Data Access | VIOLATION | (a) `uploadDocument` in `services/documents.ts` uses `axios` directly instead of `services/api-client.ts` (needed for upload progress; also loses backend `detail` in errors). (b) `components/documents/document-replace-dialog.tsx` is a form without react-hook-form + zod. Otherwise page → hook → service layering and invalidation are correct. |
| III. Contract-First | PASS (caveat) | Endpoints documented in [contracts/](contracts/); derived from frontend code/mocks only. Detail, replace, reprocess, delete have **no** mocks — shapes are type-only and UNVERIFIED against backend OpenAPI. |
| IV. Test Every User Story | VIOLATION | Only "upload → processing → processed" (`tests/e2e/documents.spec.ts`) and admin dashboard heading (`tests/e2e/role-gating.spec.ts`) are tested. No tests for filter, detail, reprocess, replace, delete, failed state, upload validation, dashboard counts. |
| V. Pinned Stack & Base UI | VIOLATION (minor) | `render` prop used correctly for link buttons; table filter handles Select `null`. Upload form passes Base UI `onValueChange` straight to `field.onChange` without handling `null`. |
| VI. Simplicity | PASS | `axios` is an extra HTTP client alongside `fetch`; justified below. |
| Security constraint: render document text via `react-markdown` | VIOLATION (letter) | Chunk text in `document-detail.tsx` is rendered as plain React text (escaped, so XSS-safe), not via `react-markdown`. [NEEDS CLARIFICATION: does the constitution intend plain-text rendering to be acceptable?] |

## Project Structure

### Documentation

```text
specs/004-document-management/
├── spec.md
├── plan.md
├── contracts/
│   ├── documents.md
│   └── categories.md
├── 01-document-list/{spec,plan,tasks}.md
├── 02-document-upload/{spec,plan,tasks}.md
├── 03-document-detail/{spec,plan,tasks}.md
├── 04-document-actions/{spec,plan,tasks}.md
└── 05-admin-dashboard/{spec,plan,tasks}.md
```

### Source Code

```text
app/(protected)/admin/page.tsx
app/(protected)/admin/documents/page.tsx
app/(protected)/admin/documents/upload/page.tsx
app/(protected)/admin/documents/[id]/page.tsx
components/documents/document-table.tsx
components/documents/document-upload-form.tsx
components/documents/document-detail.tsx
components/documents/document-replace-dialog.tsx
components/documents/document-status-badge.tsx
hooks/use-documents.ts
hooks/use-categories.ts            (shared, from 003)
services/documents.ts
services/categories.ts             (shared, from 003)
services/api-client.ts             (shared)
types/document.ts
types/category.ts                  (shared)
app/api/backend/[...path]/route.ts (shared BFF proxy)
app/providers.tsx                  (QueryClient defaults)
middleware.ts                      (admin route guard)
components/layout/app-sidebar.tsx  (Dashboard / Documents / Upload nav items)
tests/e2e/documents.spec.ts
tests/e2e/role-gating.spec.ts
tests/e2e/utils.ts
```

**Structure Decision**: Standard repo layering; detail route is an async server component that
passes a numeric id to a client component.

## Complexity Tracking

Recorded retroactively — these were not justified in a plan when built.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `axios.post` in `services/documents.ts` bypassing `apiFetch` | `fetch` exposes no upload-progress events; the upload form shows a % progress bar | Extending `apiFetch` with XHR-based progress was not done; cost: error toasts lose backend `detail` (gap task in 02) |
| Replace dialog without rhf + zod | Single file input, no text fields | Not formally justified; tracked as gap in 04 |
