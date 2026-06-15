import type { BaseAPIResponse } from "@/lib/api/types";
import type { SpringPage } from "@/lib/api/problem-types";
import type { Submission, SubmissionRequest, SubmissionResult } from "@/lib/api/submission-types";
import { API_BASE_URL, API_SUCCESS_CODE } from "@/lib/auth/constants";
import { getAccessToken } from "@/lib/auth/token";

export interface CreateSubmissionResult {
  submission: Submission;
  message?: string;
}

export interface SubmissionSearchParams {
  page?: number;
  size?: number;
  problemId?: string;
  problemTitle?: string;
  createdBy?: string;
  username?: string;
  contestId?: number;
  result?: SubmissionResult;
  createdFrom?: string;
  createdTo?: string;
}

function buildSubmissionQuery(params: SubmissionSearchParams): string {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 0));
  qs.set("size", String(params.size ?? 10));
  qs.set("sort", "createdAt,desc");

  if (params.problemId?.trim()) qs.set("problemId", params.problemId.trim());
  if (params.problemTitle?.trim()) {
    qs.set("problemTitle", params.problemTitle.trim());
  }
  if (params.createdBy?.trim()) qs.set("createdBy", params.createdBy.trim());
  if (params.username?.trim()) qs.set("username", params.username.trim());
  if (params.contestId != null) qs.set("contestId", String(params.contestId));
  if (params.result) qs.set("result", params.result);
  if (params.createdFrom) qs.set("createdFrom", params.createdFrom);
  if (params.createdTo) qs.set("createdTo", params.createdTo);

  return qs.toString();
}

export async function createSubmission(
  request: SubmissionRequest,
): Promise<CreateSubmissionResult> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để nộp bài");
  }

  const response = await fetch(`${API_BASE_URL}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  const body: BaseAPIResponse<Submission> = await response.json();

  if (!response.ok || body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Nộp bài thất bại");
  }

  return {
    submission: body.data,
    message: body.message,
  };
}

export async function fetchContestSubmissions(
  contestId: number,
  problemIds: string[],
): Promise<Submission[]> {
  const token = getAccessToken();
  if (!token) {
    return [];
  }

  const params = new URLSearchParams();
  for (const problemId of problemIds) {
    if (problemId.trim()) {
      params.append("problemIds", problemId.trim());
    }
  }

  const query = params.toString();
  const path = query
    ? `${API_BASE_URL}/submissions/contest/${contestId}?${query}`
    : `${API_BASE_URL}/submissions/contest/${contestId}`;

  const response = await fetch(path, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const body: BaseAPIResponse<Submission[]> = await response.json();

  if (!response.ok || body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể tải bài nộp trong kì thi");
  }

  return body.data;
}

export type MySubmissionsParams = SubmissionSearchParams;

export async function fetchMySubmissions(
  params: MySubmissionsParams = {},
): Promise<SpringPage<Submission>> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để xem bài nộp");
  }

  const response = await fetch(
    `${API_BASE_URL}/submissions/me?${buildSubmissionQuery(params)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Không thể tải danh sách bài nộp");
  }

  return response.json() as Promise<SpringPage<Submission>>;
}

export type SubmissionsListParams = SubmissionSearchParams;

export async function fetchSubmissions(
  params: SubmissionsListParams = {},
): Promise<SpringPage<Submission>> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập");
  }

  const response = await fetch(
    `${API_BASE_URL}/submissions?${buildSubmissionQuery(params)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Không thể tải danh sách bài nộp");
  }

  return response.json() as Promise<SpringPage<Submission>>;
}

export async function deleteSubmission(id: string): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập");
  }

  const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const body: BaseAPIResponse<unknown> = await response.json();
  if (!response.ok || body.code !== API_SUCCESS_CODE) {
    throw new Error(body.message ?? "Không thể xóa bài nộp");
  }
}

export async function fetchSubmissionById(id: string): Promise<Submission> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập");
  }

  const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const body: BaseAPIResponse<Submission> = await response.json();
  if (!response.ok || body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không tìm thấy bài nộp");
  }

  return body.data;
}
