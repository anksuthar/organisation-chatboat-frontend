import type { UserRole } from "@/types/user";

export interface JwtPayload {
  sub: string;
  role: UserRole;
  email: string;
  exp: number;
  iat: number;
}

/**
 * Decodes (does NOT verify) a JWT payload. Safe for UX-only routing decisions
 * (e.g. middleware role-gating) since FastAPI is the real enforcement point —
 * every proxied request is re-validated against the signed token server-side.
 * Uses only Edge-runtime-safe base64url decoding, no crypto/jose dependency.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(payload: JwtPayload): boolean {
  return payload.exp * 1000 < Date.now();
}
