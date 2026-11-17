import { formatErrorDetail } from "@/services/api-client";
import type { AuthUser, UserRole } from "@/types/user";

export async function login(email: string, password: string): Promise<{ role: UserRole }> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(formatErrorDetail(data?.detail, "Login failed"));
  }

  return data;
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    throw new Error("Logout failed");
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me");
  if (!response.ok) return null;
  return response.json();
}
