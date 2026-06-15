"use client";

import {
  Pagination,
  type PaginationData,
} from "@/app/components/Pagination/Pagination";
import { fetchPublicContests } from "@/lib/api/contest-api";
import type { Contest } from "@/lib/api/contest-types";
import { getSpringPageMeta } from "@/lib/api/problem-types";
import {
  getContestStatusClass,
  getContestStatusLabel,
  resolveContestStatus,
  type ContestStatus,
} from "@/lib/contest/status";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

const searchClass =
  "h-[38px] w-full max-w-[320px] border border-[#D1D5DB] rounded-[8px] px-[10px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange focus:outline-none";

const selectClass =
  "h-[38px] min-w-[160px] border border-[#D1D5DB] rounded-[8px] px-[10px] text-[14px] bg-oj-white hover:border-oj-orange focus:border-oj-orange focus:outline-none";

type ContestListProps = {
  page: number;
  keyword: string;
  statusFilter: ContestStatus | "";
};

export function ContestList({ page, keyword, statusFilter }: ContestListProps) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPublicContests(page - 1, PAGE_SIZE);
        if (cancelled) return;

        setContests(data.content ?? []);
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
              : "Không thể tải danh sách kì thi",
          );
          setContests([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
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
        const status = resolveContestStatus(contest);
        if (status !== statusFilter) return false;
      }
      return true;
    });
  }, [contests, keyword, statusFilter]);

  if (loading) {
    return (
      <p className="text-center text-gray-500 py-[40px] text-[14px]">
        Đang tải danh sách kì thi...
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

  if (contests.length === 0) {
    return (
      <div className="text-center py-[48px] text-[14px] text-gray-600">
        Chưa có kì thi công khai nào.
      </div>
    );
  }

  if (filteredContests.length === 0) {
    return (
      <div className="text-center py-[48px] text-[14px] text-gray-600">
        Không tìm thấy kì thi phù hợp với bộ lọc.
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-[8px] border border-[#DEDEDE] bg-oj-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <table className="w-full min-w-[720px] text-[14px]">
          <thead>
            <tr className="border-b border-[#DEDEDE] bg-[#FAFAFA] text-left text-gray-600">
              <th className="py-[12px] px-[12px] font-[600] w-[70px]">ID</th>
              <th className="py-[12px] px-[12px] font-[600]">Tên kì thi</th>
              <th className="py-[12px] px-[12px] font-[600] w-[120px]">Trạng thái</th>
              <th className="py-[12px] px-[12px] font-[600] w-[170px]">Bắt đầu</th>
              <th className="py-[12px] px-[12px] font-[600] w-[170px]">Kết thúc</th>
              <th className="py-[12px] px-[12px] font-[600] w-[100px]">Mật khẩu</th>
              <th className="py-[12px] px-[12px] font-[600] w-[110px]" />
            </tr>
          </thead>
          <tbody>
            {filteredContests.map((contest) => {
              const status = resolveContestStatus(contest);
              return (
                <tr
                  key={contest.id}
                  className="border-b border-[#EEEEEE] hover:bg-[#FFFAF7] transition-colors"
                >
                  <td className="py-[12px] px-[12px]">{contest.id}</td>
                  <td className="py-[12px] px-[12px]">
                    <span className="line-clamp-2 font-[500] text-black">
                      {contest.title}
                    </span>
                  </td>
                  <td className="py-[12px] px-[12px]">
                    <span
                      className={`inline-block rounded-[6px] px-[8px] py-[4px] text-[12px] font-[600] ${getContestStatusClass(status)}`}
                    >
                      {getContestStatusLabel(status)}
                    </span>
                  </td>
                  <td className="py-[12px] px-[12px] text-gray-700">
                    {formatDateTime(contest.startTime)}
                  </td>
                  <td className="py-[12px] px-[12px] text-gray-700">
                    {formatDateTime(contest.endTime)}
                  </td>
                  <td className="py-[12px] px-[12px] text-gray-700">
                    {contest.passwordProtected ? "Có" : "Không"}
                  </td>
                  <td className="py-[12px] px-[12px]">
                    <Link
                      href={`/ki-thi/${contest.id}`}
                      className="inline-flex items-center justify-center rounded-[6px] border border-oj-orange px-[12px] py-[6px] text-[13px] text-oj-orange hover:bg-[#FFF5EE] transition-colors"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination pagination={pagination} basePath="/ki-thi" />
    </div>
  );
}

export { searchClass, selectClass };
