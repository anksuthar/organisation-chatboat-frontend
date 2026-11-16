import { NextRequest, NextResponse } from "next/server";

import { BACKEND_URL, SESSION_COOKIE_NAME } from "@/lib/env";
import { decodeJwtPayload } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const backendResponse = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await backendResponse.json();

  if (!backendResponse.ok) {
    return NextResponse.json(data, { status: backendResponse.status });
  }

  const payload = decodeJwtPayload(data.access_token);
  const response = NextResponse.json({ role: payload?.role ?? null });

  response.cookies.set(SESSION_COOKIE_NAME, data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: payload ? Math.max(payload.exp - Math.floor(Date.now() / 1000), 0) : 60 * 60,
  });

  return response;
}
