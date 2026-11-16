export type UserRole = "admin" | "employee" | "customer";

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}
