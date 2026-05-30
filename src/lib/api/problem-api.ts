import type { BaseAPIResponse } from "@/lib/api/types";
import type {
  Category,
  Problem,
  ProblemListParams,
  ProblemRequestPayload,
  SpringPage,
} from "@/lib/api/problem-types";
import { API_BASE_URL, API_SUCCESS_CODE } from "@/lib/auth/constants";
import { getAccessToken } from "@/lib/auth/token";

function authHeaders(json = false): HeadersInit {
  const token = getAccessToken();
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function buildMultipartBody(
  request: ProblemRequestPayload,
  testCaseFile?: File | null,
): FormData {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(request)], { type: "application/json" }),
  );
  if (testCaseFile) {
    const zipFile = new File(
      [testCaseFile],
      testCaseFile.name,
      {
        type: "application/zip",
      },
    );
    formData.append("test_case", zipFile);
  }
  return formData;
}

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

export async function createProblem(
  request: ProblemRequestPayload,
  testCaseFile?: File | null,
): Promise<Problem> {
  const response = await fetch(`${API_BASE_URL}/problems`, {
    method: "POST",
    headers: authHeaders(),
    body: buildMultipartBody(request, testCaseFile),
  });
  const body = (await response.json()) as BaseAPIResponse<Problem>;
  if (!response.ok || body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể tạo bài tập");
  }
  return body.data;
}

export async function updateProblem(
  problemId: string,
  request: ProblemRequestPayload,
  testCaseFile?: File | null,
): Promise<Problem> {
  const response = await fetch(`${API_BASE_URL}/problems/${problemId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: buildMultipartBody(request, testCaseFile),
  });
  const body = (await response.json()) as BaseAPIResponse<Problem>;
  if (!response.ok || body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể cập nhật bài tập");
  }
  return body.data;
}

export async function deleteProblem(problemId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/problems/${problemId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const body = (await response.json()) as BaseAPIResponse<unknown>;
  if (!response.ok || body.code !== API_SUCCESS_CODE) {
    throw new Error(body.message ?? "Không thể xóa bài tập");
  }
}

async function apiFetch<T>(path: string): Promise<BaseAPIResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: authHeaders(true),
    cache: "no-store",
  });
  return response.json();
}
