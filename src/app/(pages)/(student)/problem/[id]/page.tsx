"use client";

import { fetchProblemById } from "@/lib/api/problem-api";
import type { Problem } from "@/lib/api/problem-types";
import { getDifficultyLabel } from "@/lib/problem/difficulty";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CodeSubmitPanel } from "./CodeSubmitPanel";

export default function ProblemDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchProblemById(id)
      .then(setProblem)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Không tải được bài tập"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="container pt-[100px] pb-[40px]">
      <Link
        href="/problem"
        className="text-[14px] text-oj-orange hover:underline mb-[16px] inline-block"
      >
        ← Quay lại danh sách
      </Link>

      {loading && (
        <p className="text-gray-500 text-center py-[40px]">Đang tải...</p>
      )}
      {error && (
        <p className="text-red-600 text-center py-[40px]" role="alert">
          {error}
        </p>
      )}

      {problem && (
        <div className="flex flex-col gap-[20px]">
          {/* Đề bài */}
          <div className="bg-oj-white px-[24px] py-[24px] rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <h1 className="text-[22px] font-[600] text-black mb-[12px]" dangerouslySetInnerHTML={{ __html: problem.title }}>
            </h1>
            <div className="flex flex-wrap items-center gap-[12px] mb-[20px]">
              <span className="bg-oj-orange text-white text-xs px-3 py-1 rounded-md">
                {getDifficultyLabel(problem.difficulty)}
              </span>
              <span className="text-[14px] text-gray-600">
                Time limit: {problem.timeLimit} ms · Memory: {problem.memoryLimit}{" "}
                MB
              </span>
            </div>

            <section>
              <h2 className="text-[16px] font-[600] mb-[8px]">Mô tả</h2>
              <p className="text-[14px] text-gray-800 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: problem.description ?? "" }}>
              </p>
            </section>

            {problem.inputDescription && (
              <section className="mt-[20px]">
                <h2 className="text-[16px] font-[600] mb-[8px]">Input</h2>
                <div className="text-[14px] text-gray-800 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: problem.inputDescription ?? "" }}>
                </div>
              </section>
            )}

            {problem.outputDescription && (
              <section className="mt-[20px]">
                <h2 className="text-[16px] font-[600] mb-[8px]">Output</h2>
                <div className="text-[14px] text-gray-800 whitespace-pre-wrap"dangerouslySetInnerHTML={{ __html: problem.outputDescription ?? "" }}>
                </div>
              </section>
            )}

            {problem.sampleTestcase && (
              <section className="mt-[20px]">
                <h2 className="text-[16px] font-[600] mb-[8px]">Sample</h2>
                <pre className="bg-oj-gray rounded-[8px] p-[16px] text-[13px] overflow-x-auto">
                  {problem.sampleTestcase}
                </pre>
              </section>
            )}
          </div>

          <CodeSubmitPanel
            problemId={id}
            allowedLanguages={problem.allowedLanguage}
            timeLimit={problem.timeLimit}
            memoryLimit={problem.memoryLimit}
          />
        </div>
      )}
    </div>
  );
}
