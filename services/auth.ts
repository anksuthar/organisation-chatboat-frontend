import type { AuthUser, UserRole } from "@/types/user";

export async function login(email: string, password: string): Promise<{ role: UserRole }> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail ?? "Login failed");
  }

  return data;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me");
  if (!response.ok) return null;
  return response.json();
}
