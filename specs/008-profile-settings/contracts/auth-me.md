# Contract (reference): GET /api/auth/me

**Owner**: session lifecycle — documented by the authentication feature (`specs/002-authentication/`). Listed here because `/profile` depends on it.
**Sources**: `app/api/auth/me/route.ts`, `services/auth.ts#getCurrentUser`, `types/user.ts`, Playwright helper `mockMe()` in `tests/e2e/utils.ts`.

This is a Next.js route handler, not a FastAPI endpoint: it decodes the httpOnly `session` cookie server-side and does not call the backend.

- **Method/Path**: `GET /api/auth/me`
- **Response 200**: `{ id: number; email: string; role: "admin" | "employee" | "customer" }` (from JWT claims `sub`, `email`, `role`)
- **Response 401**: body `null` when the cookie is missing, undecodable or expired
- **Client handling**: `getCurrentUser()` returns `null` on any non-2xx; `useAuth()` caches it under `["auth", "me"]` with `staleTime: Infinity`.
