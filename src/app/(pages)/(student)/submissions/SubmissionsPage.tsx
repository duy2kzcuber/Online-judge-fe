"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { SubmissionsList } from "./SubmissionsList";

const searchClass =
  "h-[38px] w-full max-w-[320px] border border-[#D1D5DB] rounded-[8px] px-[10px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange focus:outline-none";

function SubmissionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const titleParam = searchParams.get("title") ?? "";

  const [titleInput, setTitleInput] = useState(titleParam);

  useEffect(() => {
    setTitleInput(titleParam);
  }, [titleParam]);

  const pushFilters = useCallback(
    (nextPage = 1) => {
      const params = new URLSearchParams();
      if (titleInput.trim()) {
        params.set("title", titleInput.trim());
      }
      params.set("page", String(nextPage));
      router.push(`/submissions?${params.toString()}`);
    },
    [titleInput, router],
  );

  if (authLoading) {
    return (
      <div className="container pt-[100px] pb-[40px] text-center text-gray-500 text-[14px]">
        Đang tải...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container pt-[100px] pb-[40px]">
        <div className="rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[24px] py-[32px] text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <h1 className="text-[20px] font-[700] text-black mb-[8px]">
            Các bài tập đã nộp
          </h1>
          <p className="text-[14px] text-gray-600 mb-[16px]">
            Vui lòng đăng nhập để xem lại các bài nộp của bạn.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-[8px] bg-oj-orange px-[20px] py-[10px] text-[14px] text-white hover:opacity-90 transition-opacity"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container pt-[100px] pb-[40px]">
      <div className="mb-[24px]">
        <h1 className="text-[24px] font-[700] text-black mb-[8px]">
          Các bài tập đã nộp
        </h1>
        <p className="text-[14px] text-gray-600">
          Xem lại lịch sử nộp bài và kết quả chấm của bạn.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-[12px] mb-[20px]">
        <input
          type="search"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") pushFilters(1);
          }}
          placeholder="Tìm theo tên bài tập..."
          className={searchClass}
        />
        <button
          type="button"
          onClick={() => pushFilters(1)}
          className="h-[38px] rounded-[8px] bg-oj-orange px-[16px] text-[14px] text-white hover:opacity-90 transition-opacity"
        >
          Lọc
        </button>
        {titleParam && (
          <button
            type="button"
            onClick={() => {
              setTitleInput("");
              router.push("/submissions?page=1");
            }}
            className="h-[38px] rounded-[8px] border border-[#D1D5DB] px-[16px] text-[14px] text-gray-700 hover:border-oj-orange hover:text-oj-orange transition-colors"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      <SubmissionsList page={page} title={titleParam} />
    </div>
  );
}

export function SubmissionsPage() {
  return (
    <Suspense
      fallback={
        <div className="container pt-[100px] pb-[40px] text-center text-gray-500">
          Đang tải...
        </div>
      }
    >
      <SubmissionsPageContent />
    </Suspense>
  );
}
