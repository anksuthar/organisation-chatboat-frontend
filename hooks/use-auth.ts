"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
    let failed = false;
    try {
      await logoutRequest();
    } catch {
      failed = true;
      toast.error("Couldn't reach the server to sign out. Your session may still be active.");
    }
    queryClient.clear();
    // On failure, wait briefly so the toast is visible before the hard navigation.
    setTimeout(() => {
      window.location.href = redirectTo;
    }, failed ? 1500 : 0);
  }

  return { user: query.data ?? null, isLoading: query.isLoading, logout };
}
