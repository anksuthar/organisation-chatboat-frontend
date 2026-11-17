# Implementation Plan: Settings — Appearance

**Branch**: `008-profile-settings` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

Static settings page wrapping the existing `ThemeToggle`; theme state is owned by
`next-themes` configured once in `app/providers.tsx`. No backend involvement.

## Files Involved

| Layer | Path |
|-------|------|
| Route | `app/(protected)/settings/page.tsx` (client component) |
| Component | `components/layout/theme-toggle.tsx` |
| Also uses toggle | `components/layout/site-header.tsx` |
| Provider | `app/providers.tsx` — `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>` |
| Root layout | `app/layout.tsx` — `<html lang="en" suppressHydrationWarning>` |
| Nav | `components/layout/app-sidebar.tsx` ("Settings" in `staffNavItems` and `customerNavItems`) |
| UI | `components/ui/{card,button}.tsx`, `lucide-react` `Sun`/`Moon` |

## State & Data Flow

- `useTheme()` → `{ resolvedTheme, setTheme }`; click → `setTheme(resolvedTheme === "dark" ? "light" : "dark")`.
- Local `mounted` flag (set in `useEffect`) decides Sun vs Moon icon to keep SSR and first client render identical.
- No React Query, no services, no API calls.

## Error / Loading Handling

- None required (no network). Storage unavailability is handled internally by `next-themes`.

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF | PASS | No backend traffic |
| II. Layered | PASS | N/A — no server state |
| III. Contract-First | PASS | No endpoints |
| IV. E2E per story | VIOLATION | No Playwright test for the theme toggle |
| V. Base UI | PASS | Uses `components/ui/button` |
| VI. Simplicity | PASS | Reuses header toggle; no new deps |
