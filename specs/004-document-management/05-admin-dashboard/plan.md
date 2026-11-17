# Implementation Plan: Admin Dashboard

**Branch**: `004-document-management` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

A client page component at `/admin` that derives four stat cards from the cached category and
document lists.

## Files Involved

| File | Role |
|------|------|
| `app/(protected)/admin/page.tsx` | `"use client"` page; stats array, cards, upload link, footer links |
| `hooks/use-categories.ts` | `useCategories()` |
| `hooks/use-documents.ts` | `useDocuments()` (key `["documents","all"]`, conditional polling) |
| `middleware.ts`, `lib/roles.ts` | Admin-only guard; `roleHomePath("admin") === "/admin"` |
| `components/layout/app-sidebar.tsx` | "Dashboard" admin nav item |
| `components/ui/card.tsx`, `button.tsx` | UI |
| `tests/e2e/role-gating.spec.ts` | Admin access + employee/customer redirect tests |

## State & Data Flow

No local state. `processedCount`, `inFlightCount`, `failedCount` computed with
`documents?.filter(...).length ?? 0`; categories count `categories?.length ?? 0`.

## Error / Loading Handling

- Loading: "…" per card. Errors: silently shown as 0 (gap).

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I. BFF | PASS | Via hooks/services only. |
| II. Layered | PASS | Page → hooks. |
| III. Contract-First | PASS (caveat) | Reuses list endpoints already documented. |
| IV. Tests | VIOLATION | US2 (role-gating, heading) covered; US1 card values not asserted (role-gating test mocks empty lists and checks heading only). |
| V. Base UI | PASS | `render` prop for link button. |
| VI. Simplicity | PASS | Client-side counting, no new endpoint. |
