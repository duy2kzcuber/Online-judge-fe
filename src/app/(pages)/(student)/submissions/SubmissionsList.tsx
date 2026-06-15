"use client";

import {
  Pagination,
  type PaginationData,
} from "@/app/components/Pagination/Pagination";
import { fetchMySubmissions } from "@/lib/api/submission-api";
import type { Submission, SubmissionResult } from "@/lib/api/submission-types";
import { getSpringPageMeta } from "@/lib/api/problem-types";
import { getLanguageLabel } from "@/lib/submission/language";
import { getResultLabel, resolveResultStyle } from "@/lib/submission/result";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SubmissionDetailDialog } from "./SubmissionDetailDialog";

const PAGE_SIZE = 10;

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

type SubmissionsListProps = {
  page: number;
  title: string;
};

export function SubmissionsList({ page, title }: SubmissionsListProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMySubmissions({
          page: page - 1,
          size: PAGE_SIZE,
          problemTitle: title.trim() || undefined,
        });
        if (cancelled) return;

        setSubmissions(data.content ?? []);
        const pageMeta = getSpringPageMeta(data);
        setPagination({
          page,
          pageSize: pageMeta.size,
          totalPages: pageMeta.totalPages,
          totalItems: pageMeta.totalElements,
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách bài nộp",
          );
          setSubmissions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [page, title]);

  if (loading) {
    return (
      <p className="text-center text-gray-500 py-[40px] text-[14px]">
        Đang tải danh sách bài nộp...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-600 py-[40px] text-[14px]" role="alert">
        {error}
      </p>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-[48px] text-[14px] text-gray-600">
        {title.trim()
          ? "Không tìm thấy bài nộp nào phù hợp với tên bài tập."
          : "Bạn chưa nộp bài tập nào."}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-[8px] border border-[#DEDEDE] bg-oj-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <table className="w-full min-w-[900px] text-[14px]">
          <thead>
            <tr className="border-b border-[#DEDEDE] bg-[#FAFAFA] text-left text-gray-600">
              <th className="py-[12px] px-[12px] font-[600] w-[50px]">#</th>
              <th className="py-[12px] px-[12px] font-[600]">Bài tập</th>
              <th className="py-[12px] px-[12px] font-[600] w-[90px]">Kì thi</th>
              <th className="py-[12px] px-[12px] font-[600] w-[100px]">
                Ngôn ngữ
              </th>
              <th className="py-[12px] px-[12px] font-[600] w-[130px]">
                Kết quả
              </th>
              <th className="py-[12px] px-[12px] font-[600] w-[70px]">Điểm</th>
              <th className="py-[12px] px-[12px] font-[600] w-[150px]">
                Thời gian / Bộ nhớ
              </th>
              <th className="py-[12px] px-[12px] font-[600] w-[150px]">
                Thời gian nộp
              </th>
              <th className="py-[12px] px-[12px] font-[600] w-[110px]" />
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission, index) => {
              const resultStyle = submission.result
                ? resolveResultStyle(submission.result as SubmissionResult)
                : null;
              const problemHref =
                submission.contestId != null
                  ? `/problem/${submission.problemId}?contestId=${submission.contestId}`
                  : `/problem/${submission.problemId}`;

              return (
                <tr
                  key={submission.id}
                  className="border-b border-[#EEEEEE] hover:bg-[#FFFAF7] transition-colors"
                >
                  <td className="py-[12px] px-[12px] text-gray-700">
                    {(pagination.page - 1) * pagination.pageSize + index + 1}
                  </td>
                  <td className="py-[12px] px-[12px]">
                    <Link
                      href={problemHref}
                      className="line-clamp-2 font-[500] text-black hover:text-oj-orange transition-colors"
                    >
                      {submission.problemTitle ?? submission.problemId}
                    </Link>
                  </td>
                  <td className="py-[12px] px-[12px] text-gray-700">
                    {submission.contestId != null ? (
                      <Link
                        href={`/ki-thi/${submission.contestId}`}
                        className="text-oj-orange hover:underline"
                      >
                        #{submission.contestId}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-[12px] px-[12px] text-gray-700">
                    {getLanguageLabel(submission.language)}
                  </td>
                  <td className="py-[12px] px-[12px]">
                    {submission.result && resultStyle ? (
                      <span
                        className={`inline-block rounded-[6px] px-[8px] py-[4px] text-[12px] font-[600] ${resultStyle.badge}`}
                      >
                        {getResultLabel(submission.result as SubmissionResult)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-[12px] px-[12px] text-gray-700">
                    {submission.score ?? "—"}
                  </td>
                  <td className="py-[12px] px-[12px] text-gray-700 whitespace-nowrap">
                    {submission.timeUsed != null
                      ? `${submission.timeUsed} ms`
                      : "—"}
                    {" · "}
                    {submission.memoryUsed != null
                      ? `${submission.memoryUsed} KB`
                      : "—"}
                  </td>
                  <td className="py-[12px] px-[12px] text-gray-700 whitespace-nowrap">
                    {formatDateTime(submission.createdAt)}
                  </td>
                  <td className="py-[12px] px-[12px]">
                    <button
                      type="button"
                      onClick={() => setSelectedSubmissionId(submission.id)}
                      className="inline-flex items-center justify-center rounded-[6px] border border-oj-orange px-[12px] py-[6px] text-[13px] text-oj-orange hover:bg-[#FFF5EE] transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination pagination={pagination} basePath="/submissions" />

      {selectedSubmissionId && (
        <SubmissionDetailDialog
          submissionId={selectedSubmissionId}
          onClose={() => setSelectedSubmissionId(null)}
        />
      )}
    </>
  );
}
