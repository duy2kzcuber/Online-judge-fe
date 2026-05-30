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

export const DEFAULT_RESULT_STYLE = {
  badge: "bg-gray-600 text-white",
  border: "border-gray-200",
  bg: "bg-gray-50",
};

export function resolveResultStyle(result?: SubmissionResult) {
  if (!result) return DEFAULT_RESULT_STYLE;
  return RESULT_STYLES[result] ?? DEFAULT_RESULT_STYLE;
}

export type SubmitFeedbackTone = "success" | "error" | "warning";

export function getSubmitFeedback(result?: SubmissionResult): {
  title: string;
  description: string;
  tone: SubmitFeedbackTone;
} {
  switch (result) {
    case "AC":
      return {
        title: "Chấm bài thành công!",
        description: "Bài làm của bạn đã được chấp nhận (Accepted).",
        tone: "success",
      };
    case "WA":
      return {
        title: "Chấm bài xong — chưa đạt",
        description: "Kết quả: Wrong Answer. Hãy kiểm tra lại thuật toán hoặc định dạng output.",
        tone: "error",
      };
    case "TLE":
      return {
        title: "Chấm bài xong — vượt thời gian",
        description: "Kết quả: Time Limit Exceeded. Code chạy quá giới hạn thời gian.",
        tone: "warning",
      };
    case "MLE":
      return {
        title: "Chấm bài xong — vượt bộ nhớ",
        description: "Kết quả: Memory Limit Exceeded. Code sử dụng quá nhiều bộ nhớ.",
        tone: "warning",
      };
    default:
      return {
        title: "Đã nộp bài",
        description: "Hệ thống đã nhận bài nộp. Xem chi tiết kết quả bên dưới.",
        tone: "warning",
      };
  }
}

export const FEEDBACK_BANNER_STYLES: Record<
  SubmitFeedbackTone,
  { border: string; bg: string; title: string; icon: string }
> = {
  success: {
    border: "border-green-300",
    bg: "bg-green-50",
    title: "text-green-800",
    icon: "text-green-600",
  },
  error: {
    border: "border-red-300",
    bg: "bg-red-50",
    title: "text-red-800",
    icon: "text-red-600",
  },
  warning: {
    border: "border-amber-300",
    bg: "bg-amber-50",
    title: "text-amber-900",
    icon: "text-amber-600",
  },
};
