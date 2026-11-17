---
description: "Tasks for App Shell & Navigation (retro-documented)"
---

# Tasks: App Shell & Navigation

**Input**: [spec.md](spec.md), [plan.md](plan.md)

**Legend**: `[X]` = implemented in current code (file cited); `[ ]` = gap.

## Phase 1: Setup

- [X] T001 Root layout with Geist fonts, metadata, `lang="en"`, `suppressHydrationWarning` in app/layout.tsx
- [X] T002 Provider tree (ThemeProvider, QueryClientProvider, TooltipProvider, Toaster top-right richColors) in app/providers.tsx
- [X] T003 [P] Mobile breakpoint hook (768 px) in hooks/use-mobile.ts
- [X] T004 [P] Sidebar primitives incl. Ctrl/Cmd+B shortcut and mobile Sheet in components/ui/sidebar.tsx

## Phase 2: Foundational

- [X] T005 Protected layout composing `SidebarProvider`, `AppSidebar`, `SidebarInset`, `SiteHeader`, `<main>` in app/(protected)/layout.tsx

## Phase 3: User Story 1 - Role-aware sidebar navigation (P1)

- [X] T006 [US1] Define `adminNavItems`, `staffNavItems`, `customerNavItems` in components/layout/app-sidebar.tsx
- [X] T007 [US1] Show "Admin" group only for `admin`; choose "Shop"/"General" main group by role in components/layout/app-sidebar.tsx
- [X] T008 [US1] Exact-path active state via `usePathname()` and `render={<Link/>}` composition in components/layout/app-sidebar.tsx
- [ ] T009 [US1] GAP: No Playwright test asserts the nav items shown for admin / employee / customer in tests/e2e/ (e.g. new tests/e2e/navigation.spec.ts)

## Phase 4: User Story 2 - Header with identity and controls (P2)

- [X] T010 [US2] Sidebar trigger, separator, capitalised role badge, theme toggle in components/layout/site-header.tsx
- [X] T011 [US2] Icon-collapsible sidebar with tooltips (`collapsible="icon"`, `tooltip` prop) in components/layout/app-sidebar.tsx
- [ ] T012 [US2] GAP: Persisted `sidebar_state` cookie is never read back (no `defaultOpen` from cookies) in app/(protected)/layout.tsx
- [ ] T013 [US2] GAP: No test for role badge or sidebar collapse in tests/e2e/

## Phase 5: User Story 3 - Logout entry point (P2)

- [X] T014 [US3] Footer button labelled with user email (fallback "Log out"), tooltip "Log out", calls `logout()` in components/layout/app-sidebar.tsx
- [ ] T015 [US3] GAP: No test clicks the footer logout (see also 002-authentication/02-session-and-logout) in tests/e2e/

## Phase 6: User Story 4 - Responsive layout (P3)

- [X] T016 [US4] Switch to off-canvas Sheet below 768 px using `useIsMobile()` in components/ui/sidebar.tsx
- [ ] T017 [US4] GAP: No mobile-viewport test in tests/e2e/

## Phase 7: Polish

- [ ] T018 GAP: While `/api/auth/me` is loading, customers briefly see staff nav items; no loading state/skeleton in components/layout/app-sidebar.tsx

## Gap summary

- T009, T013, T015, T017 — no E2E coverage for any shell/navigation story (Constitution IV).
- T012 — sidebar collapse state not restored after reload.
- T018 — wrong nav group flashes before the user's role resolves.
