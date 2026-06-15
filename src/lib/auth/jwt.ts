import type { AuthUser, JwtPayload } from "@/lib/api/types";

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  return decodeURIComponent(
    atob(padded)
      .split("")
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );
}


export function decodeJwtPayload<T extends JwtPayload = JwtPayload>(
  token: string,
): T {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Token không hợp lệ");
  }

  try {
    return JSON.parse(base64UrlDecode(parts[1])) as T;
  } catch {
    throw new Error("Không thể decode token");
  }
}

function parseScope(scope: string | undefined): {
  roles: string[];
  permissions: string[];
} {
  if (!scope?.trim()) {
    return { roles: [], permissions: [] };
  }

  const parts = scope.trim().split(/\s+/);
  const roles: string[] = [];
  const permissions: string[] = [];

  for (const part of parts) {
    if (part.startsWith("ROLE_")) {
      roles.push(part.slice("ROLE_".length));
    } else {
      permissions.push(part);
    }
  }

  return { roles, permissions };
}

export function parseAuthUserFromToken(token: string): AuthUser {
  const payload = decodeJwtPayload(token);

  if (!payload.sub || !payload.userId) {
    throw new Error("Token thiếu thông tin người dùng");
  }

  const { roles, permissions } = parseScope(payload.scope);

  return {
    userId: payload.userId,
    username: payload.sub,
    fullName: "",
    email: "",
    scope: payload.scope ?? "",
    roles,
    permissions,
    exp: payload.exp,
    avatar: "",
  };
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload.exp) return false;
  return payload.exp * 1000 <= Date.now();
}
