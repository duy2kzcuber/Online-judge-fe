import type { AuthUser } from "@/lib/api/types";
import { hasAnyRole } from "./authorization";

type AdminRouteRule = {
  match: (pathname: string) => boolean;
  permissions?: string[];
};

const ADMIN_FALLBACK_ROLE = "admin";

const ADMIN_ROUTE_RULES: AdminRouteRule[] = [
  {
    match: (pathname) => pathname === "/admin",
    permissions: [
      "VIEW_USER",
      "CREATE_USER",
      "VIEW_PROBLEM",
      "CREATE_PROBLEM",
      "VIEW_CONTEST",
      "CREATE_CONTEST",
      "CREATE_POST",
      "CREATE_CTG",
    ],
  },
  {
    match: (pathname) => pathname.startsWith("/admin/users"),
    permissions: ["VIEW_USER", "CREATE_USER", "UPDATE_USER", "DELETE_USER"],
  },
  {
    match: (pathname) => pathname.startsWith("/admin/announcement"),
    permissions: ["CREATE_POST", "UPDATE_POST", "DELETE_POST"],
  },
  {
    match: (pathname) => pathname.startsWith("/admin/categories"),
    permissions: ["CREATE_CTG", "UPDATE_CTG", "DELETE_CTG"],
  },
  {
    match: (pathname) => pathname.startsWith("/admin/problems"),
    permissions: [
      "VIEW_PROBLEM",
      "CREATE_PROBLEM",
      "UPDATE_PROBLEM",
      "DELETE_PROBLEM",
    ],
  },
  {
    match: (pathname) => pathname.startsWith("/admin/submissions"),
    permissions: ["VIEW_PROBLEM", "DELETE_PROBLEM"],
  },
  {
    match: (pathname) => pathname.startsWith("/admin/contest"),
    permissions: ["VIEW_CONTEST", "CREATE_CONTEST", "DELETE_CONTEST"],
  },
  {
    match: (pathname) =>
      pathname.startsWith("/admin/roles") ||
      pathname.startsWith("/admin/conf") ||
      pathname.startsWith("/admin/judge-server") ||
      pathname.startsWith("/admin/prune-test-case"),
  },
];

function normalize(value: string): string {
  return value.trim().toUpperCase();
}

export function hasAnyPermission(
  user: AuthUser | null | undefined,
  permissions: string[],
): boolean {
  if (!user?.permissions?.length || permissions.length === 0) {
    return false;
  }

  return permissions.some((permission) => {
    const target = normalize(permission);
    return user.permissions.some((item) => normalize(item) === target);
  });
}

export function canAccessAdminPath(
  user: AuthUser | null | undefined,
  pathname: string,
): boolean {
  if (hasAnyRole(user, [ADMIN_FALLBACK_ROLE])) {
    return true;
  }

  const rule = ADMIN_ROUTE_RULES.find((item) => item.match(pathname));
  if (!rule) {
    return false;
  }

  if (!rule.permissions?.length) {
    return false;
  }

  return hasAnyPermission(user, rule.permissions);
}

export function canAccessAdminPanel(user: AuthUser | null | undefined): boolean {
  return canAccessAdminPath(user, "/admin");
}

const ADMIN_NAV_PATHS = [
  "/admin",
  "/admin/users",
  "/admin/roles",
  "/admin/announcement",
  "/admin/problems",
  "/admin/submissions",
  "/admin/categories",
  "/admin/contest",
] as const;

export function getFirstAccessibleAdminPath(
  user: AuthUser | null | undefined,
): string | null {
  for (const path of ADMIN_NAV_PATHS) {
    if (canAccessAdminPath(user, path)) {
      return path;
    }
  }
  return null;
}

export function canAccessAnyAdminRoute(
  user: AuthUser | null | undefined,
): boolean {
  return getFirstAccessibleAdminPath(user) !== null;
}
