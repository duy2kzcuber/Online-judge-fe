"use client";

import { deleteProblem, fetchProblems } from "@/lib/api/problem-api";
import type { Category, Problem } from "@/lib/api/problem-types";
import { getDifficultyLabel } from "@/lib/problem/difficulty";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

interface PaginationData {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
}

function buildListQuery(
  page: number,
  title: string,
  category: string,
  difficulty: number,
): string {
  const params = new URLSearchParams();
  if (title.trim()) params.set("title", title.trim());
  if (category) params.set("category", category);
  if (difficulty > 0) params.set("difficulty", String(difficulty));
  params.set("page", String(page));
  return params.toString();
}

function AdminPagination({
  pagination,
  onPageChange,
}: {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}) {
  const { page, totalPages } = pagination;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i <= 3 || i > totalPages - 3 || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex gap-[6px] items-center justify-center mt-[16px]">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="h-[36px] min-w-[36px] border border-[#D1D5DB] rounded-[6px] text-[13px] disabled:opacity-50 hover:border-oj-orange hover:text-oj-orange"
      >
        ‹
      </button>
      {pages.map((p, index) =>
        p === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="h-[36px] min-w-[36px] flex items-center justify-center text-[#9CA3AF]"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`h-[36px] min-w-[36px] border rounded-[6px] text-[13px] ${
              page === p
                ? "bg-oj-orange text-white border-oj-orange"
                : "border-[#D1D5DB] hover:border-oj-orange hover:text-oj-orange"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="h-[36px] min-w-[36px] border border-[#D1D5DB] rounded-[6px] text-[13px] disabled:opacity-50 hover:border-oj-orange hover:text-oj-orange"
      >
        ›
      </button>
    </div>
  );
}

interface AdminProblemListProps {
  page: number;
  title: string;
  category: string;
  difficulty: number;
  categories: Category[];
}

export function AdminProblemList({
  page,
  title,
  category,
  difficulty,
  categories,
}: AdminProblemListProps) {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.title));
    return map;
  }, [categories]);

  const loadProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProblems({
        title,
        category: category || undefined,
        difficulty: difficulty > 0 ? difficulty : undefined,
        page: page - 1,
        size: PAGE_SIZE,
      });
      setProblems(data.content ?? []);
      setPagination({
        page,
        pageSize: data.size ?? PAGE_SIZE,
        totalPages: Math.max(1, data.totalPages ?? 1),
        totalItems: data.totalElements ?? 0,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải danh sách bài tập",
      );
      setProblems([]);
      setPagination({
        page: 1,
        pageSize: PAGE_SIZE,
        totalPages: 1,
        totalItems: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [page, title, category, difficulty]);

  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  const handleDelete = async (problem: Problem) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa bài tập "${problem.title}"? Hành động này không thể hoàn tác.`,
    );
    if (!confirmed) return;

    setDeletingId(problem.id);
    try {
      await deleteProblem(problem.id);
      await loadProblems();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Không thể xóa bài tập",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const pushPage = (nextPage: number) => {
    router.push(
      `/admin/problems?${buildListQuery(nextPage, title, category, difficulty)}`,
    );
  };

  if (loading) {
    return (
      <p className="py-[40px] text-center text-[14px] text-[#6B7280]">
        Đang tải danh sách bài tập...
      </p>
    );
  }

  if (error) {
    return (
      <p className="py-[40px] text-center text-[14px] text-red-600" role="alert">
        {error}
      </p>
    );
  }

  return (
    <>
      {problems.length === 0 ? (
        <p className="py-[40px] text-center text-[14px] text-[#6B7280]">
          Không có bài tập nào phù hợp.
        </p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="border-b text-left text-[#6B7280]">
                <th className="py-[12px] px-[8px] w-[48px]">#</th>
                <th className="py-[12px] px-[8px]">ID</th>
                <th className="py-[12px] px-[8px]">Tiêu đề</th>
                <th className="py-[12px] px-[8px]">Độ khó</th>
                <th className="py-[12px] px-[8px] text-center">Time (ms)</th>
                <th className="py-[12px] px-[8px] text-center">Memory (MB)</th>
                <th className="py-[12px] px-[8px]">Danh mục</th>
                <th className="py-[12px] px-[8px]">Trạng thái</th>
                <th className="py-[12px] px-[8px]">Ngày tạo</th>
                <th className="py-[12px] px-[8px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem, index) => (
                <tr key={problem.id} className="border-b hover:bg-[#FAFAFA]">
                  <td className="py-[12px] px-[8px] text-[#6B7280]">
                    {(pagination.page - 1) * pagination.pageSize + index + 1}
                  </td>
                  <td
                    className="py-[12px] px-[8px] font-mono text-[12px] text-[#374151] max-w-[120px] truncate"
                    title={problem.id}
                  >
                    {problem.id}
                  </td>
                  <td className="py-[12px] px-[8px] font-[500] max-w-[220px]">
                    <Link
                      href={`/problem/${problem.id}`}
                      className="hover:text-oj-orange line-clamp-2"
                      target="_blank"
                    >
                      {problem.title}
                    </Link>
                  </td>
                  <td className="py-[12px] px-[8px]">
                    <span className="inline-block bg-[#FFF1E9] text-oj-orange text-[12px] px-[8px] py-[3px] rounded-[6px]">
                      {getDifficultyLabel(problem.difficulty)}
                    </span>
                  </td>
                  <td className="py-[12px] px-[8px] text-center">
                    {problem.timeLimit ?? "—"}
                  </td>
                  <td className="py-[12px] px-[8px] text-center">
                    {problem.memoryLimit ?? "—"}
                  </td>
                  <td className="py-[12px] px-[8px]">
                    {(problem.categories ?? []).length > 0 ? (
                      <div className="flex flex-wrap gap-[4px]">
                        {problem.categories!.map((catId) => (
                          <span
                            key={catId}
                            className="bg-[#F3F4F6] text-[#4B5563] text-[11px] px-[6px] py-[2px] rounded-[4px]"
                          >
                            {categoryMap.get(catId) ?? catId}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[#9CA3AF]">—</span>
                    )}
                  </td>
                  <td className="py-[12px] px-[8px]">
                    <span
                      className={`text-[12px] px-[8px] py-[3px] rounded-[6px] ${
                        problem.isPublic
                          ? "bg-[#ECFDF5] text-[#047857]"
                          : "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      {problem.isPublic ? "Công khai" : "Ẩn"}
                    </span>
                  </td>
                  <td className="py-[12px] px-[8px] text-[#6B7280]">
                    {formatDate(problem.createdAt)}
                  </td>
                  <td className="py-[12px] px-[8px]">
                    <div className="flex items-center justify-end gap-[6px]">
                      <Link
                        href={`/admin/problems/create?edit=${problem.id}`}
                        className="border border-[#D1D5DB] rounded-[6px] px-[8px] py-[5px] text-[13px] hover:border-oj-orange hover:text-oj-orange"
                      >
                        Sửa
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === problem.id}
                        onClick={() => handleDelete(problem)}
                        className="border border-[#FECACA] text-red-600 rounded-[6px] px-[8px] py-[5px] text-[13px] hover:bg-[#FEF2F2] disabled:opacity-50"
                      >
                        {deletingId === problem.id ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <AdminPagination pagination={pagination} onPageChange={pushPage} />
      )}
    </>
  );
}
