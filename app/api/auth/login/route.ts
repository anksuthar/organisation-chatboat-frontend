import { NextRequest, NextResponse } from "next/server";

import { BACKEND_URL, SESSION_COOKIE_NAME } from "@/lib/env";
import { decodeJwtPayload } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body" }, { status: 400 });
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ detail: "Backend unavailable" }, { status: 502 });
  }

  let data: { access_token?: string; detail?: unknown } | null = null;
  try {
    data = await backendResponse.json();
  } catch {
    // Non-JSON backend response (e.g. an HTML error page from a gateway).
  }

  if (!backendResponse.ok) {
    return NextResponse.json(
      { detail: data?.detail ?? (backendResponse.statusText || "Login failed") },
      { status: backendResponse.status },
    );
  }

  if (!data?.access_token) {
    return NextResponse.json({ detail: "Invalid response from backend" }, { status: 502 });
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
