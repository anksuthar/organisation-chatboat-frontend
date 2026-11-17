# Implementation Plan: Document Upload

**Branch**: `004-document-management` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

`DocumentUploadForm` combines a `react-dropzone` drop zone (file kept in local state) with a
react-hook-form/zod form (title, categoryId). Submission calls `useUploadDocument()`, whose
service posts `FormData` via axios to the BFF proxy to get upload-progress callbacks.

## Files Involved

| File | Role |
|------|------|
| `app/(protected)/admin/documents/upload/page.tsx` | Route → `<DocumentUploadForm />` |
| `components/documents/document-upload-form.tsx` | Drop zone, title auto-fill, zod schema, category select, progress, submit + redirect |
| `hooks/use-documents.ts` | `useUploadDocument()` — mutation + local `progress` state, invalidation, toasts |
| `hooks/use-categories.ts` | Category options |
| `services/documents.ts` | `uploadDocument({ file, title, categoryId, onProgress })` → `axios.post("/api/backend/documents/upload", FormData, { onUploadProgress })` |
| `app/api/backend/[...path]/route.ts` | Streams multipart body to FastAPI (`duplex: "half"`) |
| `components/ui/form.tsx`, `input.tsx`, `select.tsx`, `progress.tsx`, `button.tsx` | UI |
| `components/layout/app-sidebar.tsx` | "Upload" admin nav item |

## State & Data Flow

- Local: `file: File | null`; form values `{ title, categoryId }` (categoryId is a string,
  converted with `Number()` on submit).
- `onDrop(accepted)` → `setFile(accepted[0])`, auto-fill title if empty.
- Submit → `upload.mutateAsync(...)` → `onUploadProgress` → `setProgress(%)` →
  success: invalidate `["documents"]`, toast, `setProgress(0)` → `router.push("/admin/documents")`.

## Error / Loading Handling

- Pending: `Progress` bar + "Uploading… n%" disabled button.
- Validation: `FormMessage` per field.
- API error: toast with axios message (backend `detail` lost); page stays.

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I. BFF | PASS | axios posts to same-origin `/api/backend/documents/upload`; cookie sent automatically; no token in JS. |
| II. Layered | VIOLATION | Service uses `axios` directly instead of `services/api-client.ts` (justified for progress events in parent plan's Complexity Tracking). Form correctly uses rhf + zod. |
| III. Contract-First | PASS (caveat) | Multipart fields documented; size/type error codes UNVERIFIED. |
| IV. Tests | VIOLATION | Happy path covered in `tests/e2e/documents.spec.ts`; validation messages, title auto-fill, remove file, failure toast untested. |
| V. Base UI | VIOLATION (minor) | Category `Select onValueChange={field.onChange}` does not handle `null`. |
| VI. Simplicity | PASS | |
