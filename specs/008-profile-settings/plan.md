# Implementation Plan: Profile & Settings

**Branch**: `008-profile-settings` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-profile-settings/spec.md` (retroactive — code already exists)

## Summary

Two client pages under the protected layout. `/profile` combines session identity
(`useAuth()` → `/api/auth/me`) with a customer-only react-hook-form backed by the `profile`
resource. `/settings` renders the shared `ThemeToggle` (also present in `SiteHeader`).

## Technical Context

**Language/Version**: TypeScript (strict), React 19.1, Next.js 15.5 App Router
**Primary Dependencies**: `@tanstack/react-query` 5, `react-hook-form` 7 + `zod` 4, `next-themes` 0.4, shadcn/ui on `@base-ui/react`, `sonner`, `lucide-react`
**Storage**: Profile on backend; theme preference in browser storage via `next-themes`
**Testing**: Playwright with mocked backend — **no tests for these pages yet**
**Target Platform**: Modern browsers
**Project Type**: Web frontend (BFF)
**Performance Goals**: N/A (two small pages); `useAuth` query has `staleTime: Infinity`
**Constraints**: JWT never exposed to client JS
**Scale/Scope**: 2 routes, 2 feature components, 1 hook module, 1 service

## Architecture & Data Flow

```text
/profile  page.tsx ("use client")
  ├─ useAuth()  ─► services/auth.ts getCurrentUser() ─► fetch("/api/auth/me") ─► decode httpOnly cookie server-side
  └─ (customer only) ShippingDetailsForm
        ├─ useProfile()       ─► services/profile.ts getProfile()    ─► apiFetch("profile")       ─► /api/backend/profile (GET)
        └─ useUpdateProfile() ─► services/profile.ts updateProfile() ─► apiFetch("profile", PUT) ─► /api/backend/profile (PUT)
                                                                                                     └─► ${BACKEND_URL}/api/v1/profile

/settings page.tsx ("use client") ─► ThemeToggle ─► next-themes useTheme().setTheme()   (no network)
SiteHeader ─► ThemeToggle (same component)
app/providers.tsx ─► <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
```

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security Boundary | PASS | Identity via `/api/auth/me`; profile via `/api/backend/profile`; no token access in client |
| II. Layered Data Access | PASS | page → component → `hooks/use-profile.ts` → `services/profile.ts` → `api-client`; RHF + zod form; `["profile"]` invalidated on update. `services/auth.ts` uses raw `fetch` to `/api/auth/*`, which the constitution permits for session lifecycle |
| III. Contract-First | VIOLATION | `contracts/profile.md` reconstructed from frontend code only; no backend spec link |
| IV. Test Every User Story | VIOLATION | No Playwright tests for `/profile` or `/settings` |
| V. Pinned Stack & Base UI | PASS | No `asChild`, no `Select`; `next-themes` already in stack |
| VI. Simplicity | PASS | Reuses `ThemeToggle`; no new dependencies |

## Project Structure

### Documentation (this feature)

```text
specs/008-profile-settings/
├── spec.md
├── plan.md
├── contracts/
│   ├── profile.md
│   └── auth-me.md          # reference only — owned by 002-authentication
├── 01-profile/              {spec,plan,tasks}.md
└── 02-settings-appearance/  {spec,plan,tasks}.md
```

### Source Code (repository root)

```text
app/(protected)/profile/page.tsx
app/(protected)/settings/page.tsx
app/providers.tsx                         # ThemeProvider config
app/layout.tsx                            # <html suppressHydrationWarning>
app/api/auth/me/route.ts                  # session identity
components/profile/shipping-details-form.tsx
components/layout/theme-toggle.tsx
components/layout/site-header.tsx         # also renders ThemeToggle + role badge
components/layout/app-sidebar.tsx         # "Profile" / "Settings" nav entries
hooks/use-profile.ts
hooks/use-auth.ts
services/profile.ts
services/auth.ts
types/profile.ts
types/user.ts
```

**Structure Decision**: Existing single Next.js app; same layering as other features.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| III / IV | Not justified — tracked as GAP tasks in sub-feature `tasks.md` | — |
