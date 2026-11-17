# Feature Specification: Document Management (Admin)

**Feature Branch**: `004-document-management`
**Created**: 2026-11-16
**Status**: Implemented (retroactive spec — documents existing code)
**Input**: Reverse-engineered from `app/(protected)/admin/page.tsx`, `app/(protected)/admin/documents/**`,
`components/documents/*`, `hooks/use-documents.ts`, `services/documents.ts`, `types/document.ts`,
`tests/e2e/documents.spec.ts`, `tests/e2e/role-gating.spec.ts`.

## Purpose

Admins curate the PDF corpus that grounds the RAG chat assistant. They upload PDFs into a
category, watch the backend's asynchronous ingestion pipeline move each document through
`pending → processing → processed | failed`, inspect the extracted text chunks, and re-run,
replace or delete documents. An admin dashboard summarises category and document counts.

## Actors / Roles

| Role | Access |
|------|--------|
| `admin` | `/admin` (dashboard), `/admin/documents`, `/admin/documents/upload`, `/admin/documents/{id}` |
| `employee`, `customer` | Redirected to `/unauthorized` by `middleware.ts` for any `/admin/**` path. Backend is the authorisation authority. |
| Unauthenticated | Redirected to `/admin/login`. |

## Sub-specifications

| # | Sub-spec | Summary |
|---|----------|---------|
| 01 | [Document list](01-document-list/spec.md) | Table of documents with category filter, status badges and automatic 3 s polling while any document is in flight. |
| 02 | [Document upload](02-document-upload/spec.md) | Drag-and-drop single-PDF upload (react-dropzone) with title, category, progress bar; redirects to the list. |
| 03 | [Document detail](03-document-detail/spec.md) | Per-document page: status, category, pages, chunk count, failure reason, extracted chunks; polls while in flight. |
| 04 | [Document actions](04-document-actions/spec.md) | Reprocess, replace file, and delete — from list rows and/or the detail page. |
| 05 | [Admin dashboard](05-admin-dashboard/spec.md) | `/admin` stat cards (categories, processed, in progress, failed) and upload shortcut. |

## Cross-cutting Requirements

- **CR-001**: All document traffic MUST go to same-origin `/api/backend/documents*` (BFF proxy).
  JSON calls use `apiFetch`; the upload uses `axios.post` directly (for upload-progress events).
- **CR-002**: React Query keys are rooted at `["documents"]`; every document mutation MUST
  invalidate the whole `["documents"]` prefix (list, filtered lists and detail).
- **CR-003**: Any view showing a document with status `pending` or `processing` MUST poll every
  3000 ms and stop once none are in flight.
- **CR-004**: Status is shown via `DocumentStatusBadge` with labels Pending / Processing /
  Processed / Failed.
- **CR-005**: Category names are resolved client-side from `useCategories()`; unknown ids render
  as `#{category_id}`.
- **CR-006**: Mutation outcomes are surfaced as `sonner` toasts (success text fixed per action;
  error text = `error.message`).

## Key Entities

- **DocumentItem**: `id`, `title`, `filename`, `category_id`, `uploaded_by` (number | null),
  `total_pages` (number | null), `status` (`DocumentStatus`), `error_message` (string | null),
  `created_at`.
- **DocumentDetail**: `DocumentItem` + `chunks: Chunk[]`.
- **Chunk**: `id`, `page_number`, `chunk_index`, `chunk_text`.
- **DocumentStatus**: `"pending" | "processing" | "processed" | "failed"`.
- **Category**: owned by `003-knowledge-categories` (read-only here).

See [contracts/documents.md](contracts/documents.md) and [contracts/categories.md](contracts/categories.md).

## Success Criteria

- **SC-001**: An admin can upload a PDF and see it reach "Processed" in the list without
  manually refreshing.
- **SC-002**: A failed ingestion shows the backend's `error_message` on the detail page and can
  be retried with one click.
- **SC-003**: Every user story has a mocked-backend Playwright test (currently only upload +
  polling is covered — see sub-spec gap summaries).

## Assumptions

- Ingestion is asynchronous on the backend; upload returns immediately with a non-terminal status.
- Only PDFs are supported (dropzone and replace input accept `application/pdf`).
- No pagination/search on the document list.
