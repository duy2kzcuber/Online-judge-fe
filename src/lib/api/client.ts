import type { BaseAPIResponse } from "@/lib/api/types";
import { API_BASE_URL } from "@/lib/auth/constants";
import { getAccessToken } from "@/lib/auth/token";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<BaseAPIResponse<T>> {
  const { body, headers, ...rest } = options;
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return response.json();
}
