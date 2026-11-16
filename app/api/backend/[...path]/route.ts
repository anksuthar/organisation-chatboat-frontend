import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { BACKEND_URL, SESSION_COOKIE_NAME } from "@/lib/env";

/**
 * Single catch-all proxy for every FastAPI endpoint. Reads the httpOnly session
 * cookie server-side and attaches it as an Authorization header — the JWT never
 * reaches client-side JS. Streams both the request body (needed for multipart
 * uploads) and the response body (needed for the chat endpoint's SSE stream)
 * straight through rather than buffering, so this one route covers uploads,
 * plain JSON CRUD, and streaming alike without special-casing any of them.
 */
async function proxy(request: NextRequest, path: string[]): Promise<Response> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  const targetUrl = new URL(`${BACKEND_URL}/api/v1/${path.join("/")}`);
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (token) headers.set("authorization", `Bearer ${token}`);

  const hasBody = !["GET", "HEAD"].includes(request.method);

  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    // @ts-expect-error - undici requires `duplex` when streaming a request body
    duplex: hasBody ? "half" : undefined,
    cache: "no-store",
  });

  const responseHeaders = new Headers(backendResponse.headers);
  // Stale after passthrough — let the platform recompute framing for us.
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

type RouteParams = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).path);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).path);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).path);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).path);
}
