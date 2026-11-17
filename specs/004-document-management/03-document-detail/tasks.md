---
description: "Tasks for Document Detail (retroactive — [X] = verified in code)"
---

# Tasks: Document Detail

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/documents.md](../contracts/documents.md)

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [X] T001 [P] Define `DocumentDetail` and `Chunk` in types/document.ts
- [X] T002 [P] Implement `getDocument(id)` in services/documents.ts
- [X] T003 Implement `useDocument(id)` with key `["documents", id]` in hooks/use-documents.ts

## Phase 2: User Story 1 - Inspect document and chunks (P1)

- [X] T004 [US1] Async route awaiting `params` and passing `Number(id)` in app/(protected)/admin/documents/[id]/page.tsx
- [X] T005 [US1] Header (title, filename) and Status / Category / Pages / Chunks embedded cards in components/documents/document-detail.tsx
- [X] T006 [US1] "Uploaded {relative time}" line in components/documents/document-detail.tsx
- [X] T007 [US1] "Extracted chunks" ScrollArea list with "Chunk #n · Page p" and empty-state messages in components/documents/document-detail.tsx
- [X] T008 [US1] Loading skeleton in components/documents/document-detail.tsx
- [ ] T009 [US1] GAP: Distinguish error/404 from loading (use `isError`, show "Document not found" / error message instead of an endless skeleton) in components/documents/document-detail.tsx
- [ ] T010 [US1] GAP: Guard against non-numeric route ids (`NaN`) — e.g. `notFound()` in app/(protected)/admin/documents/[id]/page.tsx
- [ ] T011 [P] [US1] GAP: Playwright test for detail page with a mocked `GET documents/{id}` (cards, chunk list, empty-chunk messages) in tests/e2e/documents.spec.ts
- [ ] T012 [US1] GAP: Decide whether chunk text must go through `react-markdown` (constitution Security constraint) or amend the constitution to allow escaped plain text in components/documents/document-detail.tsx

## Phase 3: User Story 2 - Failure reason (P1)

- [X] T013 [US2] Destructive "Processing failed" alert with `error_message` in components/documents/document-detail.tsx
- [ ] T014 [P] [US2] GAP: Playwright test for a `failed` document showing the alert text in tests/e2e/documents.spec.ts

## Phase 4: User Story 3 - Live status (P2)

- [X] T015 [US3] Conditional 3000 ms polling on `pending`/`processing` in hooks/use-documents.ts
- [ ] T016 [US3] GAP: Separate detail query key from list key (`["documents","detail",id]`) to prevent cache collision with `["documents", categoryId]` in hooks/use-documents.ts
- [ ] T017 [P] [US3] GAP: Playwright test for detail polling processing → processed (chunks appear) in tests/e2e/documents.spec.ts

## Gap summary

- T009 — errors/404 show an endless skeleton.
- T010 — non-numeric id not guarded.
- T011 — detail page has no E2E test.
- T012 — chunk rendering vs. constitution's react-markdown rule.
- T014 — failed-state alert untested.
- T016 — query-key collision with filtered list (real bug; same root cause as 01/T015).
- T017 — detail polling untested.
