import type { BrowserContext } from "@playwright/test";

import type { UserRole } from "@/types/user";

const TEST_EMAILS: Record<UserRole, string> = {
  admin: "admin@test.com",
  employee: "employee@test.com",
  customer: "customer@test.com",
};

function base64url(obj: object): string {
  return Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Decoded client-side only for UX routing (middleware) — never signature-verified
 * there, so a fake signature is fine for tests that don't exercise the real backend. */
export function makeFakeJwt(role: UserRole, email: string = TEST_EMAILS[role]): string {
  const header = base64url({ alg: "HS256", typ: "JWT" });
  const payload = base64url({ sub: "1", role, email, exp: 9999999999, iat: 1700000000 });
  return `${header}.${payload}.fakesig`;
}

export async function loginAs(context: BrowserContext, role: UserRole, baseURL: string) {
  const token = makeFakeJwt(role);
  const url = new URL(baseURL);
  await context.addCookies([
    {
      name: "session",
      value: token,
      domain: url.hostname,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

export function mockMe(role: UserRole) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ id: 1, email: TEST_EMAILS[role], role }),
  };
}
