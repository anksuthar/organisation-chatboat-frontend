---
description: "Tasks for Theming & Fallback Pages (retro-documented)"
---

# Tasks: Theming & Fallback Pages

**Input**: [spec.md](spec.md), [plan.md](plan.md)

**Legend**: `[X]` = implemented in current code (file cited); `[ ]` = gap.

## Phase 1: Setup

- [X] T001 [P] Light and `.dark` colour tokens with `@custom-variant dark` in styles/globals.css
- [X] T002 [P] `suppressHydrationWarning` on `<html>` in app/layout.tsx

## Phase 2: User Story 1 - Light/dark theme (P2)

- [X] T003 [US1] Configure `ThemeProvider` (class attribute, system default, transitions disabled) in app/providers.tsx
- [X] T004 [US1] Theme toggle button with mount guard and Sun/Moon icons in components/layout/theme-toggle.tsx
- [X] T005 [US1] Render `ThemeToggle` in the header in components/layout/site-header.tsx
- [X] T006 [US1] Toaster follows current theme in components/ui/sonner.tsx
- [ ] T007 [US1] GAP: No Playwright test for toggling/persisting the theme in tests/e2e/

## Phase 3: User Story 2 - Not-found page (P3)

- [X] T008 [US2] 404 page with "Back home" link to `/` in app/not-found.tsx
- [ ] T009 [US2] GAP: No Playwright test for the 404 page and its "Back home" redirect in tests/e2e/

## Gap summary

- T007 — theme toggle untested (Constitution IV).
- T009 — 404 page untested (Constitution IV).
