# Feature Specification: Theming & Fallback Pages

**Feature Branch**: `001-platform-foundation`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented)

**Input**: Existing code `app/providers.tsx` (`ThemeProvider`), `components/layout/theme-toggle.tsx`, `components/ui/sonner.tsx`, `styles/globals.css`, `app/not-found.tsx`.

## User Scenarios & Testing

### User Story 1 - Light/dark theme (Priority: P2)

Users get the OS colour scheme by default and can switch between light and dark from the header.

**Why this priority**: Comfort/accessibility; not required for core flows.

**Independent Test**: Load a protected page, click "Toggle theme", assert `<html>` gains/loses class `dark`; reload and assert the choice persists.

**Acceptance Scenarios**:

1. **Given** no stored preference, **When** the app loads, **Then** the theme follows the OS (`defaultTheme="system"`, `enableSystem`).
2. **Given** the resolved theme is dark, **When** the user clicks the "Toggle theme" button, **Then** the theme becomes `light` (and vice versa); the class is applied on `<html>` (`attribute="class"`).
3. **Given** the theme changes, **When** it is applied, **Then** CSS transitions are disabled during the switch (`disableTransitionOnChange`).
4. **Given** dark theme, **When** the toggle renders after mount, **Then** it shows a Sun icon; otherwise a Moon icon (Moon is always shown before mount to avoid hydration mismatch).
5. **Given** a theme, **When** a toast appears, **Then** Sonner uses the same theme setting.

---

### User Story 2 - Not-found page (Priority: P3)

Unknown URLs show a 404 page with a way back.

**Why this priority**: Graceful handling of bad links.

**Independent Test**: With a valid session cookie, visit `/does-not-exist` and assert heading "404", text "This page doesn't exist." and a "Back home" link to `/`.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they open an unknown route, **Then** the 404 page renders full-screen (outside the sidebar shell).
2. **Given** the 404 page, **When** the user clicks "Back home", **Then** they navigate to `/`, which middleware redirects to `/admin` (admin) or `/chat` (others).
3. **Given** an unauthenticated visitor, **When** they open an unknown non-public route, **Then** middleware redirects them to the login page before the 404 renders.

### Edge Cases

- Theme toggle only switches between explicit `light`/`dark`; once clicked, "system" is no longer followed (no UI to return to system).
- `components/ui/sonner.tsx` passes `theme` (may be `"system"`), not `resolvedTheme`; Sonner resolves system itself.
- Unknown routes under `/admin/*` for non-admins hit `/unauthorized` (middleware) rather than 404.

## Requirements

### Functional Requirements

- **FR-001**: The app MUST use `next-themes` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`.
- **FR-002**: Theme colour tokens MUST be defined for light and `.dark` in `styles/globals.css`.
- **FR-003**: The header MUST provide a ghost icon button with `aria-label="Toggle theme"` that toggles `resolvedTheme` between `dark` and `light`.
- **FR-004**: The toggle MUST avoid hydration mismatch by rendering the Moon icon until mounted.
- **FR-005**: The toaster MUST follow the current theme.
- **FR-006**: `app/not-found.tsx` MUST render "404", "This page doesn't exist." and a "Back home" button linking to `/` via `Button render={<Link/>}`.

### Key Entities

- **Theme preference**: `light` | `dark` | `system`, persisted by `next-themes` in browser storage.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Theme switch applies in one click with no flash of incorrect theme on reload.
- **SC-002**: 100% of unknown routes for authenticated users render the 404 page.

## Assumptions

- Persisting theme in browser storage is acceptable (it is not sensitive data, Constitution I concerns only the JWT).
