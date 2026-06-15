"use client";

import {
  Pagination,
  type PaginationData,
} from "@/app/components/Pagination/Pagination";
import { fetchProblems } from "@/lib/api/problem-api";
import { getSpringPageMeta, type Category, type Problem } from "@/lib/api/problem-types";
import { getDifficultyLabel } from "@/lib/problem/difficulty";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

interface ProblemListProps {
  page: number;
  title: string;
  category: string;
  difficulty: number;
  categories: Category[];
}

export function ProblemList({
  page,
  title,
  category,
  difficulty,
  categories,
}: ProblemListProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.title));
    return map;
  }, [categories]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
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

        if (cancelled) return;

        setProblems(data.content ?? []);
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
            err instanceof Error ? err.message : "Không thể tải danh sách bài tập",
          );
          setProblems([]);
          setPagination({
            page: 1,
            pageSize: PAGE_SIZE,
            totalPages: 1,
            totalItems: 0,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [page, title, category, difficulty]);

  if (loading) {
    return (
      <p className="py-[40px] text-center text-[14px] text-gray-500">
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
        <p className="py-[40px] text-center text-[14px] text-gray-500">
          Không có bài tập nào phù hợp.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-sm">
            <thead>
              <tr className="border-b border-[#DEDEDE] text-left text-gray-600">
                <th className="py-4 px-5 font-semibold w-[60px]">#</th>
                <th className="py-4 px-5 font-semibold">Tên bài tập</th>
                <th className="py-4 px-5 font-semibold text-center">Độ khó</th>
                <th className="py-4 px-5 font-semibold text-center">Time (ms)</th>
                <th className="py-4 px-5 font-semibold text-center">Memory (MB)</th>
                <th className="py-4 px-5 font-semibold">Danh mục</th>
              </tr>
            </thead>

            <tbody>
              {problems.map((problem, index) => (
                <tr
                  key={problem.id}
                  className="border-b border-[#EEEEEE] hover:bg-[#FFF5EE] transition-colors"
                >
                  <td className="py-5 px-5 text-gray-700">
                    {(pagination.page - 1) * pagination.pageSize + index + 1}
                  </td>

                  <td className="py-5 px-5">
                    <Link
                      href={`/problem/${problem.id}`}
                      className="text-gray-800 hover:text-oj-orange font-medium transition-colors"
                    >
                      {problem.title}
                    </Link>
                  </td>

                  <td className="py-5 px-5 text-center">
                    <span className="bg-oj-orange text-white text-xs px-3 py-1 rounded-md font-medium">
                      {getDifficultyLabel(problem.difficulty)}
                    </span>
                  </td>

                  <td className="py-5 px-5 text-center text-gray-700">
                    {problem.timeLimit ?? "—"}
                  </td>

                  <td className="py-5 px-5 text-center text-gray-700">
                    {problem.memoryLimit ?? "—"}
                  </td>

                  <td className="py-5 px-5">
                    <div className="flex flex-wrap gap-2">
                      {(problem.categories ?? []).length > 0 ? (
                        problem.categories!.map((catId) => (
                          <span
                            key={catId}
                            className="bg-gray-100 border border-gray-200 text-gray-600 text-xs px-3 py-1 rounded-md"
                          >
                            {categoryMap.get(catId) ?? catId}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={pagination} basePath="/problem" />
    </>
  );
}
