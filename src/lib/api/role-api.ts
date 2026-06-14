import type {
  Permission,
  PermissionPayload,
  RoleDetail,
  RolePayload,
  RoleUpdateResult,
} from "@/lib/api/role-types";
import { apiFetch } from "@/lib/api/client";
import { API_SUCCESS_CODE } from "@/lib/auth/constants";

export async function fetchRoleList(): Promise<RoleDetail[]> {
  const body = await apiFetch<RoleDetail[]>("/roles");
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể tải danh sách vai trò");
  }
  return body.data;
}

export async function fetchRoleById(roleId: number): Promise<RoleDetail> {
  const body = await apiFetch<RoleDetail>(`/roles/${roleId}`);
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không tìm thấy vai trò");
  }
  return body.data;
}

export async function createRole(payload: RolePayload): Promise<RoleDetail> {
  const body = await apiFetch<RoleDetail>("/roles", {
    method: "POST",
    body: {
      name: payload.name,
      permissionIds: payload.permissionIds ?? [],
    },
  });
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể tạo vai trò");
  }
  return body.data;
}

export async function updateRole(
  roleId: number,
  payload: RolePayload,
): Promise<RoleUpdateResult> {
  const body = await apiFetch<RoleDetail>(`/roles/${roleId}`, {
    method: "PUT",
    body: {
      name: payload.name,
      permissionIds: payload.permissionIds ?? [],
    },
  });
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể cập nhật vai trò");
  }
  return { role: body.data, token: body.token };
}

export async function deleteRole(roleId: number): Promise<void> {
  const body = await apiFetch<unknown>(`/roles/${roleId}`, {
    method: "DELETE",
  });
  if (body.code !== API_SUCCESS_CODE) {
    throw new Error(body.message ?? "Không thể xóa vai trò");
  }
}

export async function fetchPermissions(): Promise<Permission[]> {
  const body = await apiFetch<Permission[]>("/permissions");
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể tải danh sách quyền");
  }
  return body.data;
}

export async function createPermission(
  payload: PermissionPayload,
): Promise<Permission> {
  const body = await apiFetch<Permission>("/permissions", {
    method: "POST",
    body: payload,
  });
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể tạo quyền");
  }
  return body.data;
}
