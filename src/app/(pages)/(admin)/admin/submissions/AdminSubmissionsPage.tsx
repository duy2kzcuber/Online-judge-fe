"use client";

import {
  Pagination,
  type PaginationData,
} from "@/app/components/Pagination/Pagination";
import { SubmissionDetailDialog } from "@/app/(pages)/(student)/submissions/SubmissionDetailDialog";
import {
  deleteSubmission,
  fetchSubmissions,
} from "@/lib/api/submission-api";
import type { Submission, SubmissionResult } from "@/lib/api/submission-types";
import { getSpringPageMeta } from "@/lib/api/problem-types";
import { getLanguageLabel } from "@/lib/submission/language";
import {
  getProblemDisplay,
  getSubmitterDisplay,
} from "@/lib/submission/display";
import { getResultLabel, resolveResultStyle } from "@/lib/submission/result";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

const searchClass =
  "h-[38px] w-full max-w-[240px] border border-[#D1D5DB] rounded-[8px] px-[10px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange focus:outline-none";

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

function AdminSubmissionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const titleParam = searchParams.get("title") ?? "";
  const problemIdParam = searchParams.get("problemId") ?? "";
  const usernameParam = searchParams.get("username") ?? "";

  const [titleInput, setTitleInput] = useState(titleParam);
  const [problemIdInput, setProblemIdInput] = useState(problemIdParam);
  const [usernameInput, setUsernameInput] = useState(usernameParam);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setTitleInput(titleParam);
    setProblemIdInput(problemIdParam);
    setUsernameInput(usernameParam);
  }, [titleParam, problemIdParam, usernameParam]);

  const pushFilters = useCallback(
    (nextPage = 1) => {
      const params = new URLSearchParams();
      if (titleInput.trim()) params.set("title", titleInput.trim());
      if (problemIdInput.trim()) params.set("problemId", problemIdInput.trim());
      if (usernameInput.trim()) params.set("username", usernameInput.trim());
      params.set("page", String(nextPage));
      router.push(`/admin/submissions?${params.toString()}`);
    },
    [problemIdInput, router, titleInput, usernameInput],
  );

  const reloadList = useCallback(async () => {
    const data = await fetchSubmissions({
      page: page - 1,
      size: PAGE_SIZE,
      problemTitle: titleParam.trim() || undefined,
      problemId: problemIdParam.trim() || undefined,
      username: usernameParam.trim() || undefined,
    });
    setSubmissions(data.content ?? []);
    const pageMeta = getSpringPageMeta(data);
    setPagination({
      page,
      pageSize: pageMeta.size,
      totalPages: pageMeta.totalPages,
      totalItems: pageMeta.totalElements,
    });
  }, [page, problemIdParam, titleParam, usernameParam]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSubmissions({
          page: page - 1,
          size: PAGE_SIZE,
          problemTitle: titleParam.trim() || undefined,
          problemId: problemIdParam.trim() || undefined,
          username: usernameParam.trim() || undefined,
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
  }, [page, problemIdParam, titleParam, usernameParam]);

  const handleDelete = async (submission: Submission) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa bài nộp này? Hành động không thể hoàn tác.`,
    );
    if (!confirmed) return;

    setDeletingId(submission.id);
    try {
      await deleteSubmission(submission.id);
      if (submissions.length === 1 && page > 1) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(page - 1));
        router.push(`/admin/submissions?${params.toString()}`);
        return;
      }

      if (titleParam.trim()) {
        const params = new URLSearchParams(searchParams.toString());
        router.replace(`/admin/submissions?${params.toString()}`);
      } else {
        await reloadList();
      }
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Không thể xóa bài nộp",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const hasFilters = Boolean(
    titleParam.trim() || problemIdParam.trim() || usernameParam.trim(),
  );

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (titleParam.trim()) parts.push(`tên bài: "${titleParam.trim()}"`);
    if (problemIdParam.trim()) parts.push(`mã bài: ${problemIdParam.trim()}`);
    if (usernameParam.trim()) {
      parts.push(`mã SV: ${usernameParam.trim()}`);
    }
    return parts.join(" · ");
  }, [problemIdParam, titleParam, usernameParam]);

  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <div className="mb-[14px]">
        <h2 className="text-[18px] font-[600]">Quản lý bài nộp</h2>
        <p className="text-[13px] text-[#6B7280] mt-[4px]">
          Xem, tìm kiếm và xóa các bài nộp trên hệ thống
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-[8px] mb-[14px]">
        <input
          type="search"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && pushFilters(1)}
          className={searchClass}
          placeholder="Tên bài tập"
        />
        <input
          type="search"
          value={problemIdInput}
          onChange={(e) => setProblemIdInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && pushFilters(1)}
          className={searchClass}
          placeholder="Mã bài tập"
        />
        <input
          type="search"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && pushFilters(1)}
          className={searchClass}
          placeholder="Mã sinh viên"
        />
        <button
          type="button"
          onClick={() => pushFilters(1)}
          className="h-[38px] px-[14px] bg-oj-orange text-oj-white rounded-[8px] text-[14px] hover:bg-[#F5965B]"
        >
          Lọc
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setTitleInput("");
              setProblemIdInput("");
              setUsernameInput("");
              router.push("/admin/submissions?page=1");
            }}
            className="h-[38px] px-[14px] border border-[#D1D5DB] rounded-[8px] text-[14px] hover:border-oj-orange hover:text-oj-orange"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {hasFilters && (
        <p className="text-[13px] text-[#6B7280] mb-[12px]">
          Đang lọc theo: {filterSummary}
        </p>
      )}

      {loading ? (
        <p className="py-[40px] text-center text-[14px] text-[#6B7280]">
          Đang tải...
        </p>
      ) : error ? (
        <p className="py-[40px] text-center text-[14px] text-red-600" role="alert">
          {error}
        </p>
      ) : submissions.length === 0 ? (
        <p className="py-[40px] text-center text-[14px] text-[#6B7280]">
          Không có bài nộp nào phù hợp.
        </p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full min-w-[1080px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b text-left text-[#6B7280]">
                <th className="py-[12px] px-[8px] w-[50px]">#</th>
                <th className="py-[12px] px-[8px]">Bài tập</th>
                <th className="py-[12px] px-[8px] w-[160px]">Người nộp</th>
                <th className="py-[12px] px-[8px] w-[90px]">Kì thi</th>
                <th className="py-[12px] px-[8px] w-[100px]">Ngôn ngữ</th>
                <th className="py-[12px] px-[8px] w-[130px]">Kết quả</th>
                <th className="py-[12px] px-[8px] w-[70px]">Điểm</th>
                <th className="py-[12px] px-[8px] w-[150px]">
                  Thời gian / Bộ nhớ
                </th>
                <th className="py-[12px] px-[8px] w-[150px]">Thời gian nộp</th>
                <th className="py-[12px] px-[8px] w-[170px] text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission, index) => {
                const resultStyle = submission.result
                  ? resolveResultStyle(submission.result as SubmissionResult)
                  : null;
                const submitter = getSubmitterDisplay(submission);
                const problem = getProblemDisplay(submission);

                return (
                  <tr key={submission.id} className="border-b hover:bg-[#FAFAFA]">
                    <td className="py-[12px] px-[8px] text-[#6B7280]">
                      {(pagination.page - 1) * pagination.pageSize + index + 1}
                    </td>
                    <td className="py-[12px] px-[8px]">
                      <Link
                        href={`/admin/problems/create?edit=${problem.problemId}`}
                        className="font-[600] text-black line-clamp-2 hover:text-oj-orange"
                        title={problem.title}
                      >
                        {problem.title}
                      </Link>
                      {problem.showId && (
                        <div className="text-[12px] text-[#9CA3AF] font-mono mt-[2px]">
                          {problem.problemId}
                        </div>
                      )}
                    </td>
                    <td className="py-[12px] px-[8px]">
                      <div
                        className="font-[500] text-black line-clamp-2"
                        title={submitter.name}
                      >
                        {submitter.name}
                      </div>
                      {submitter.code && (
                        <div
                          className="text-[12px] text-[#9CA3AF] font-mono mt-[2px]"
                          title={`Mã sinh viên: ${submitter.code}`}
                        >
                          {submitter.code}
                        </div>
                      )}
                    </td>
                    <td className="py-[12px] px-[8px]">
                      {submission.contestId != null ? (
                        <Link
                          href={`/admin/contest/${submission.contestId}/view`}
                          className="text-oj-orange hover:underline"
                        >
                          #{submission.contestId}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-[12px] px-[8px]">
                      {getLanguageLabel(submission.language)}
                    </td>
                    <td className="py-[12px] px-[8px]">
                      {submission.result && resultStyle ? (
                        <span
                          className={`inline-block rounded-[6px] px-[8px] py-[3px] text-[12px] font-[600] ${resultStyle.badge}`}
                        >
                          {getResultLabel(submission.result as SubmissionResult)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-[12px] px-[8px]">{submission.score ?? "—"}</td>
                    <td className="py-[12px] px-[8px] whitespace-nowrap text-[#6B7280]">
                      {submission.timeUsed != null
                        ? `${submission.timeUsed} ms`
                        : "—"}
                      {" · "}
                      {submission.memoryUsed != null
                        ? `${submission.memoryUsed} KB`
                        : "—"}
                    </td>
                    <td className="py-[12px] px-[8px] whitespace-nowrap text-[#6B7280]">
                      {formatDateTime(submission.createdAt)}
                    </td>
                    <td className="py-[12px] px-[8px]">
                      <div className="flex items-center justify-end gap-[6px]">
                        <button
                          type="button"
                          onClick={() => setSelectedSubmissionId(submission.id)}
                          className="border border-[#D1D5DB] rounded-[6px] px-[8px] py-[5px] text-[13px] hover:border-oj-orange hover:text-oj-orange"
                        >
                          Chi tiết
                        </button>
                        {/* <button
                          type="button"
                          disabled={deletingId === submission.id}
                          onClick={() => handleDelete(submission)}
                          className="border border-[#FECACA] text-red-600 rounded-[6px] px-[8px] py-[5px] text-[13px] hover:bg-[#FEF2F2] disabled:opacity-50"
                        >
                          {deletingId === submission.id ? "Đang xóa..." : "Xóa"}
                        </button> */}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={pagination} basePath="/admin/submissions" />

      {selectedSubmissionId && (
        <SubmissionDetailDialog
          submissionId={selectedSubmissionId}
          onClose={() => setSelectedSubmissionId(null)}
        />
      )}
    </section>
  );
}

export function AdminSubmissionsPage() {
  return (
    <Suspense
      fallback={
        <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[40px] text-center text-[#6B7280]">
          Đang tải...
        </section>
      }
    >
      <AdminSubmissionsPageContent />
    </Suspense>
  );
}
