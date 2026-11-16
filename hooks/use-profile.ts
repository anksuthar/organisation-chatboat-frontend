"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getProfile, updateProfile } from "@/services/profile";
import type { ProfileUpdateInput } from "@/types/profile";

const PROFILE_KEY = ["profile"] as const;

export function useProfile() {
  return useQuery({ queryKey: PROFILE_KEY, queryFn: getProfile });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileUpdateInput) => updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(error.message),
  });
}
