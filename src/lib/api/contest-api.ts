import type {
  Contest,
  ContestCreatePayload,
  ContestJoinResult,
  ContestPage,
  ContestParticipant,
  ContestProblemItem,
  ContestScore,
} from "@/lib/api/contest-types";
import { apiFetch } from "@/lib/api/client";
import type { BaseAPIResponse } from "@/lib/api/types";
import { API_BASE_URL, API_SUCCESS_CODE } from "@/lib/auth/constants";
import { getAccessToken } from "@/lib/auth/token";

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function buildContestPageQuery(
  page: number,
  size: number,
  sort = "createTime,desc",
): string {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("size", String(size));
  qs.set("sort", sort);
  return qs.toString();
}

export async function fetchPublicContests(
  page = 0,
  size = 10,
): Promise<ContestPage> {
  const response = await fetch(
    `${API_BASE_URL}/contests/public?${buildContestPageQuery(page, size, "startTime,desc")}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Không thể tải danh sách kì thi");
  }

  return response.json() as Promise<ContestPage>;
}

export async function fetchPublicContestById(contestId: number): Promise<Contest> {
  const response = await fetch(`${API_BASE_URL}/contests/public/${contestId}`, {
    cache: "no-store",
  });

  const body: BaseAPIResponse<Contest> = await response.json();

  if (!response.ok || body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không tìm thấy kì thi");
  }

  return body.data;
}

export async function joinContest(
  contestId: number,
  password?: string,
): Promise<{ join: ContestJoinResult; message?: string }> {
  const response = await apiFetch<ContestJoinResult>(`/contests/${contestId}/join`, {
    method: "POST",
    body: password?.trim() ? { password: password.trim() } : {},
  });

  if (response.code !== API_SUCCESS_CODE || !response.data) {
    throw new Error(response.message ?? "Không thể tham gia kì thi");
  }

  return {
    join: response.data,
    message: response.message,
  };
}

export async function fetchContestProblems(
  contestId: number,
  password?: string,
): Promise<ContestProblemItem[]> {
  const qs = new URLSearchParams();
  if (password?.trim()) {
    qs.set("password", password.trim());
  }

  const query = qs.toString();
  const path = query
    ? `/contests/${contestId}/problems?${query}`
    : `/contests/${contestId}/problems`;

  const response = await apiFetch<ContestProblemItem[]>(path);

  if (response.code !== API_SUCCESS_CODE || !response.data) {
    throw new Error(response.message ?? "Không thể tải danh sách bài thi");
  }

  return response.data;
}

export async function fetchContestScore(
  contestId: number,
  password?: string,
): Promise<ContestScore> {
  const qs = new URLSearchParams();
  if (password?.trim()) {
    qs.set("password", password.trim());
  }

  const query = qs.toString();
  const path = query
    ? `/contests/${contestId}/score?${query}`
    : `/contests/${contestId}/score`;

  const response = await apiFetch<ContestScore>(path);

  if (response.code !== API_SUCCESS_CODE || !response.data) {
    throw new Error(response.message ?? "Không thể tải điểm kì thi");
  }

  return response.data;
}

export async function fetchContestParticipants(
  contestId: number,
): Promise<ContestParticipant[]> {
  const response = await apiFetch<ContestParticipant[]>(
    `/contests/${contestId}/participants`,
  );

  if (response.code !== API_SUCCESS_CODE || !response.data) {
    throw new Error(response.message ?? "Không thể tải danh sách thí sinh");
  }

  return response.data;
}

export async function fetchContests(page = 0, size = 10): Promise<ContestPage> {
  const response = await fetch(
    `${API_BASE_URL}/contests?${buildContestPageQuery(page, size)}`,
    {
      headers: authHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Không thể tải danh sách kì thi");
  }

  return response.json() as Promise<ContestPage>;
}

function buildContestBody(payload: ContestCreatePayload): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: payload.title.trim(),
    description: payload.description.trim(),
    startTime: payload.startTime,
    endTime: payload.endTime,
    visible: payload.visible,
  };

  if (payload.password?.trim()) {
    body.password = payload.password.trim();
  }

  if (payload.problems?.length) {
    body.problems = payload.problems.map((item, index) => ({
      problemId: item.problemId,
      sortIndex: item.sortIndex ?? index,
    }));
  } else {
    body.problems = [];
  }

  return body;
}

export async function fetchContestById(contestId: number): Promise<Contest> {
  const response = await apiFetch<Contest>(`/contests/${contestId}`);
  if (response.code !== API_SUCCESS_CODE || !response.data) {
    throw new Error(response.message ?? "Không tìm thấy kì thi");
  }
  return response.data;
}

export async function createContest(
  payload: ContestCreatePayload,
): Promise<Contest> {
  const response = await apiFetch<Contest>("/contests", {
    method: "POST",
    body: buildContestBody(payload),
  });

  if (response.code !== API_SUCCESS_CODE || !response.data) {
    throw new Error(response.message ?? "Không thể tạo kì thi");
  }

  return response.data;
}

export async function updateContest(
  contestId: number,
  payload: ContestCreatePayload,
): Promise<Contest> {
  const response = await apiFetch<Contest>(`/contests/${contestId}`, {
    method: "PUT",
    body: buildContestBody(payload),
  });

  if (response.code !== API_SUCCESS_CODE || !response.data) {
    throw new Error(response.message ?? "Không thể cập nhật kì thi");
  }

  return response.data;
}
