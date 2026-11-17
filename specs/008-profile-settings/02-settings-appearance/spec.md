# Feature Specification: Settings — Appearance

**Feature Branch**: `008-profile-settings`
**Created**: 2026-11-16
**Status**: Implemented (retroactive)
**Input**: Existing code — `app/(protected)/settings/page.tsx`, `components/layout/theme-toggle.tsx`, `components/layout/site-header.tsx`, `app/providers.tsx`

## User Scenarios & Testing

### User Story 1 - Switch between light and dark mode (Priority: P1)

Any signed-in user opens **Settings** and toggles the colour theme; the same toggle is available in the top header on every protected page.

**Why this priority**: It is the only setting the page offers.

**Independent Test**: Mock `/api/auth/me`, load `/settings`, click "Toggle theme", assert the `<html>` element's `class` contains/omits `dark`.

**Acceptance Scenarios**:

1. **Given** `/settings`, **Then** heading "Settings" and a card "Appearance" with description "Switch between light and dark mode." and an icon button labelled "Toggle theme".
2. **Given** the resolved theme is light, **When** the button is clicked, **Then** the theme becomes `dark` (the `<html>` element gets class `dark`) and the icon changes from Moon to Sun.
3. **Given** the resolved theme is dark, **When** clicked, **Then** the theme becomes `light`.
4. **Given** the header on any protected page, **Then** the same "Toggle theme" button is present and behaves identically.
5. **Given** a first visit with no stored preference, **Then** the theme follows the OS (`defaultTheme="system"`, `enableSystem`).
6. **Given** the user reloads, **Then** the chosen theme persists (stored by `next-themes` in the browser).

### Edge Cases

- Before hydration the icon always renders Moon (`mounted` guard) to avoid a hydration mismatch; `<html suppressHydrationWarning>` is set in `app/layout.tsx`.
- Once toggled, there is no way back to "system" from the UI — only explicit light/dark. [NEEDS CLARIFICATION: should Settings offer a "System" option?]
- The preference is per-browser, not per-account (no backend persistence).
- The page has two "Toggle theme" buttons (header + card); tests must scope the locator.

## Requirements

### Functional Requirements

- **FR-001**: The Settings page MUST render the shared `ThemeToggle` inside an "Appearance" card.
- **FR-002**: `ThemeToggle` MUST flip between `light` and `dark` based on `resolvedTheme`.
- **FR-003**: Theming MUST be class-based (`attribute="class"`) with system default and transitions disabled on change.
- **FR-004**: The toggle MUST have an accessible name "Toggle theme".
- **FR-005**: Settings MUST be reachable by every role from the sidebar.

### Key Entities

- None (client-only preference).

## Success Criteria

- **SC-001**: Theme change applies instantly without page reload and survives a reload.
- **SC-002**: No hydration warning is produced by the toggle on first render.

## Assumptions

- No other user settings (notifications, language, password) are in scope; none exist in code.
