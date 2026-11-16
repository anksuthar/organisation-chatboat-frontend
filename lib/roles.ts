import type { UserRole } from "@/types/user";

/** Where a logged-in user of this role lands by default. Admins get the
 * admin dashboard; everyone else (employee or customer) lands on chat —
 * the multi-intent agent handles both internal Q&A and customer
 * order/product/profile questions from the same screen. */
export function roleHomePath(role: UserRole): string {
  return role === "admin" ? "/admin" : "/chat";
}

/** Which login page a role signs in through. Kept separate from the admin
 * login so the admin portal isn't discoverable/usable by customers. */
export function loginPathForRole(role: UserRole): string {
  return role === "admin" ? "/admin/login" : "/login";
}

/** Which login page an unauthenticated visit to `pathname` should bounce
 * to — anything under `/admin` goes to the admin login, everything else
 * to the general one. */
export function loginPathForPathname(pathname: string): string {
  return pathname.startsWith("/admin") ? "/admin/login" : "/login";
}
