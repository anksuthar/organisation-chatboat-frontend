# Contract: Authentication

Derived only from `app/api/auth/*/route.ts`, `services/auth.ts`, `lib/jwt.ts`, `types/user.ts`, `middleware.ts` and the mocks in `tests/e2e/auth.spec.ts`, `tests/e2e/role-gating.spec.ts`, `tests/e2e/utils.ts`.

Auth does **not** use `/api/backend/*`. The browser calls the three BFF routes below; only the login route talks to FastAPI (server-side).

## Types

```ts
type UserRole = "admin" | "employee" | "customer";
interface AuthUser { id: number; email: string; role: UserRole; }
```

## JWT payload (decoded, not verified, by `lib/jwt.ts`)

| Claim | Type | Use |
|---|---|---|
| `sub` | string (numeric user id) | `AuthUser.id = Number(sub)` |
| `role` | `UserRole` | routing, nav, login-portal check |
| `email` | string | sidebar footer label |
| `exp` | number (epoch seconds) | expiry checks; cookie `maxAge` |
| `iat` | number | not used |

Signing algorithm: tests use `HS256` header with a fake signature — real algorithm UNVERIFIED (not visible in frontend code; irrelevant to frontend since it never verifies).

---

## Backend endpoint (server-to-server)

### `POST ${BACKEND_URL}/api/v1/auth/login`

Called only from `app/api/auth/login/route.ts`.

- **Request**: `Content-Type: application/json`, body forwarded verbatim from the browser: `{ "email": string, "password": string }`.
- **Response 200**: `{ "access_token": string, ... }` — other fields (e.g. `token_type`) UNVERIFIED (not visible in frontend code).
- **Errors**: `401 { "detail": "Incorrect email or password" }` (from `tests/e2e/auth.spec.ts` mock). Other codes (422 validation, 403 inactive user, etc.) UNVERIFIED; any non-2xx JSON body is passed through as-is.

`POST /api/v1/auth/register` is mentioned in README for bootstrapping but is **not** called by the frontend.

---

## BFF endpoints (browser-facing)

### `POST /api/auth/login`

- **Request**: `{ "email": string, "password": string }` (JSON; client-validated by zod).
- **200**: body `{ "role": UserRole | null }` (`null` if the token payload cannot be decoded) and header `Set-Cookie: session=<jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=<exp-now, min 0, or 3600 if undecodable>; Secure` (Secure only when `NODE_ENV=production`).
- **Non-2xx**: same status and JSON body as FastAPI. Client reads `detail`, falling back to `"Login failed"`.
- **Unhandled**: non-JSON request body, non-JSON backend response, or backend unreachable → uncaught exception → Next.js 500.

### `GET /api/auth/me`

- **Request**: none (reads `session` cookie).
- **200**: `{ "id": number, "email": string, "role": UserRole }`.
- **401**: body `null` — when cookie missing, undecodable, or `exp` in the past.
- Client (`getCurrentUser`) maps any non-2xx to `null`.

### `POST /api/auth/logout`

- **Request**: none.
- **200**: `{ "ok": true }`; deletes the `session` cookie.
- Does not call FastAPI; the JWT itself is not revoked server-side. Whether the backend has a revocation endpoint is UNVERIFIED (not visible in frontend code).

## Error codes handled (summary)

| Code | Endpoint | Frontend handling |
|---|---|---|
| 401 | `/api/auth/login` | inline form error = `detail` |
| other non-2xx | `/api/auth/login` | inline form error = `detail` ?? "Login failed" |
| 401 | `/api/auth/me` | `useAuth().user = null` |
| any | `/api/auth/logout` | response ignored |
