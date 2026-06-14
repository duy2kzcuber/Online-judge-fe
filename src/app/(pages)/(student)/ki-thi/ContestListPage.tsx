"use client";

import { CONTEST_STATUS_OPTIONS } from "@/lib/contest/status";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ContestList, searchClass, selectClass } from "./ContestList";
import type { ContestStatus } from "@/lib/contest/status";

function ContestListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const keywordParam = searchParams.get("keyword") ?? "";
  const statusParam = (searchParams.get("status") ?? "") as ContestStatus | "";

  const [keywordInput, setKeywordInput] = useState(keywordParam);
  const [statusInput, setStatusInput] = useState<ContestStatus | "">(statusParam);

  useEffect(() => {
    setKeywordInput(keywordParam);
    setStatusInput(statusParam);
  }, [keywordParam, statusParam]);

  const pushFilters = useCallback(
    (nextPage = 1) => {
      const params = new URLSearchParams();
      if (keywordInput.trim()) params.set("keyword", keywordInput.trim());
      if (statusInput) params.set("status", statusInput);
      params.set("page", String(nextPage));
      router.push(`/ki-thi?${params.toString()}`);
    },
    [keywordInput, router, statusInput],
  );

  return (
    <div className="container pt-[100px] pb-[40px]">
      <div className="mb-[24px]">
        <h1 className="text-[24px] font-[700] text-black mb-[8px]">Kì thi</h1>
        <p className="text-[14px] text-gray-600">
          Danh sách các kì thi đang công khai trên hệ thống.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-[12px] mb-[20px]">
        <input
          type="search"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") pushFilters(1);
          }}
          placeholder="Tìm theo tên hoặc ID..."
          className={searchClass}
        />
        <select
          value={statusInput}
          onChange={(e) => setStatusInput(e.target.value as ContestStatus | "")}
          className={selectClass}
        >
          {CONTEST_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => pushFilters(1)}
          className="h-[38px] rounded-[8px] bg-oj-orange px-[16px] text-[14px] text-white hover:opacity-90 transition-opacity"
        >
          Lọc
        </button>
      </div>

      <ContestList
        page={page}
        keyword={keywordParam}
        statusFilter={statusParam}
      />
    </div>
  );
}

export function ContestListPage() {
  return (
    <Suspense
      fallback={
        <div className="container pt-[100px] pb-[40px] text-center text-gray-500">
          Đang tải...
        </div>
      }
    >
      <ContestListPageContent />
    </Suspense>
  );
}
