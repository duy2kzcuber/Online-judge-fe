import type { Submission } from "@/lib/api/submission-types";

export function getProblemDisplay(submission: Submission) {
  const title = submission.problemTitle?.trim();
  return {
    title: title || submission.problemId || "—",
    showId: Boolean(title),
    problemId: submission.problemId,
  };
}

export function getSubmitterDisplay(submission: Submission) {
  const fullName = submission.submitterFullName?.trim() || "";
  const username = submission.submitterUsername?.trim() || "";

  if (fullName) {
    return {
      name: fullName,
      code: username,
    };
  }

  if (username) {
    return {
      name: username,
      code: "",
    };
  }

  return {
    name: submission.createdBy || "—",
    code: "",
  };
}
