# Implementation Plan: App Shell & Navigation

**Branch**: `001-platform-foundation` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

Server root layout → client `Providers` → `(protected)` route-group layout using the shadcn (Base UI) sidebar primitives. `AppSidebar` and `SiteHeader` are client components that read the current user via `useAuth()` (React Query key `["auth","me"]`, `staleTime: Infinity`).

## Files Involved

| File | Role |
|---|---|
| `app/layout.tsx` | `<html lang="en" suppressHydrationWarning>`, Geist fonts, metadata, `<Providers>` |
| `app/providers.tsx` | `ThemeProvider` → `QueryClientProvider` → `TooltipProvider` → children + `<Toaster richColors position="top-right" />` |
| `app/(protected)/layout.tsx` | `SidebarProvider` → `AppSidebar` + `SidebarInset` (`SiteHeader`, `<main className="flex-1 overflow-auto p-4 md:p-6">`) |
| `components/layout/app-sidebar.tsx` | Nav lists, role selection, active state (`usePathname()`), footer logout |
| `components/layout/site-header.tsx` | `SidebarTrigger`, `Separator`, role `Badge`, `ThemeToggle` |
| `components/ui/sidebar.tsx` | Provider state, Ctrl/Cmd+B shortcut, `sidebar_state` cookie write, mobile `Sheet` |
| `hooks/use-mobile.ts` | `useIsMobile()` — `matchMedia("(max-width: 767px)")` |
| `hooks/use-auth.ts` | User + `logout()` (owned by 002-authentication) |

## State & Data Flow

- User: `useAuth()` → `services/auth.ts#getCurrentUser` → `GET /api/auth/me` (decodes cookie server-side). Cached forever per `QueryClient`.
- Sidebar open state: React state in `SidebarProvider` (default `true`); persisted to `sidebar_state` cookie but not read back.
- Mobile state: `openMobile` React state; `useIsMobile()` listener on `matchMedia` change.

## Error / Loading Handling

- `/api/auth/me` 401 or loading → `user === null` → staff nav, no badge, footer "Log out". No skeleton.
- No error boundary (`error.tsx`) or `loading.tsx` exists for the protected group.

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. BFF Security Boundary | PASS | User data comes from `/api/auth/me`; no token in JS. Nav visibility is UX only. |
| II. Layered Data Access | PASS | Components use `useAuth()` hook → service → route handler. |
| III. Contract-First | PASS | `/api/auth/me` contract in [../../002-authentication/contracts/auth.md](../../002-authentication/contracts/auth.md). |
| IV. Test Every User Story | VIOLATION | No test asserts nav items per role, header badge, sidebar toggle, footer logout or mobile sheet. `tests/e2e/role-gating.spec.ts` renders the shell but only checks URLs/headings. |
| V. Pinned Stack & Base UI | PASS | `render={<Link/>}` composition, no `asChild`. |
| VI. Simplicity | PASS | Static nav arrays; no nav config service. |
