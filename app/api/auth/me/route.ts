import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/env";
import { decodeJwtPayload, isJwtExpired } from "@/lib/jwt";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(null, { status: 401 });
  }

  const payload = decodeJwtPayload(token);
  if (!payload || isJwtExpired(payload)) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json({ id: Number(payload.sub), email: payload.email, role: payload.role });
}
