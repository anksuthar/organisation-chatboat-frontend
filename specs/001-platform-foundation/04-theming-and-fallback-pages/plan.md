# Implementation Plan: Theming & Fallback Pages

**Branch**: `001-platform-foundation` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

`next-themes` `ThemeProvider` at the top of `Providers` toggles a `dark` class on `<html>`; Tailwind 4 `@custom-variant dark` and `.dark` token overrides in `styles/globals.css` style the app. A header button flips light/dark. `app/not-found.tsx` is a static server component.

## Files Involved

| File | Role |
|---|---|
| `app/providers.tsx` | `ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange` |
| `app/layout.tsx` | `suppressHydrationWarning` on `<html>` (required by next-themes) |
| `styles/globals.css` | `@custom-variant dark (&:is(.dark *))`, `.dark { ... }` tokens |
| `components/layout/theme-toggle.tsx` | `useTheme()`, `mounted` guard, Sun/Moon icon, `aria-label="Toggle theme"` |
| `components/layout/site-header.tsx` | Hosts `ThemeToggle` |
| `components/ui/sonner.tsx` | `Toaster` reads `useTheme().theme` |
| `app/not-found.tsx` | 404 page, `Button render={<Link href="/" />}` |

## State & Data Flow

Theme: `next-themes` internal state + browser storage → class on `<html>`. No server calls. 404: static render; "Back home" → `/` → `middleware.ts` role redirect.

## Error / Loading Handling

Not applicable (no data fetching). Pre-mount the toggle renders the Moon icon.

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. BFF Security Boundary | PASS | Only the theme preference is stored client-side; no secrets. |
| II. Layered Data Access | PASS | No data access. |
| III. Contract-First | PASS | No backend calls. |
| IV. Test Every User Story | VIOLATION | No Playwright test for the theme toggle or the 404 page. |
| V. Pinned Stack & Base UI | PASS | `render` prop used for the 404 link button. |
| VI. Simplicity | PASS | Uses `next-themes` already in the stack. |
