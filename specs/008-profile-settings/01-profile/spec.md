# Feature Specification: Profile

**Feature Branch**: `008-profile-settings`
**Created**: 2026-11-16
**Status**: Implemented (retroactive)
**Input**: Existing code — `app/(protected)/profile/page.tsx`, `components/profile/shipping-details-form.tsx`, `hooks/use-profile.ts`

## User Scenarios & Testing

### User Story 1 - See my account details (Priority: P1)

Any signed-in user opens **Profile** and sees which email and role they are signed in with.

**Why this priority**: Basic identity confirmation for all roles.

**Independent Test**: Mock `/api/auth/me` for each role and load `/profile`.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** `/profile` loads, **Then** heading "Profile" and a card "Account details" show "Email" → `user.email` and "Role" → `user.role` (capitalised via CSS).
2. **Given** the identity request is in flight, **Then** a skeleton replaces the two rows.

---

### User Story 2 - Maintain shipping & contact details (Priority: P1, customers only)

A customer edits phone and address fields and saves them.

**Why this priority**: Shipping details belong to the customer's commerce flow (see `specs/006-commerce/`).

**Independent Test**: Mock `/api/auth/me` as customer plus `GET`/`PUT /api/backend/profile`; edit a field and save.

**Acceptance Scenarios**:

1. **Given** a customer, **Then** a second card "Shipping & contact details" shows inputs Phone, Address line 1, Address line 2, City, Postal code, Country.
2. **Given** the profile loads, **Then** inputs are prefilled from the response (null → empty); a skeleton is shown while loading.
3. **When** Save is clicked, **Then** the button reads "Saving…" and is disabled, `PUT /api/backend/profile` is sent with all six fields (`phone`, `address_line1`, `address_line2`, `city`, `postal_code`, `country`), toast "Profile updated" appears and the profile refetches.
4. **Given** the backend rejects the update, **Then** an error toast with the backend message is shown and the values stay in the form.
5. **Given** an employee or admin, **Then** the shipping card is not rendered and `GET /api/backend/profile` is not called.

### Edge Cases

- All six fields are optional strings with no length or format validation client-side (phone, postal code, country are free text). [NEEDS CLARIFICATION: required fields / formats expected by the backend for checkout?]
- Cleared fields are sent as `""`, not `null`.
- If `GET /api/backend/profile` fails, the form renders with empty values (no error shown); saving would then send empty strings for every field and may overwrite stored details.
- `Profile.name` / `Profile.email` from the backend are never displayed; the account card uses session claims, so a name is not shown anywhere.
- The customer-only form is gated purely in the frontend (`user?.role === "customer"`); the backend's own role policy for `/profile` is UNVERIFIED.

## Requirements

### Functional Requirements

- **FR-001**: The page MUST read identity via `useAuth()` (`/api/auth/me`) and show email and role.
- **FR-002**: The shipping form MUST render only when `user.role === "customer"`.
- **FR-003**: The form MUST use react-hook-form with a zod schema of six optional strings, and reset to server values whenever the profile query resolves.
- **FR-004**: Save MUST call `PUT /api/backend/profile`, invalidate `["profile"]`, and toast "Profile updated" or the error message.
- **FR-005**: Name, email and password MUST NOT be editable on this page (no UI exists).

### Key Entities

- **AuthUser** `{ id, email, role }` — [contracts/auth-me.md](../contracts/auth-me.md)
- **Profile / ProfileUpdateInput** — [contracts/profile.md](../contracts/profile.md)

## Success Criteria

- **SC-001**: A customer's saved shipping details are prefilled on the next visit to `/profile`.
- **SC-002**: Non-customers never trigger a `/api/backend/profile` request.

## Assumptions

- Session identity is fresh enough for display (`staleTime: Infinity`; changes require re-login).
