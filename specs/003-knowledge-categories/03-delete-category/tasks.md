---
description: "Tasks for Delete Category (retroactive — [X] = verified in code)"
---

# Tasks: Delete Category

**Input**: [spec.md](spec.md), [plan.md](plan.md), [../contracts/categories.md](../contracts/categories.md)

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [X] T001 [P] Implement `deleteCategory(id)` → `DELETE categories/{id}` in services/categories.ts
- [X] T002 [P] 204 → `undefined` handling in services/api-client.ts
- [X] T003 Implement `useDeleteCategory` with `["categories"]` invalidation and toasts in hooks/use-categories.ts

## Phase 2: User Story 1 - Delete with confirmation (P2)

- [X] T004 [US1] `Delete {name}` row button setting `deletingCategory` in components/categories/category-table.tsx
- [X] T005 [US1] `AlertDialog` with `Delete "{name}"?` title, warning text, Cancel/Delete in components/categories/category-table.tsx
- [X] T006 [US1] E2E delete happy path (confirm → empty state) in tests/e2e/categories.spec.ts
- [ ] T007 [P] [US1] GAP: Playwright test for Cancel (no DELETE sent, row remains) and for a mocked error response (toast, row remains) in tests/e2e/categories.spec.ts
- [ ] T008 [US1] GAP: Resolve warning text vs. behaviour — the dialog tells admins documents must be "reassigned", but no document re-categorisation UI or endpoint exists in the frontend (components/categories/category-table.tsx; needs backend contract confirmation)

## Gap summary

- T007 — cancel/error paths untested.
- T008 — delete warning references a reassignment flow that does not exist; backend behaviour for non-empty categories unverified.
