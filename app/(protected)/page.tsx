import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME } from "@/lib/env";
import { decodeJwtPayload } from "@/lib/jwt";
import { roleHomePath } from "@/lib/roles";

// Middleware already redirects "/" based on role before this ever renders —
// this is a defense-in-depth fallback in case that ever changes.
export default async function RootIndexPage() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const payload = token ? decodeJwtPayload(token) : null;
  redirect(payload ? roleHomePath(payload.role) : "/login");
}
