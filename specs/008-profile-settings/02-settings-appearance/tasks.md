# Tasks: Settings — Appearance

**Input**: [spec.md](spec.md), [plan.md](plan.md)

**Format**: `[ID] [P?] [Story] Description` — `[X]` = verified present in code; `GAP:` = required by spec/constitution but missing.

## Phase 1: Foundational

- [X] T001 `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange` in app/providers.tsx
- [X] T002 [P] `suppressHydrationWarning` on `<html>` in app/layout.tsx
- [X] T003 [P] "Settings" entry in `staffNavItems` and `customerNavItems` in components/layout/app-sidebar.tsx

## Phase 2: User Story 1 - Light/dark toggle (P1)

- [X] T004 [US1] `ThemeToggle` flipping `resolvedTheme`, `mounted` guard for icon, `aria-label="Toggle theme"` in components/layout/theme-toggle.tsx
- [X] T005 [US1] "Appearance" card rendering `ThemeToggle` in app/(protected)/settings/page.tsx
- [X] T006 [P] [US1] Header instance of `ThemeToggle` in components/layout/site-header.tsx
- [ ] T007 [US1] GAP: Playwright test that clicking "Toggle theme" on `/settings` toggles the `dark` class on `<html>` and persists across reload (scope locator to the Appearance card — two buttons share the name) in tests/e2e/settings.spec.ts

## Gap summary

- T007: no E2E coverage for the only user story (Constitution IV).
