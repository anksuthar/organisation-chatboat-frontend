---
description: "Tasks for Document Upload (retroactive — [X] = verified in code)"
---

# Tasks: Document Upload

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/documents.md](../contracts/documents.md)

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [X] T001 [P] Implement `uploadDocument` building `FormData` (`title`, `category_id`, `file`) with `onUploadProgress` in services/documents.ts
- [X] T002 Implement `useUploadDocument()` with `progress` state, `["documents"]` invalidation, success/error toasts in hooks/use-documents.ts
- [X] T003 [P] Proxy streams multipart request bodies (`duplex: "half"`) in app/api/backend/[...path]/route.ts
- [X] T004 [P] "Upload" admin sidebar link in components/layout/app-sidebar.tsx

## Phase 2: User Story 1 - Upload a PDF (P1)

- [X] T005 [US1] Route rendering `<DocumentUploadForm />` in app/(protected)/admin/documents/upload/page.tsx
- [X] T006 [US1] react-dropzone zone (PDF only, `maxFiles: 1`), selected-file card with size and "Remove" in components/documents/document-upload-form.tsx
- [X] T007 [US1] Title auto-fill from file name when empty in components/documents/document-upload-form.tsx
- [X] T008 [US1] Category `Select` populated from `useCategories()` in components/documents/document-upload-form.tsx
- [X] T009 [US1] `Progress` bar and "Uploading… n%" label while pending in components/documents/document-upload-form.tsx
- [X] T010 [US1] Redirect to `/admin/documents` after success in components/documents/document-upload-form.tsx
- [X] T011 [US1] E2E upload happy path in tests/e2e/documents.spec.ts

## Phase 3: User Story 2 - Validation (P2)

- [X] T012 [US2] zod schema (Title required ≤ 255, Category required) in components/documents/document-upload-form.tsx
- [X] T013 [US2] Upload button disabled while no file selected in components/documents/document-upload-form.tsx
- [ ] T014 [US2] GAP: Show feedback for rejected drops (non-PDF / multiple files) using react-dropzone `fileRejections` in components/documents/document-upload-form.tsx
- [ ] T015 [US2] GAP: Enforce the advertised 20MB limit client-side (`maxSize`) or remove the claim; confirm backend limit in contracts in components/documents/document-upload-form.tsx
- [ ] T016 [US2] GAP: Handle Base UI `null` from category `onValueChange` (map to `""`) so the "Category is required" message is shown in components/documents/document-upload-form.tsx
- [ ] T017 [US2] GAP: Remove or make reachable the dead "Select a PDF file first" branch (button is disabled when no file) in components/documents/document-upload-form.tsx
- [ ] T018 [P] [US2] GAP: Playwright test for "Title is required" / "Category is required" and title auto-fill in tests/e2e/documents.spec.ts

## Phase 4: User Story 3 - Upload failure (P2)

- [X] T019 [US3] Error toast and progress reset on failure in hooks/use-documents.ts
- [ ] T020 [US3] GAP: Surface backend `detail` from `AxiosError.response.data` (or route upload through an api-client helper) instead of axios's generic message in services/documents.ts
- [ ] T021 [US3] GAP: Catch `mutateAsync` rejection in `onSubmit` to avoid unhandled promise rejection in components/documents/document-upload-form.tsx
- [ ] T022 [P] [US3] GAP: Playwright test for mocked upload error (toast shown, stays on upload page) in tests/e2e/documents.spec.ts

## Gap summary

- T014 — rejected files give no feedback.
- T015 — "up to 20MB" not enforced/verified.
- T016 — Select `null` not handled (Constitution V).
- T017 — dead "Select a PDF file first" code path.
- T018 — validation untested.
- T020 — upload errors lose backend `detail`.
- T021 — unhandled rejection on failed upload.
- T022 — failure path untested.
