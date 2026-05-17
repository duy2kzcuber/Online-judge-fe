import type { SubmissionResult } from "@/lib/api/submission-types";

export const RESULT_LABELS: Record<SubmissionResult, string> = {
  AC: "Accepted",
  WA: "Wrong Answer",
  TLE: "Time Limit Exceeded",
  MLE: "Memory Limit Exceeded",
};

export const RESULT_STYLES: Record<
  SubmissionResult,
  { badge: string; border: string; bg: string }
> = {
  AC: {
    badge: "bg-green-600 text-white",
    border: "border-green-200",
    bg: "bg-green-50",
  },
  WA: {
    badge: "bg-red-600 text-white",
    border: "border-red-200",
    bg: "bg-red-50",
  },
  TLE: {
    badge: "bg-amber-600 text-white",
    border: "border-amber-200",
    bg: "bg-amber-50",
  },
  MLE: {
    badge: "bg-purple-600 text-white",
    border: "border-purple-200",
    bg: "bg-purple-50",
  },
};

export function getResultLabel(result?: SubmissionResult): string {
  if (!result) return "—";
  return RESULT_LABELS[result] ?? result;
}
