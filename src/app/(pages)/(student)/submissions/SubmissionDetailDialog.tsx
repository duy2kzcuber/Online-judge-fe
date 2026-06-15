"use client";

import { fetchSubmissionById } from "@/lib/api/submission-api";
import type { Submission, SubmissionResult } from "@/lib/api/submission-types";
import { getLanguageLabel } from "@/lib/submission/language";
import { getResultLabel, resolveResultStyle } from "@/lib/submission/result";
import Link from "next/link";
import { useEffect, useState } from "react";

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "—";
  }
}

type SubmissionDetailDialogProps = {
  submissionId: string;
  onClose: () => void;
};

export function SubmissionDetailDialog({
  submissionId,
  onClose,
}: SubmissionDetailDialogProps) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSubmissionById(submissionId);
        if (!cancelled) setSubmission(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải chi tiết bài nộp",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [submissionId]);

  const resultStyle = submission?.result
    ? resolveResultStyle(submission.result as SubmissionResult)
    : null;

  const problemHref =
    submission?.contestId != null
      ? `/problem/${submission.problemId}?contestId=${submission.contestId}`
      : `/problem/${submission?.problemId ?? ""}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[16px] py-[24px]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-oj-white w-full max-w-[720px] max-h-[90vh] overflow-y-auto rounded-[10px] border border-[#E5E7EB] shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-[12px] border-b border-[#E5E7EB] bg-oj-white px-[20px] py-[16px]">
          <div>
            <h3 className="text-[18px] font-[700] text-black">
              Chi tiết bài nộp
            </h3>
            {submission && (
              <p className="mt-[4px] text-[14px] text-gray-600">
                <Link
                  href={problemHref}
                  className="text-oj-orange hover:underline"
                  onClick={onClose}
                >
                  {submission.problemTitle ?? submission.problemId}
                </Link>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-[34px] min-w-[34px] rounded-[6px] border border-[#D1D5DB] text-[18px] leading-none hover:border-oj-orange hover:text-oj-orange"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="px-[20px] py-[16px]">
          {loading && (
            <p className="py-[24px] text-center text-[14px] text-gray-500">
              Đang tải chi tiết...
            </p>
          )}

          {error && (
            <p
              className="py-[24px] text-center text-[14px] text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}

          {submission && !loading && !error && (
            <div className="space-y-[16px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] text-[14px]">
                <p>
                  <span className="text-gray-600">Thời gian nộp:</span>{" "}
                  <strong>{formatDateTime(submission.createdAt)}</strong>
                </p>
                <p>
                  <span className="text-gray-600">Ngôn ngữ:</span>{" "}
                  <strong>{getLanguageLabel(submission.language)}</strong>
                </p>
                <p>
                  <span className="text-gray-600">Kết quả:</span>{" "}
                  {submission.result && resultStyle ? (
                    <span
                      className={`inline-block rounded-[6px] px-[8px] py-[3px] text-[13px] font-[600] ${resultStyle.badge}`}
                    >
                      {getResultLabel(submission.result as SubmissionResult)}
                    </span>
                  ) : (
                    <strong>—</strong>
                  )}
                </p>
                <p>
                  <span className="text-gray-600">Điểm:</span>{" "}
                  <strong>{submission.score ?? "—"}</strong>
                </p>
                <p>
                  <span className="text-gray-600">Thời gian chạy:</span>{" "}
                  <strong>
                    {submission.timeUsed != null
                      ? `${submission.timeUsed} ms`
                      : "—"}
                  </strong>
                </p>
                <p>
                  <span className="text-gray-600">Bộ nhớ:</span>{" "}
                  <strong>
                    {submission.memoryUsed != null
                      ? `${submission.memoryUsed} KB`
                      : "—"}
                  </strong>
                </p>
                {submission.contestId != null && (
                  <p>
                    <span className="text-gray-600">Kì thi:</span>{" "}
                    <Link
                      href={`/ki-thi/${submission.contestId}`}
                      className="text-oj-orange hover:underline font-[600]"
                      onClick={onClose}
                    >
                      #{submission.contestId}
                    </Link>
                  </p>
                )}
              </div>

              {submission.judgeMessage && (
                <div className="rounded-[8px] border border-[#E5E7EB] bg-[#FAFAFA] px-[14px] py-[12px] text-[14px]">
                  <p className="text-gray-600 mb-[4px]">Thông báo chấm bài</p>
                  <p className="text-black whitespace-pre-wrap">
                    {submission.judgeMessage}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[14px] text-gray-600 mb-[8px]">Mã nguồn</p>
                {submission.solution ? (
                  <pre className="max-h-[360px] overflow-auto rounded-[8px] bg-[#1e1e1e] p-[14px] text-[13px] text-[#d4d4d4] whitespace-pre-wrap">
                    {submission.solution}
                  </pre>
                ) : (
                  <p className="text-[14px] text-gray-500">Không có mã nguồn.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
