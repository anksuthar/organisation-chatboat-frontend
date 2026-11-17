---
description: "Tasks for Document List (retroactive — [X] = verified in code)"
---

# Tasks: Document List

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/documents.md](../contracts/documents.md)

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [X] T001 [P] Define `DocumentItem` and `DocumentStatus` in types/document.ts
- [X] T002 [P] Implement `listDocuments(categoryId?)` with optional `?category_id=` in services/documents.ts
- [X] T003 Implement `useDocuments(categoryId?)` with key `["documents", categoryId ?? "all"]` in hooks/use-documents.ts
- [X] T004 [P] Implement `DocumentStatusBadge` (labels + colours for 4 statuses) in components/documents/document-status-badge.tsx
- [X] T005 [P] "Documents" admin sidebar link in components/layout/app-sidebar.tsx

## Phase 2: User Story 1 - See all documents (P1)

- [X] T006 [US1] Route rendering `<DocumentTable />` in app/(protected)/admin/documents/page.tsx
- [X] T007 [US1] Table columns Title / Category / Pages / Status / Uploaded / Actions with `#{id}` and "—" fallbacks in components/documents/document-table.tsx
- [X] T008 [US1] Relative upload time via `formatDistanceToNow` in components/documents/document-table.tsx
- [X] T009 [US1] "View {title}" link button to `/admin/documents/{id}` and "Upload" link button in components/documents/document-table.tsx
- [X] T010 [US1] Loading skeleton and "No documents yet." empty state in components/documents/document-table.tsx
- [ ] T011 [US1] GAP: Handle `isError` from `useDocuments()` with a visible error state in components/documents/document-table.tsx
- [ ] T012 [P] [US1] GAP: Playwright assertions for row content (category name lookup, pages "—", View link href) in tests/e2e/documents.spec.ts

## Phase 3: User Story 2 - Live status updates (P1)

- [X] T013 [US2] Conditional 3000 ms `refetchInterval` via `hasInFlightDocument` in hooks/use-documents.ts
- [X] T014 [US2] E2E: processing → processed transition in tests/e2e/documents.spec.ts
- [ ] T015 [US2] GAP: Make list query key distinct from detail key (e.g. `["documents", "list", categoryId ?? "all"]` vs `["documents", "detail", id]`) to stop cache collisions when a category id equals a document id in hooks/use-documents.ts

## Phase 4: User Story 3 - Filter by category (P2)

- [X] T016 [US3] Category filter `Select` ("All categories" + categories, `null` → "all") in components/documents/document-table.tsx
- [ ] T017 [P] [US3] GAP: Playwright test that selecting a category requests `documents?category_id={id}` and renders the filtered result in tests/e2e/documents.spec.ts

## Gap summary

- T011 — list load errors are silent.
- T012 — row rendering not asserted in E2E.
- T015 — list/detail React Query key collision (real bug; can crash list or detail).
- T017 — category filter untested.
