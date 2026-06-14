"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  CONTEST_STATUS_OPTIONS,
  CONTEST_VISIBLE_OPTIONS,
  type ContestStatus,
} from "@/lib/contest/status";
import { AdminContestList } from "./AdminContestList";

const searchClass =
  "h-[38px] w-full max-w-[280px] border border-[#D1D5DB] rounded-[8px] px-[10px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange focus:outline-none";

const selectClass =
  "h-[38px] min-w-[160px] border border-[#D1D5DB] rounded-[8px] px-[10px] text-[14px] bg-oj-white hover:border-oj-orange focus:border-oj-orange focus:outline-none";

function AdminContestListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const keywordParam = searchParams.get("keyword") ?? "";
  const statusParam = (searchParams.get("status") ?? "") as ContestStatus | "";
  const visibleParam = (searchParams.get("visible") ?? "") as
    | ""
    | "visible"
    | "hidden";

  const [keywordInput, setKeywordInput] = useState(keywordParam);
  const [statusInput, setStatusInput] = useState<ContestStatus | "">(statusParam);
  const [visibleInput, setVisibleInput] = useState<"" | "visible" | "hidden">(
    visibleParam,
  );

  useEffect(() => {
    setKeywordInput(keywordParam);
    setStatusInput(statusParam);
    setVisibleInput(visibleParam);
  }, [keywordParam, statusParam, visibleParam]);

  const pushFilters = useCallback(
    (nextPage = 1) => {
      const params = new URLSearchParams();
      if (keywordInput.trim()) params.set("keyword", keywordInput.trim());
      if (statusInput) params.set("status", statusInput);
      if (visibleInput) params.set("visible", visibleInput);
      params.set("page", String(nextPage));
      router.push(`/admin/contest?${params.toString()}`);
    },
    [router, keywordInput, statusInput, visibleInput],
  );

  const handleSearch = () => pushFilters(1);

  const handleReset = () => {
    setKeywordInput("");
    setStatusInput("");
    setVisibleInput("");
    router.push("/admin/contest?page=1");
  };

  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[14px]">
        <div>
          <h2 className="text-[18px] font-[600]">Danh sách kì thi</h2>
          <p className="text-[13px] text-[#6B7280] mt-[4px]">
            Quản lý, tìm kiếm và xem chi tiết các kì thi
          </p>
        </div>
        <Link
          href="/admin/contest/create"
          className="bg-oj-orange text-oj-white rounded-[8px] px-[14px] py-[9px] text-[14px] font-[500] hover:bg-[#F5965B]"
        >
          + Tạo kì thi
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-[8px] mb-[14px]">
        <input
          type="text"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className={searchClass}
          placeholder="Tìm theo tiêu đề hoặc ID"
        />

        <select
          value={statusInput}
          onChange={(e) =>
            setStatusInput(e.target.value as ContestStatus | "")
          }
          className={selectClass}
        >
          {CONTEST_STATUS_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={visibleInput}
          onChange={(e) =>
            setVisibleInput(e.target.value as "" | "visible" | "hidden")
          }
          className={selectClass}
        >
          {CONTEST_VISIBLE_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleSearch}
          className="h-[38px] px-[14px] bg-oj-orange text-oj-white rounded-[8px] text-[14px] hover:bg-[#F5965B]"
        >
          Tìm kiếm
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="h-[38px] px-[12px] border border-oj-orange text-oj-orange rounded-[8px] text-[14px] hover:bg-[#FFF5EE]"
        >
          Tải lại
        </button>
      </div>

      <AdminContestList
        page={page}
        keyword={keywordParam}
        statusFilter={statusParam}
        visibleFilter={visibleParam}
      />
    </section>
  );
}

export function AdminContestListPage() {
  return (
    <Suspense
      fallback={
        <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[40px] text-center text-[#6B7280]">
          Đang tải...
        </section>
      }
    >
      <AdminContestListPageContent />
    </Suspense>
  );
}
