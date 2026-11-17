# Feature Specification: App Shell & Navigation

**Feature Branch**: `001-platform-foundation`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented)

**Input**: Existing code `app/layout.tsx`, `app/providers.tsx`, `app/(protected)/layout.tsx`, `components/layout/app-sidebar.tsx`, `components/layout/site-header.tsx`, `components/ui/sidebar.tsx`, `hooks/use-mobile.ts`.

## User Scenarios & Testing

### User Story 1 - Role-aware sidebar navigation (Priority: P1)

After signing in, each user sees a sidebar with links appropriate to their role and the current page highlighted.

**Why this priority**: Primary way to reach every feature.

**Independent Test**: Set a `session` cookie per role, mock `/api/auth/me`, open a protected page and assert the visible nav labels.

**Acceptance Scenarios**:

1. **Given** an `admin` user, **When** any protected page loads, **Then** the sidebar shows an "Admin" group (Dashboard `/admin`, Categories `/admin/categories`, Documents `/admin/documents`, Upload `/admin/documents/upload`, Product Categories `/admin/product-categories`, Products `/admin/products`, Add Product `/admin/products/new`) followed by a "General" group (Chat `/chat`, Profile `/profile`, Settings `/settings`).
2. **Given** an `employee` user, **When** a protected page loads, **Then** only the "General" group (Chat, Profile, Settings) is shown.
3. **Given** a `customer` user, **When** a protected page loads, **Then** only a "Shop" group is shown: Chat `/chat`, Shop `/shop`, Cart `/cart`, My Orders `/orders`, Support Tickets `/tickets`, Profile `/profile`, Settings `/settings`.
4. **Given** the current pathname equals an item's `href`, **When** the sidebar renders, **Then** that item is marked active (exact match only).

---

### User Story 2 - Header with identity and controls (Priority: P2)

The header shows a sidebar toggle, the user's role as a badge, and the theme toggle.

**Why this priority**: Orientation (which role am I?) and layout control.

**Independent Test**: Load a protected page as `employee` and assert a badge with text "employee" (rendered capitalised) and a "Toggle theme" button.

**Acceptance Scenarios**:

1. **Given** a resolved user, **When** the header renders, **Then** a secondary badge shows `user.role` with CSS capitalisation.
2. **Given** the user is still loading or `/api/auth/me` returned 401, **When** the header renders, **Then** no badge is shown.
3. **Given** a desktop viewport, **When** the user clicks the sidebar trigger or presses Ctrl/Cmd+B, **Then** the sidebar collapses to icon mode (tooltips show labels) or expands.

---

### User Story 3 - Logout entry point (Priority: P2)

The sidebar footer shows the signed-in email; clicking it logs the user out (behaviour defined in [002-authentication/02-session-and-logout](../../002-authentication/02-session-and-logout/spec.md)).

**Why this priority**: Required to end a session; visible identity.

**Independent Test**: Click the footer button and assert navigation to the role's login page.

**Acceptance Scenarios**:

1. **Given** a resolved user, **When** the footer renders, **Then** the button label is the user's email with tooltip "Log out".
2. **Given** no resolved user, **When** the footer renders, **Then** the label is "Log out".

---

### User Story 4 - Responsive layout (Priority: P3)

Below 768 px the sidebar becomes an off-canvas sheet opened by the header trigger.

**Why this priority**: Usability on small screens.

**Independent Test**: Set viewport width 375 px, click the trigger, assert the sheet opens with nav items.

**Acceptance Scenarios**:

1. **Given** viewport width < 768 px, **When** the page loads, **Then** `useIsMobile()` returns `true` and the sidebar renders inside a `Sheet`.
2. **Given** the viewport crosses 768 px, **When** the media query changes, **Then** the layout switches mode.

### Edge Cases

- While `/api/auth/me` is loading (or returns 401), the user is `null`: the sidebar shows the staff "General" group and no "Admin" group; customers briefly see the staff items before their role resolves.
- Nested routes (e.g. `/admin/documents/42`, `/shop/7`) highlight no item because active matching is exact.
- The sidebar open state is written to the `sidebar_state` cookie (7 days) but the protected layout never reads it, so collapse state resets on full reload.
- `useIsMobile()` returns `false` on first render (before effect), so mobile users get one desktop-mode render.

## Requirements

### Functional Requirements

- **FR-001**: The root layout MUST set `<html lang="en">`, Geist Sans/Mono font variables, and metadata title "Knowledge Base" / description "Enterprise AI Knowledge Base — ask questions, get grounded answers with citations.".
- **FR-002**: The root layout MUST wrap all routes in `Providers` (theme, React Query, tooltip, toaster).
- **FR-003**: All `app/(protected)/` pages MUST render inside `SidebarProvider` with `AppSidebar` and `SidebarInset` containing `SiteHeader` and a scrollable `<main>` (padding 16 px, 24 px from `md`).
- **FR-004**: The sidebar MUST choose nav groups by `useAuth().user.role` as in US1; group label MUST be "Shop" for customers, "General" otherwise.
- **FR-005**: Nav links MUST use `SidebarMenuButton render={<Link/>}` (Base UI `render` prop) with `tooltip` labels for icon-collapsed mode.
- **FR-006**: The sidebar MUST be `collapsible="icon"` and toggle with Ctrl/Cmd+B.
- **FR-007**: The header MUST show `SidebarTrigger`, a role badge when a user is known, and `ThemeToggle`.
- **FR-008**: The mobile breakpoint MUST be 768 px (`hooks/use-mobile.ts`).
- **FR-009**: The footer MUST show the user's email (fallback "Log out") and call `useAuth().logout()` on click.
- **FR-010**: Toasts MUST render top-right with rich colours.

### Key Entities

- **NavItem**: `{ href, label, icon }`; three static lists: `adminNavItems`, `staffNavItems`, `customerNavItems`.

## Success Criteria

### Measurable Outcomes

- **SC-001**: For each of the 3 roles the rendered nav labels match US1 exactly.
- **SC-002**: Every protected page is reachable in ≤ 1 click from the sidebar for the roles allowed to view it.

## Assumptions

- Navigation visibility is UX only; route access is enforced by `middleware.ts` (UX) and FastAPI (authoritative).
