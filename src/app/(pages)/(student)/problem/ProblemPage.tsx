"use client";

import { Button } from "@/app/components/button/Button";
import { fetchCategories } from "@/lib/api/problem-api";
import type { Category } from "@/lib/api/problem-types";
import { DIFFICULTY_OPTIONS } from "@/lib/problem/difficulty";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ProblemList } from "./ProblemList";

const selectClass =
  "h-[40px] min-w-[140px] rounded-[10px] border border-[#DEDEDE] px-[12px] text-[14px] text-black bg-oj-white hover:border-oj-orange focus:border-oj-orange transition-colors";

const inputClass =
  "h-[40px] min-w-[200px] rounded-[10px] border border-[#DEDEDE] px-[14px] text-[14px] text-black placeholder:text-gray-400 hover:border-oj-orange focus:border-oj-orange transition-colors";

function ProblemPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const titleParam = searchParams.get("title") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const difficultyParam = parseInt(searchParams.get("difficulty") ?? "0", 10) || 0;

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
      router.push(`/problem?${params.toString()}`);
    },
    [router, titleInput, categoryInput, difficultyInput],
  );

  const handleSearch = () => pushFilters(1);

  const handleReload = () => {
    setTitleInput("");
    setCategoryInput("");
    setDifficultyInput(0);
    router.push("/problem?page=1");
  };

  return (
    <div className="container pt-[100px] pb-[40px]">
      <div className="bg-oj-white px-[20px] py-[20px] rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-[16px] lg:flex-row lg:items-center lg:justify-between">
          <h1 className="uppercase font-[600] text-[18px] md:text-[20px] text-black">
            Danh sách bài tập
          </h1>

          <div className="flex flex-wrap items-center gap-[12px]">
            <select
              name="category"
              id="category"
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
              name="level"
              id="level"
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
              placeholder="Nhập từ khóa tìm kiếm"
            />

            <Button displayContent="Tìm kiếm" onButtonClick={handleSearch} />
            <Button
              displayContent="Tải lại"
              className="!bg-white !text-oj-orange border border-oj-orange hover:!bg-[#FFF5EE]"
              onButtonClick={handleReload}
            />
          </div>
        </div>

        <ProblemList
          page={page}
          title={titleParam}
          category={categoryParam}
          difficulty={difficultyParam}
          categories={categories}
        />
      </div>
    </div>
  );
}

export function ProblemPage() {
  return (
    <Suspense
      fallback={
        <div className="container pt-[100px] pb-[40px] text-center text-gray-500">
          Đang tải...
        </div>
      }
    >
      <ProblemPageContent />
    </Suspense>
  );
}
