# Implementation Plan: Profile

**Branch**: `008-profile-settings` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

A `"use client"` page that shows session identity and conditionally mounts a shipping/contact
form for customers.

## Files Involved

| Layer | Path |
|-------|------|
| Route | `app/(protected)/profile/page.tsx` (client component; renders account card + `ShippingDetailsForm` for customers) |
| Component | `components/profile/shipping-details-form.tsx` |
| Hooks | `hooks/use-profile.ts` — `useProfile`, `useUpdateProfile`; `hooks/use-auth.ts` — `useAuth` |
| Services | `services/profile.ts` (`getProfile`, `updateProfile`), `services/auth.ts` (`getCurrentUser`) |
| Types | `types/profile.ts`, `types/user.ts` |
| Session route | `app/api/auth/me/route.ts` |
| Nav | `components/layout/app-sidebar.tsx` ("Profile" in both `staffNavItems` and `customerNavItems`) |
| UI | `components/ui/{card,form,input,button,skeleton}.tsx` |

## State & Data Flow

- `useAuth()` → `["auth","me"]` → `{ user, isLoading }`.
- `ShippingDetailsForm` (mounted only for customers, so `useProfile` only fires for them):
  - `useProfile()` → `["profile"]` → `GET /api/backend/profile`.
  - `useEffect` on `profile` → `form.reset({...})` mapping snake_case → camelCase, `null` → `""`.
  - `onSubmit` → `updateProfile.mutateAsync({...})` mapping camelCase → snake_case → `PUT /api/backend/profile` → invalidate `["profile"]` → toast.

## Error / Loading Handling

- Identity loading: skeleton in the account card.
- Profile loading: skeleton in the shipping card. Profile query error: not surfaced; form shown empty.
- Update error: hook toast; `mutateAsync` rejection not caught in `onSubmit` (unhandled rejection; values remain).

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF | PASS | `/api/auth/me` and `/api/backend/profile` only |
| II. Layered | PASS | RHF + zod; React Query with invalidation |
| III. Contract-First | VIOLATION | [contracts/profile.md](../contracts/profile.md) reconstructed retroactively |
| IV. E2E per story | VIOLATION | No `/profile` tests, incl. role-gated form visibility |
| V. Base UI | PASS | No `asChild` / `Select` |
| VI. Simplicity | PASS | — |
