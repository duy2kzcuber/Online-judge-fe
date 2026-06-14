import type { AuthUser } from "@/lib/api/types";

const ADMIN_ROLES = new Set(["ADMIN"]);

function normalize(value: string): string {
  return value.trim().toUpperCase();
}

export function hasRole(user: AuthUser | null | undefined, role: string): boolean {
  if (!user?.roles?.length) return false;
  const target = normalize(role);
  return user.roles.some((item) => normalize(item) === target);
}

export function hasAnyRole(
  user: AuthUser | null | undefined,
  roles: string[],
): boolean {
  return roles.some((role) => hasRole(user, role));
}

export function isAdminUser(user: AuthUser | null | undefined): boolean {
  return hasAnyRole(user, [...ADMIN_ROLES]);
}
