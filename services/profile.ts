import { apiFetch } from "@/services/api-client";
import type { Profile, ProfileUpdateInput } from "@/types/profile";

export function getProfile(): Promise<Profile> {
  return apiFetch("profile");
}

export function updateProfile(input: ProfileUpdateInput): Promise<Profile> {
  return apiFetch("profile", { method: "PUT", body: JSON.stringify(input) });
}
