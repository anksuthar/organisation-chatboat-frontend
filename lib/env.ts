// Server-only. Never import this from a "use client" component — the backend
// URL must never reach the client bundle (the whole point of the BFF proxy).
// `server-only` is resolved by Next's bundler: importing this from client code fails the build.
import "server-only";

export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";
export const SESSION_COOKIE_NAME = "session";
