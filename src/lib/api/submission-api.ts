import type { BaseAPIResponse } from "@/lib/api/types";
import type { Submission, SubmissionRequest } from "@/lib/api/submission-types";
import { API_BASE_URL, API_SUCCESS_CODE } from "@/lib/auth/constants";
import { getAccessToken } from "@/lib/auth/token";

export interface CreateSubmissionResult {
  submission: Submission;
  message?: string;
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
