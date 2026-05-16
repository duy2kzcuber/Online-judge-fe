import type { AuthResponse, BaseAPIResponse, LoginCredentials } from "@/lib/api/types";
import { API_BASE_URL, API_SUCCESS_CODE } from "./constants";

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/log-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const body: BaseAPIResponse<AuthResponse> = await response.json();

  if (!response.ok) {
    throw new Error(body.message ?? "Đăng nhập thất bại");
  }

  if (body.code !== API_SUCCESS_CODE || !body.data?.token) {
    throw new Error(body.message ?? "Đăng nhập thất bại");
  }

  return body.data;
}
