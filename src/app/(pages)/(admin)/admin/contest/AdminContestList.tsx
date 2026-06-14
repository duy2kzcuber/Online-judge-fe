"use client";

import {
  Pagination,
  type PaginationData,
} from "@/app/components/Pagination/Pagination";
import { fetchContests } from "@/lib/api/contest-api";
import type { Contest } from "@/lib/api/contest-types";
import {
  getContestStatus,
  getContestStatusClass,
  getContestStatusLabel,
  type ContestStatus,
} from "@/lib/contest/status";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

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

function formatCreator(contest: Contest): string {
  if (!contest.createdBy) return "—";
  return contest.createdBy.fullName?.trim() || contest.createdBy.username;
}

type AdminContestListProps = {
  page: number;
  keyword: string;
  statusFilter: ContestStatus | "";
  visibleFilter: "" | "visible" | "hidden";
};

export function AdminContestList({
  page,
  keyword,
  statusFilter,
  visibleFilter,
}: AdminContestListProps) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchContests(page - 1, PAGE_SIZE);
        if (cancelled) return;

        setContests(data.content ?? []);
        setPagination({
          page,
          pageSize: data.size ?? PAGE_SIZE,
          totalPages: Math.max(1, data.totalPages ?? 1),
          totalItems: data.totalElements ?? 0,
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách kì thi",
          );
          setContests([]);
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
  }, [page]);

  const filteredContests = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return contests.filter((contest) => {
      if (q) {
        const matchTitle = contest.title.toLowerCase().includes(q);
        const matchId = String(contest.id).includes(q);
        if (!matchTitle && !matchId) return false;
      }

      if (statusFilter) {
        const status = getContestStatus(contest.startTime, contest.endTime);
        if (status !== statusFilter) return false;
      }

      if (visibleFilter === "visible" && !contest.visible) return false;
      if (visibleFilter === "hidden" && contest.visible) return false;

      return true;
    });
  }, [contests, keyword, statusFilter, visibleFilter]);

  if (loading) {
    return (
      <p className="py-[40px] text-center text-[14px] text-[#6B7280]">
        Đang tải...
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

  if (contests.length === 0) {
    return (
      <p className="py-[40px] text-center text-[14px] text-[#6B7280]">
        Chưa có kì thi nào.{" "}
        <Link href="/admin/contest/create" className="text-oj-orange hover:underline">
          Tạo kì thi đầu tiên
        </Link>
      </p>
    );
  }

  if (filteredContests.length === 0) {
    return (
      <p className="py-[40px] text-center text-[14px] text-[#6B7280]">
        Không có kì thi nào phù hợp với bộ lọc trên trang hiện tại.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-auto">
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="border-b text-left text-[#6B7280]">
              <th className="py-[12px] px-[8px] w-[40px]" />
              <th className="py-[12px] px-[8px]">ID</th>
              <th className="py-[12px] px-[8px]">Tiêu đề</th>
              <th className="py-[12px] px-[8px]">Trạng thái</th>
              <th className="py-[12px] px-[8px]">Bắt đầu</th>
              <th className="py-[12px] px-[8px]">Kết thúc</th>
              <th className="py-[12px] px-[8px]">Số bài</th>
              <th className="py-[12px] px-[8px]">Mật khẩu</th>
              <th className="py-[12px] px-[8px]">Hiển thị</th>
              <th className="py-[12px] px-[8px]">Người tạo</th>
              <th className="py-[12px] px-[8px] w-[100px] text-right">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredContests.map((contest) => {
              const status = getContestStatus(contest.startTime, contest.endTime);
              const isExpanded = expandedId === contest.id;
              const problems = [...(contest.problems ?? [])].sort(
                (a, b) => a.sortIndex - b.sortIndex,
              );

              return (
                <Fragment key={contest.id}>
                  <tr
                    className="border-b hover:bg-[#FAFAFA] cursor-pointer"
                    onClick={() =>
                      setExpandedId((prev) =>
                        prev === contest.id ? null : contest.id,
                      )
                    }
                  >
                    <td className="py-[12px] px-[8px] text-[#9CA3AF]">
                      {isExpanded ? (
                        <MdKeyboardArrowUp className="text-[20px]" />
                      ) : (
                        <MdKeyboardArrowDown className="text-[20px]" />
                      )}
                    </td>
                    <td className="py-[12px] px-[8px]">{contest.id}</td>
                    <td className="py-[12px] px-[8px] font-[500] max-w-[240px]">
                      <span className="line-clamp-2">{contest.title}</span>
                    </td>
                    <td className="py-[12px] px-[8px]">
                      <span
                        className={`inline-block text-[12px] px-[8px] py-[3px] rounded-[6px] whitespace-nowrap ${getContestStatusClass(status)}`}
                      >
                        {getContestStatusLabel(status)}
                      </span>
                    </td>
                    <td className="py-[12px] px-[8px] whitespace-nowrap">
                      {formatDateTime(contest.startTime)}
                    </td>
                    <td className="py-[12px] px-[8px] whitespace-nowrap">
                      {formatDateTime(contest.endTime)}
                    </td>
                    <td className="py-[12px] px-[8px] text-center">
                      {problems.length}
                    </td>
                    <td className="py-[12px] px-[8px]">
                      {contest.passwordProtected ? "Có" : "Không"}
                    </td>
                    <td className="py-[12px] px-[8px]">
                      <span
                        className={`inline-block text-[12px] px-[8px] py-[3px] rounded-[6px] ${
                          contest.visible
                            ? "bg-[#FFF7ED] text-oj-orange"
                            : "bg-[#F3F4F6] text-[#6B7280]"
                        }`}
                      >
                        {contest.visible ? "Hiển thị" : "Ẩn"}
                      </span>
                    </td>
                    <td className="py-[12px] px-[8px] whitespace-nowrap">
                      {formatCreator(contest)}
                    </td>
                    <td className="py-[12px] px-[8px]">
                      <div className="flex justify-end gap-[8px]">
                        <Link
                          href={`/admin/contest/${contest.id}/participants`}
                          onClick={(e) => e.stopPropagation()}
                          className="border border-[#D1D5DB] rounded-[6px] px-[8px] py-[5px] text-[13px] hover:border-oj-orange hover:text-oj-orange"
                        >
                          Thí sinh
                        </Link>
                        <Link
                          href={`/admin/contest/${contest.id}/edit`}
                          onClick={(e) => e.stopPropagation()}
                          className="border border-[#D1D5DB] rounded-[6px] px-[8px] py-[5px] text-[13px] hover:border-oj-orange hover:text-oj-orange"
                        >
                          Sửa
                        </Link>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b bg-[#FAFAFA]">
                      <td colSpan={11} className="px-[16px] py-[14px]">
                        <div className="grid gap-[12px] md:grid-cols-2">
                          <div>
                            <h4 className="text-[13px] font-[600] text-[#374151] mb-[6px]">
                              Mô tả
                            </h4>
                            <p className="text-[14px] text-[#4B5563] whitespace-pre-wrap">
                              {contest.description || "—"}
                            </p>
                            <div className="mt-[10px] text-[13px] text-[#6B7280] space-y-[4px]">
                              <p>
                                Tạo lúc: {formatDateTime(contest.createTime)}
                              </p>
                              {contest.lastUpdateTime && (
                                <p>
                                  Cập nhật:{" "}
                                  {formatDateTime(contest.lastUpdateTime)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-[13px] font-[600] text-[#374151] mb-[6px]">
                              Danh sách bài tập ({problems.length})
                            </h4>
                            {problems.length === 0 ? (
                              <p className="text-[14px] text-[#6B7280]">
                                Chưa có bài tập nào trong kì thi này.
                              </p>
                            ) : (
                              <ol className="list-decimal list-inside space-y-[4px] text-[14px] text-[#374151]">
                                {problems.map((problem) => (
                                  <li key={problem.problemId}>
                                    <Link
                                      href={`/admin/problems/create?edit=${problem.problemId}`}
                                      className="text-oj-orange hover:underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {problem.problemTitle ?? problem.problemId}
                                    </Link>
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination pagination={pagination} basePath="/admin/contest" />
    </>
  );
}
