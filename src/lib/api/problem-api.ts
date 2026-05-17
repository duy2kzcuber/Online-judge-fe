import type { BaseAPIResponse } from "@/lib/api/types";
import type {
  Category,
  Problem,
  ProblemListParams,
  SpringPage,
} from "@/lib/api/problem-types";
import { API_BASE_URL, API_SUCCESS_CODE } from "@/lib/auth/constants";
import { getAccessToken } from "@/lib/auth/token";

function buildProblemQuery(params: ProblemListParams): string {
  const qs = new URLSearchParams();
  if (params.title?.trim()) qs.set("title", params.title.trim());
  if (params.category) qs.set("category", params.category);
  if (params.difficulty && params.difficulty > 0) {
    qs.set("difficulty", String(params.difficulty));
  }
  qs.set("page", String(params.page ?? 0));
  qs.set("size", String(params.size ?? 10));
  qs.set("sort", "createdAt,desc");
  return qs.toString();
}

export async function fetchProblems(
  params: ProblemListParams,
): Promise<SpringPage<Problem>> {
  const token = getAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/problems?${buildProblemQuery(params)}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Không thể tải danh sách bài tập");
  }

  return response.json() as Promise<SpringPage<Problem>>;
}

export async function fetchProblemById(id: string): Promise<Problem> {
  const body = await apiFetch<Problem>(`/problems/${id}`);
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không tìm thấy bài tập");
  }
  return body.data;
}

export async function fetchCategories(): Promise<Category[]> {
  const body = await apiFetch<Category[]>("/category");
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể tải danh mục");
  }
  return body.data;
}

async function apiFetch<T>(path: string): Promise<BaseAPIResponse<T>> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  return response.json();
}
