# Contract: Profile

**Sources**: `services/profile.ts`, `types/profile.ts`. No Playwright mocks exist for these endpoints.
Browser path is `/api/backend/<path>`; proxied to `${BACKEND_URL}/api/v1/<path>` with `Authorization: Bearer <session cookie>`. The profile is the current user's (identified from the token).

## Shared types

```ts
interface Profile {
  name: string;
  email: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
}
```

## Error handling

Non-2xx → `ApiError(status, body.detail ?? statusText)` (`services/api-client.ts`); `useUpdateProfile` shows `toast.error(message)`. `useProfile` errors are not displayed. Note: if the backend returns a FastAPI 422 with an array `detail`, the toast text would be the array coerced to a string. Specific status codes (403 for non-customers, 422 validation): UNVERIFIED (not visible in frontend code).

## GET /api/backend/profile

- **Caller**: `getProfile()` → `useProfile()` (key `["profile"]`)
- **Request**: none
- **Response 200**: `Profile`
- `name` and `email` are typed but not rendered anywhere in the UI.

## PUT /api/backend/profile

- **Caller**: `updateProfile(input)` → `useUpdateProfile()`
- **Request** (JSON): `ProfileUpdateInput = { phone?, address_line1?, address_line2?, city?, postal_code?, country? }` (all strings). The form always sends all six keys; cleared fields are sent as `""` (never `null`).
- **Response**: `Profile` (frontend ignores the body and refetches)
- Whether `""` clears a field to `null` or is stored as empty string, and any length/format validation: UNVERIFIED.
- Name/email are not updatable through this endpoint from the frontend (`ProfileUpdateInput` has no such fields).
