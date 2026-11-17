# Implementation Plan: Document Detail

**Branch**: `004-document-management` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

Async server route resolves the id and renders client `DocumentDetail`, which reads
`useDocument(id)` (polling while in flight) and `useCategories()`, and hosts the action
buttons/dialogs specified in 04.

## Files Involved

| File | Role |
|------|------|
| `app/(protected)/admin/documents/[id]/page.tsx` | Async route; `await params`, `Number(id)` |
| `components/documents/document-detail.tsx` | Header + actions, failed alert, 4 stat cards, upload age, chunk list |
| `components/documents/document-status-badge.tsx` | Status badge |
| `hooks/use-documents.ts` | `useDocument(id)` with conditional 3 s polling |
| `hooks/use-categories.ts` | Category name lookup |
| `services/documents.ts` | `getDocument(id)` → `apiFetch("documents/{id}")` |
| `types/document.ts` | `DocumentDetail`, `Chunk` |
| `components/ui/card.tsx`, `alert.tsx`, `scroll-area.tsx`, `skeleton.tsx` | UI |

## State & Data Flow

- `useDocument(id)` → `refetchInterval: status ∈ {pending, processing} ? 3000 : false`.
- Render guard: `if (isLoading || !document) return <Skeleton/>`.
- Local state `replaceOpen`, `deleteOpen` belong to sub-feature 04.

## Error / Loading Handling

- Loading: skeleton. Error/404: indistinguishable from loading (skeleton forever) — gap.

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I. BFF | PASS | |
| II. Layered | PASS | Hook-only data access. |
| III. Contract-First | PASS (caveat) | `GET documents/{id}` documented from types only; no mock exists, UNVERIFIED. |
| IV. Tests | VIOLATION | No Playwright test visits `/admin/documents/{id}`. |
| V. Base UI | PASS | |
| VI. Simplicity | PASS | |
| Security: document text via `react-markdown` | VIOLATION (letter) | Chunk text rendered as plain React text (XSS-safe). |
