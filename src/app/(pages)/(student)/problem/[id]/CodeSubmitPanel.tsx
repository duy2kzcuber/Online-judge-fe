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
import {
  FEEDBACK_BANNER_STYLES,
  getResultLabel,
  getSubmitFeedback,
  resolveResultStyle,
} from "@/lib/submission/result";
import Link from "next/link";
import { getContestPassword } from "@/lib/contest/access";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  contestId?: number;
}

export function CodeSubmitPanel({
  problemId,
  allowedLanguages,
  timeLimit,
  memoryLimit,
  contestId,
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
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

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
    setApiMessage(null);
  };

  useEffect(() => {
    if ((result || error) && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [result, error]);

  const handleSubmit = useCallback(async () => {
    if (!code.trim()) {
      setError("Vui lòng nhập mã nguồn trước khi nộp bài");
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);
    setApiMessage(null);

    try {
      const contestPassword =
        contestId != null ? getContestPassword(contestId) ?? undefined : undefined;

      const { submission, message } = await createSubmission({
        problemId,
        language,
        solution: code,
        ...(contestId != null
          ? { contestId, contestPassword }
          : {}),
      });
      setResult(submission);
      setApiMessage(message ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nộp bài thất bại");
    } finally {
      setSubmitting(false);
    }
  }, [code, contestId, language, problemId]);

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

  const resultStyle = resolveResultStyle(result?.result);
  const submitFeedback = result ? getSubmitFeedback(result.result) : null;
  const bannerStyle = error
    ? FEEDBACK_BANNER_STYLES.error
    : submitFeedback
      ? FEEDBACK_BANNER_STYLES[submitFeedback.tone]
      : null;

  return (
    <div className="flex flex-col h-full min-h-[480px] rounded-[8px] border border-[#DEDEDE] bg-oj-white overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-[12px] px-[16px] py-[12px] border-b border-[#DEDEDE] bg-[#FAFAFA]">
        <h2 className="text-[16px] font-[600] text-black">Nộp bài</h2>
        <div className="flex flex-wrap items-center gap-[8px]">
          {contestId != null && (
            <span className="text-[12px] text-oj-orange bg-[#FFF5EE] px-[8px] py-[2px] rounded-[4px]">
              Kì thi #{contestId}
            </span>
          )}
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
          setApiMessage(null);
        }}
        language={language}
        readOnly={submitting}
        height="400px"
      />

      <div>
        {(error || result) && (
          <div ref={feedbackRef} className="mx-[16px] mt-[12px]" role="status" aria-live="polite">
            {error ? (
              <div
                className={`rounded-[8px] border-2 px-[16px] py-[14px] shadow-sm ${FEEDBACK_BANNER_STYLES.error.border} ${FEEDBACK_BANNER_STYLES.error.bg}`}
              >
                <p className={`text-[15px] font-[600] ${FEEDBACK_BANNER_STYLES.error.title}`}>
                  Nộp bài thất bại
                </p>
                <p className="text-[13px] text-red-700 mt-[4px]">{error}</p>
              </div>
            ) : submitFeedback && bannerStyle ? (
              <div
                className={`rounded-[8px] border-2 px-[16px] py-[14px] shadow-sm ${bannerStyle.border} ${bannerStyle.bg}`}
              >
                <p className={`text-[15px] font-[600] ${bannerStyle.title}`}>
                  {submitFeedback.title}
                </p>
                <p className={`text-[13px] mt-[4px] ${bannerStyle.title} opacity-90`}>
                  {apiMessage ?? submitFeedback.description}
                </p>
              </div>
            ) : null}
          </div>
        )}

        {result && (
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
              setApiMessage(null);
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
