"use client";

import { fetchContestParticipantDetail } from "@/lib/api/contest-api";
import type {
  ContestParticipant,
  ContestParticipantDetail,
} from "@/lib/api/contest-types";
import type { SubmissionResult } from "@/lib/api/submission-types";
import { getLanguageLabel } from "@/lib/submission/language";
import { getResultLabel, resolveResultStyle } from "@/lib/submission/result";
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

type ParticipantDetailDialogProps = {
  contestId: number;
  participant: ContestParticipant;
  onClose: () => void;
};

export function ParticipantDetailDialog({
  contestId,
  participant,
  onClose,
}: ParticipantDetailDialogProps) {
  const [detail, setDetail] = useState<ContestParticipantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchContestParticipantDetail(
          contestId,
          participant.userId,
        );
        if (!cancelled) setDetail(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải chi tiết thí sinh",
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
  }, [contestId, participant.userId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[16px] py-[24px]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-oj-white w-full max-w-[960px] max-h-[90vh] overflow-y-auto rounded-[10px] border border-[#E5E7EB] shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-[12px] border-b border-[#E5E7EB] bg-oj-white px-[20px] py-[16px]">
          <div>
            <h3 className="text-[18px] font-[700] text-black">
              Chi tiết thí sinh
            </h3>
            <p className="mt-[4px] text-[14px] text-gray-600">
              {participant.username}
              {participant.fullName?.trim()
                ? ` · ${participant.fullName.trim()}`
                : ""}
            </p>
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
            <p className="py-[24px] text-center text-[14px] text-red-600" role="alert">
              {error}
            </p>
          )}

          {detail && !loading && !error && (
            <div className="space-y-[20px]">
              <div className="flex flex-wrap gap-[16px] rounded-[8px] border border-[#E5E7EB] bg-[#FAFAFA] px-[16px] py-[14px] text-[14px]">
                <p>
                  <span className="text-gray-600">Tổng điểm:</span>{" "}
                  <strong className="text-oj-orange text-[16px]">
                    {detail.totalScore}
                  </strong>
                </p>
                <p>
                  <span className="text-gray-600">Bài đúng:</span>{" "}
                  <strong>
                    {detail.solvedCount}/{detail.totalProblems}
                  </strong>
                </p>
                <p>
                  <span className="text-gray-600">Tổng lượt nộp:</span>{" "}
                  <strong>{detail.submissionCount}</strong>
                </p>
              </div>

              {detail.problems.length === 0 ? (
                <p className="text-[14px] text-gray-600">
                  Kì thi chưa có bài tập nào.
                </p>
              ) : (
                detail.problems.map((problem, index) => {
                  const bestStyle = problem.bestResult
                    ? resolveResultStyle(
                        problem.bestResult as SubmissionResult,
                      )
                    : null;

                  return (
                    <section
                      key={problem.problemId}
                      className="rounded-[8px] border border-[#E5E7EB] overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-[12px] border-b border-[#E5E7EB] bg-[#FAFAFA] px-[16px] py-[12px]">
                        <div>
                          <p className="text-[13px] text-gray-500">
                            Bài {index + 1}
                          </p>
                          <h4 className="text-[15px] font-[600] text-black">
                            {problem.problemTitle ?? problem.problemId}
                          </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-[10px] text-[13px]">
                          {problem.bestResult && bestStyle ? (
                            <span
                              className={`inline-block rounded-[6px] px-[8px] py-[4px] font-[600] ${bestStyle.badge}`}
                            >
                              {getResultLabel(
                                problem.bestResult as SubmissionResult,
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-500">Chưa nộp</span>
                          )}
                          <span className="text-gray-600">
                            Điểm tốt nhất:{" "}
                            <strong>{problem.bestScore ?? "—"}</strong>
                          </span>
                          <span className="text-gray-600">
                            {problem.submissionCount} lượt nộp
                          </span>
                        </div>
                      </div>

                      {problem.submissions.length === 0 ? (
                        <p className="px-[16px] py-[14px] text-[14px] text-gray-500">
                          Chưa có lượt nộp nào cho bài này.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[720px] text-[13px]">
                            <thead>
                              <tr className="border-b border-[#EEEEEE] text-left text-gray-600">
                                <th className="py-[10px] px-[12px] w-[50px]">#</th>
                                <th className="py-[10px] px-[12px] w-[150px]">
                                  Thời gian
                                </th>
                                <th className="py-[10px] px-[12px] w-[100px]">
                                  Ngôn ngữ
                                </th>
                                <th className="py-[10px] px-[12px] w-[120px]">
                                  Kết quả
                                </th>
                                <th className="py-[10px] px-[12px] w-[70px]">
                                  Điểm
                                </th>
                                <th className="py-[10px] px-[12px] w-[120px]">
                                  Thời gian / Bộ nhớ
                                </th>
                                <th className="py-[10px] px-[12px]">
                                  Mã nguồn
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {problem.submissions.map((submission, subIndex) => {
                                const resultStyle = submission.result
                                  ? resolveResultStyle(submission.result)
                                  : null;

                                return (
                                  <tr
                                    key={submission.id}
                                    className="border-b border-[#F3F4F6] align-top"
                                  >
                                    <td className="py-[10px] px-[12px]">
                                      {subIndex + 1}
                                    </td>
                                    <td className="py-[10px] px-[12px] whitespace-nowrap">
                                      {formatDateTime(submission.createdAt)}
                                    </td>
                                    <td className="py-[10px] px-[12px]">
                                      {getLanguageLabel(submission.language)}
                                    </td>
                                    <td className="py-[10px] px-[12px]">
                                      {submission.result && resultStyle ? (
                                        <span
                                          className={`inline-block rounded-[6px] px-[8px] py-[3px] font-[600] ${resultStyle.badge}`}
                                        >
                                          {getResultLabel(submission.result)}
                                        </span>
                                      ) : (
                                        "—"
                                      )}
                                    </td>
                                    <td className="py-[10px] px-[12px]">
                                      {submission.score ?? "—"}
                                    </td>
                                    <td className="py-[10px] px-[12px] whitespace-nowrap">
                                      {submission.timeUsed != null
                                        ? `${submission.timeUsed} ms`
                                        : "—"}
                                      {" · "}
                                      {submission.memoryUsed != null
                                        ? `${submission.memoryUsed} KB`
                                        : "—"}
                                    </td>
                                    <td className="py-[10px] px-[12px]">
                                      {submission.solution ? (
                                        <details>
                                          <summary className="cursor-pointer text-oj-orange hover:underline">
                                            Xem mã
                                          </summary>
                                          <pre className="mt-[8px] max-h-[220px] overflow-auto rounded-[6px] bg-[#1e1e1e] p-[10px] text-[12px] text-[#d4d4d4] whitespace-pre-wrap">
                                            {submission.solution}
                                          </pre>
                                        </details>
                                      ) : (
                                        "—"
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </section>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
