"use client";

import { Button } from "@/app/components/button/Button";
import { useAuth } from "@/contexts/AuthContext";
import { createSubmission } from "@/lib/api/submission-api";
import type { Submission } from "@/lib/api/submission-types";
import {
  getCodeTemplate,
  getLanguageLabel,
  getSourceFileName,
  normalizeLanguages,
} from "@/lib/submission/language";
import dynamic from "next/dynamic";
import { getResultLabel, RESULT_STYLES } from "@/lib/submission/result";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const MonacoCodeEditor = dynamic(
  () =>
    import("./MonacoCodeEditor").then((mod) => mod.MonacoCodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[360px] items-center justify-center bg-[#1e1e1e] text-[14px] text-gray-400">
        Đang tải trình soạn thảo...
      </div>
    ),
  },
);

interface CodeSubmitPanelProps {
  problemId: string;
  allowedLanguages?: string[] | null;
  timeLimit?: number;
  memoryLimit?: number;
}

export function CodeSubmitPanel({
  problemId,
  allowedLanguages,
  timeLimit,
  memoryLimit,
}: CodeSubmitPanelProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const languages = useMemo(
    () => normalizeLanguages(allowedLanguages),
    [allowedLanguages],
  );

  const [language, setLanguage] = useState(languages[0]);
  const [code, setCode] = useState(() => getCodeTemplate(languages[0]));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Submission | null>(null);

  useEffect(() => {
    if (!languages.includes(language)) {
      setLanguage(languages[0]);
      setCode(getCodeTemplate(languages[0]));
    }
  }, [languages, language]);

  const handleLanguageChange = (next: string) => {
    setLanguage(next);
    setCode(getCodeTemplate(next));
    setResult(null);
    setError(null);
  };

  const handleSubmit = useCallback(async () => {
    if (!code.trim()) {
      setError("Vui lòng nhập mã nguồn trước khi nộp bài");
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const submission = await createSubmission({
        problemId,
        language,
        solution: code,
      });
      setResult(submission);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nộp bài thất bại");
    } finally {
      setSubmitting(false);
    }
  }, [code, language, problemId]);

  if (authLoading) {
    return (
      <div className="rounded-[8px] border border-[#DEDEDE] bg-oj-white p-[20px] text-[14px] text-gray-500">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-[8px] border border-[#DEDEDE] bg-oj-white p-[24px] text-center min-h-[320px] flex flex-col items-center justify-center">
        <p className="text-[14px] text-gray-700 mb-[16px]">
          Bạn cần đăng nhập để nộp bài và chạy thử với bộ test.
        </p>
        <Link
          href="/login"
          className="inline-block border-[0.8px] border-oj-orange rounded-[20px] px-[20px] py-[8px] text-[14px] text-oj-orange hover:bg-[#FFF5EE] transition-colors"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  const resultStyle = result?.result ? RESULT_STYLES[result.result] : null;

  return (
    <div className="flex flex-col h-full min-h-[480px] rounded-[8px] border border-[#DEDEDE] bg-oj-white overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-[12px] px-[16px] py-[12px] border-b border-[#DEDEDE] bg-[#FAFAFA]">
        <h2 className="text-[16px] font-[600] text-black">Nộp bài</h2>
        <div>
          {timeLimit != null && (
            <span className="text-[12px] text-gray-500">Time: {timeLimit} ms</span>
          )}
          {memoryLimit != null && (
            <span className="text-[12px] text-gray-500 ml-[8px]">
              Memory: {memoryLimit} MB
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-[10px] px-[16px] py-[10px] border-b border-[#EEEEEE]">
        <label htmlFor="language" className="text-[13px] font-[500] text-gray-700">
          Ngôn ngữ:
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          disabled={submitting}
          className="h-[36px] rounded-[8px] border border-[#DEDEDE] px-[10px] text-[13px] bg-white hover:border-oj-orange focus:border-oj-orange transition-colors disabled:opacity-60"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {getLanguageLabel(lang)}
            </option>
          ))}
        </select>
        <span className="text-[12px] text-gray-400">
          File: {getSourceFileName(language)}
        </span>
      </div>

      <MonacoCodeEditor
        key={language}
        value={code}
        onChange={(next) => {
          setCode(next);
          setError(null);
        }}
        language={language}
        readOnly={submitting}
        height="400px"
      />

      <div>
        {error && (
          <p
            role="alert"
            className="mx-[16px] mt-[12px] rounded-[6px] border border-red-200 bg-red-50 px-[12px] py-[10px] text-[13px] text-red-600"
          >
            {error}
          </p>
        )}

        {result && resultStyle && (
          <div
            className={`mx-[16px] mt-[12px] rounded-[6px] border px-[14px] py-[12px] ${resultStyle.border} ${resultStyle.bg}`}
          >
            <div className="flex flex-wrap items-center gap-[10px] mb-[8px]">
              <span
                className={`text-xs font-[600] px-3 py-1 rounded-md ${resultStyle.badge}`}
              >
                {getResultLabel(result.result)}
              </span>
              {result.score != null && (
                <span className="text-[13px] text-gray-700">
                  Điểm: <strong>{result.score}</strong>
                </span>
              )}
              {result.timeUsed != null && (
                <span className="text-[13px] text-gray-700">
                  Thời gian: <strong>{result.timeUsed.toFixed(3)}s</strong>
                </span>
              )}
              {result.memoryUsed != null && (
                <span className="text-[13px] text-gray-700">
                  Bộ nhớ: <strong>{result.memoryUsed} KB</strong>
                </span>
              )}
            </div>
            {result.judgeMessage && (
              <pre className="text-[12px] text-gray-700 whitespace-pre-wrap break-words font-mono mt-[6px] max-h-[120px] overflow-y-auto">
                {result.judgeMessage}
              </pre>
            )}
          </div>
        )}

        <div className="flex justify-end gap-[10px] px-[16px] py-[14px] border-t border-[#DEDEDE]">
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              setCode(getCodeTemplate(language));
              setResult(null);
              setError(null);
            }}
            className="h-[40px] px-[16px] rounded-[6px] border border-[#DEDEDE] text-[14px] text-gray-700 hover:border-oj-orange hover:text-oj-orange transition-colors disabled:opacity-50"
          >
            Reset code
          </button>
          <Button
            displayContent={submitting ? "Đang chấm bài..." : "Nộp bài"}
            onButtonClick={handleSubmit}
            disabled={submitting}
            className="!h-[40px] min-w-[120px] disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
