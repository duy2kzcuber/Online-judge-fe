"use client";

import { Button } from "@/app/components/button/Button";
import { fetchCategories } from "@/lib/api/problem-api";
import type { Category } from "@/lib/api/problem-types";
import { DIFFICULTY_OPTIONS } from "@/lib/problem/difficulty";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { AdminProblemList } from "./AdminProblemList";

const selectClass =
  "h-[38px] min-w-[130px] border border-[#D1D5DB] rounded-[8px] px-[10px] text-[14px] bg-oj-white hover:border-oj-orange focus:border-oj-orange";

const inputClass =
  "h-[38px] min-w-[200px] border border-[#D1D5DB] rounded-[8px] px-[10px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange";

function AdminProblemsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const titleParam = searchParams.get("title") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const difficultyParam =
    parseInt(searchParams.get("difficulty") ?? "0", 10) || 0;

  const [titleInput, setTitleInput] = useState(titleParam);
  const [categoryInput, setCategoryInput] = useState(categoryParam);
  const [difficultyInput, setDifficultyInput] = useState(difficultyParam);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setTitleInput(titleParam);
    setCategoryInput(categoryParam);
    setDifficultyInput(difficultyParam);
  }, [titleParam, categoryParam, difficultyParam]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const pushFilters = useCallback(
    (nextPage = 1) => {
      const params = new URLSearchParams();
      if (titleInput.trim()) params.set("title", titleInput.trim());
      if (categoryInput) params.set("category", categoryInput);
      if (difficultyInput > 0) params.set("difficulty", String(difficultyInput));
      params.set("page", String(nextPage));
      router.push(`/admin/problems?${params.toString()}`);
    },
    [router, titleInput, categoryInput, difficultyInput],
  );

  const handleSearch = () => pushFilters(1);

  const handleReload = () => {
    setTitleInput("");
    setCategoryInput("");
    setDifficultyInput(0);
    router.push("/admin/problems?page=1");
  };

  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[14px]">
        <div>
          <h2 className="text-[18px] font-[600]">Danh sách bài tập</h2>
          <p className="text-[13px] text-[#6B7280] mt-[4px]">
            Quản lý, tìm kiếm và chỉnh sửa bài tập trên hệ thống
          </p>
        </div>
        <Link
          href="/admin/problems/create"
          className="bg-oj-orange text-oj-white rounded-[8px] px-[14px] py-[9px] text-[14px] font-[500] hover:bg-[#F5965B]"
        >
          Tạo bài tập
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-[10px] mb-[14px]">
        <select
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          className={selectClass}
        >
          <option value="">Danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>

        <select
          value={difficultyInput}
          onChange={(e) => setDifficultyInput(Number(e.target.value))}
          className={selectClass}
        >
          {DIFFICULTY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className={inputClass}
          placeholder="Tìm theo tiêu đề"
        />

        <Button displayContent="Tìm kiếm" onButtonClick={handleSearch} />
        <button
          type="button"
          onClick={handleReload}
          className="h-[38px] px-[12px] border border-oj-orange text-oj-orange rounded-[8px] text-[14px] hover:bg-[#FFF5EE]"
        >
          Tải lại
        </button>
      </div>

      <AdminProblemList
        page={page}
        title={titleParam}
        category={categoryParam}
        difficulty={difficultyParam}
        categories={categories}
      />
    </section>
  );
}

export function AdminProblemsPage() {
  return (
    <Suspense
      fallback={
        <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[40px] text-center text-[#6B7280]">
          Đang tải...
        </section>
      }
    >
      <AdminProblemsPageContent />
    </Suspense>
  );
}
