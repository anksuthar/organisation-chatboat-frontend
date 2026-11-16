"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { loginPathForRole } from "@/lib/roles";
import { getCurrentUser, logout as logoutRequest } from "@/services/auth";

export function useAuth() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    staleTime: Infinity,
  });

  async function logout() {
    const redirectTo = loginPathForRole(query.data?.role ?? "employee");
    await logoutRequest();
    queryClient.clear();
    window.location.href = redirectTo;
  }

  return { user: query.data ?? null, isLoading: query.isLoading, logout };
}
