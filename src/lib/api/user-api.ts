import type {
  Role,
  User,
  UserCreatePayload,
  UserPage,
  UserUpdatePayload,
} from "@/lib/api/user-types";
import type { BaseAPIResponse } from "@/lib/api/types";
import { apiFetch } from "@/lib/api/client";
import { API_BASE_URL, API_SUCCESS_CODE } from "@/lib/auth/constants";
import { getAccessToken } from "@/lib/auth/token";

function authHeaders(json = false): HeadersInit {
  const token = getAccessToken();
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function buildUserPageQuery(page: number, size: number): string {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("size", String(size));
  qs.set("sort", "createdAt,desc");
  return qs.toString();
}

export async function fetchUsers(page = 0, size = 10): Promise<UserPage> {
  const response = await fetch(
    `${API_BASE_URL}/users?${buildUserPageQuery(page, size)}`,
    {
      headers: authHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Không thể tải danh sách người dùng");
  }

  return response.json() as Promise<UserPage>;
}

export async function fetchUserById(userId: string): Promise<User> {
  const body = await apiFetch<User>(`/users/${userId}`);
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không tìm thấy người dùng");
  }
  return body.data;
}

export async function fetchRoles(): Promise<Role[]> {
  const body = await apiFetch<Role[]>("/roles");
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể tải danh sách vai trò");
  }
  return body.data;
}

export async function createUser(payload: UserCreatePayload): Promise<User> {
  const body = await apiFetch<User>("/users", {
    method: "POST",
    body: payload,
  });
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể tạo người dùng");
  }
  return body.data;
}

function buildUserUpdateFormData(
  request: UserUpdatePayload,
  avatar?: File | null,
): FormData {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(request)], { type: "application/json" }),
  );
  if (avatar) {
    formData.append("avatar", avatar);
  }
  return formData;
}

export async function updateUser(
  userId: string,
  payload: UserUpdatePayload,
  avatar?: File | null,
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: buildUserUpdateFormData(payload, avatar),
  });
  const body = (await response.json()) as BaseAPIResponse<User>;
  if (!response.ok || body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể cập nhật người dùng");
  }
  return body.data;
}

export async function deleteUser(userId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) {
    let message = "Không thể xóa người dùng";
    try {
      const body = (await response.json()) as BaseAPIResponse<unknown>;
      if (body.message) message = body.message;
    } catch {
      /* empty body */
    }
    throw new Error(message);
  }
}
