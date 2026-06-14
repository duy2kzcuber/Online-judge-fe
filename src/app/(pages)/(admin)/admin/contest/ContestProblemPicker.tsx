"use client";

import { fetchProblems } from "@/lib/api/problem-api";
import type { Problem } from "@/lib/api/problem-types";
import { useEffect, useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp, FaTimes } from "react-icons/fa";
import {
  contestInputClass,
  type SelectedContestProblem,
} from "./contest-form";

type ContestProblemPickerProps = {
  selectedProblems: SelectedContestProblem[];
  onChange: (problems: SelectedContestProblem[]) => void;
};

export function ContestProblemPicker({
  selectedProblems,
  onChange,
}: ContestProblemPickerProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [problemKeyword, setProblemKeyword] = useState("");
  const [loadingProblems, setLoadingProblems] = useState(true);

  useEffect(() => {
    fetchProblems({ page: 0, size: 200 })
      .then((data) => setProblems(data.content ?? []))
      .catch(() => setProblems([]))
      .finally(() => setLoadingProblems(false));
  }, []);

  const filteredProblems = useMemo(() => {
    const q = problemKeyword.trim().toLowerCase();
    if (!q) return problems;
    return problems.filter(
      (problem) =>
        problem.title.toLowerCase().includes(q) ||
        problem.id.toLowerCase().includes(q),
    );
  }, [problems, problemKeyword]);

  const selectedIds = useMemo(
    () => new Set(selectedProblems.map((item) => item.problemId)),
    [selectedProblems],
  );

  const toggleProblem = (problem: Problem) => {
    if (selectedIds.has(problem.id)) {
      onChange(
        selectedProblems.filter((item) => item.problemId !== problem.id),
      );
      return;
    }

    onChange([
      ...selectedProblems,
      { problemId: problem.id, title: problem.title },
    ]);
  };

  const moveProblem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= selectedProblems.length) return;

    const next = [...selectedProblems];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
  };

  return (
    <div className="border border-[#E5E7EB] rounded-[8px] p-[14px]">
      <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[12px]">
        <div>
          <h3 className="text-[15px] font-[600]">Bài tập trong kì thi</h3>
          <p className="text-[13px] text-[#6B7280] mt-[2px]">
            Chọn bài tập và sắp xếp thứ tự hiển thị
          </p>
        </div>
        <span className="text-[13px] text-[#6B7280]">
          Đã chọn: {selectedProblems.length}
        </span>
      </div>

      <input
        type="text"
        value={problemKeyword}
        onChange={(e) => setProblemKeyword(e.target.value)}
        placeholder="Tìm bài tập theo tiêu đề hoặc ID"
        className={`${contestInputClass} h-[40px] mb-[12px]`}
      />

      {loadingProblems ? (
        <p className="text-[14px] text-[#6B7280] py-[12px]">
          Đang tải danh sách bài tập...
        </p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-[14px]">
          <div className="border border-[#E5E7EB] rounded-[8px] max-h-[280px] overflow-y-auto">
            {filteredProblems.length === 0 ? (
              <p className="p-[12px] text-[14px] text-[#6B7280]">
                Không có bài tập phù hợp.
              </p>
            ) : (
              <ul>
                {filteredProblems.map((problem) => {
                  const checked = selectedIds.has(problem.id);
                  return (
                    <li
                      key={problem.id}
                      className="border-b border-[#F3F4F6] last:border-b-0"
                    >
                      <label className="flex items-start gap-[10px] p-[10px] cursor-pointer hover:bg-[#FAFAFA]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProblem(problem)}
                          className="mt-[3px] accent-oj-orange"
                        />
                        <span>
                          <span className="block text-[14px] font-[500]">
                            {problem.title}
                          </span>
                          <span className="block text-[12px] text-[#6B7280] font-mono">
                            {problem.id}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border border-[#E5E7EB] rounded-[8px] max-h-[280px] overflow-y-auto">
            {selectedProblems.length === 0 ? (
              <p className="p-[12px] text-[14px] text-[#6B7280]">
                Chưa chọn bài tập nào.
              </p>
            ) : (
              <ul>
                {selectedProblems.map((item, index) => (
                  <li
                    key={item.problemId}
                    className="flex items-center gap-[8px] border-b border-[#F3F4F6] last:border-b-0 p-[10px]"
                  >
                    <span className="w-[24px] text-center text-[13px] text-[#6B7280]">
                      {index + 1}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[14px] font-[500] truncate">
                        {item.title}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => moveProblem(index, -1)}
                      disabled={index === 0}
                      className="h-[30px] w-[30px] border border-[#D1D5DB] rounded-[6px] flex items-center justify-center disabled:opacity-40 hover:border-oj-orange hover:text-oj-orange"
                      aria-label="Di chuyển lên"
                    >
                      <FaArrowUp className="text-[12px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveProblem(index, 1)}
                      disabled={index === selectedProblems.length - 1}
                      className="h-[30px] w-[30px] border border-[#D1D5DB] rounded-[6px] flex items-center justify-center disabled:opacity-40 hover:border-oj-orange hover:text-oj-orange"
                      aria-label="Di chuyển xuống"
                    >
                      <FaArrowDown className="text-[12px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange(
                          selectedProblems.filter(
                            (problem) => problem.problemId !== item.problemId,
                          ),
                        )
                      }
                      className="h-[30px] w-[30px] border border-[#FECACA] rounded-[6px] flex items-center justify-center text-red-500 hover:bg-[#FEF2F2]"
                      aria-label="Xóa khỏi kì thi"
                    >
                      <FaTimes className="text-[12px]" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
