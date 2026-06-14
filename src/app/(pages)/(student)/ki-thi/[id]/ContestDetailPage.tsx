"use client";

import { Button } from "@/app/components/button/Button";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchContestProblems,
  fetchContestScore,
  fetchPublicContestById,
  joinContest,
} from "@/lib/api/contest-api";
import { fetchContestSubmissions } from "@/lib/api/submission-api";
import type {
  Contest,
  ContestProblemItem,
  ContestScore,
} from "@/lib/api/contest-types";
import {
  getContestPassword,
  isContestJoined,
  markContestJoined,
  saveContestPassword,
} from "@/lib/contest/access";
import { mergeProblemsWithSubmissions } from "@/lib/contest/merge-submissions";
import {
  getContestStatusClass,
  getContestStatusLabel,
  resolveContestStatus,
  type ContestStatus,
} from "@/lib/contest/status";
import { getResultLabel, resolveResultStyle } from "@/lib/submission/result";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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

type ContestDetailPageProps = {
  contestId: number;
};

export function ContestDetailPage({ contestId }: ContestDetailPageProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [contest, setContest] = useState<Contest | null>(null);
  const [problems, setProblems] = useState<ContestProblemItem[]>([]);
  const [score, setScore] = useState<ContestScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [loadingScore, setLoadingScore] = useState(false);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  const status: ContestStatus | null = useMemo(
    () => (contest ? resolveContestStatus(contest) : null),
    [contest],
  );

  const loadContest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublicContestById(contestId);
      setContest(data);
      if (data.problems?.length) {
        setProblems([...data.problems].sort((a, b) => a.sortIndex - b.sortIndex));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được kì thi");
      setContest(null);
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  useEffect(() => {
    void loadContest();
  }, [loadContest]);

  useEffect(() => {
    setHasJoined(isContestJoined(contestId));
  }, [contestId]);

  const loadProblemsWithStatus = useCallback(async (password?: string) => {
    if (!isAuthenticated) return;

    setLoadingProblems(true);
    try {
      const storedPassword = password ?? getContestPassword(contestId) ?? undefined;
      const problemList = await fetchContestProblems(contestId, storedPassword);
      const sortedProblems = [...problemList].sort((a, b) => a.sortIndex - b.sortIndex);
      const problemIds = sortedProblems.map((item) => item.problemId);

      const submissions =
        problemIds.length > 0
          ? await fetchContestSubmissions(contestId, problemIds)
          : [];

      setProblems(mergeProblemsWithSubmissions(sortedProblems, submissions));
    } catch (err) {
      setJoinError(
        err instanceof Error ? err.message : "Không thể tải danh sách bài thi",
      );
    } finally {
      setLoadingProblems(false);
    }
  }, [contestId, isAuthenticated]);

  const handleJoin = useCallback(
    async (password?: string) => {
      if (!isAuthenticated) return;

      setJoining(true);
      setJoinError(null);
      setJoinMessage(null);

      try {
        const { join, message } = await joinContest(contestId, password);
        setJoinMessage(message ?? null);

        if (!join.accessGranted) {
          setJoinError(message ?? "Không thể tham gia kì thi");
          setHasJoined(false);
          return;
        }

        if (password?.trim()) {
          saveContestPassword(contestId, password.trim());
        }

        markContestJoined(contestId);
        setHasJoined(true);

        const joinedProblems = join.problems ?? join.contest?.problems ?? [];
        if (joinedProblems.length) {
          setProblems(
            [...joinedProblems].sort((a, b) => a.sortIndex - b.sortIndex),
          );
        }

        try {
          const storedPassword =
            password?.trim() || getContestPassword(contestId) || undefined;
          await loadProblemsWithStatus(storedPassword);
        } catch {
          // Giữ danh sách từ join nếu không tải lại được
        }
      } catch (err) {
        setJoinError(err instanceof Error ? err.message : "Tham gia thất bại");
        setHasJoined(false);
      } finally {
        setJoining(false);
      }
    },
    [contestId, isAuthenticated, loadProblemsWithStatus],
  );

  useEffect(() => {
    if (
      !hasJoined ||
      !isAuthenticated ||
      authLoading ||
      status !== "ongoing"
    ) {
      return;
    }

    void loadProblemsWithStatus();
  }, [authLoading, hasJoined, isAuthenticated, loadProblemsWithStatus, status]);

  useEffect(() => {
    const refreshProblems = () => {
      if (hasJoined && status === "ongoing" && isAuthenticated) {
        void loadProblemsWithStatus();
      }
    };

    window.addEventListener("focus", refreshProblems);
    window.addEventListener("pageshow", refreshProblems);
    return () => {
      window.removeEventListener("focus", refreshProblems);
      window.removeEventListener("pageshow", refreshProblems);
    };
  }, [hasJoined, isAuthenticated, loadProblemsWithStatus, status]);

  useEffect(() => {
    if (
      !contest ||
      !isAuthenticated ||
      authLoading ||
      status !== "ongoing" ||
      hasJoined
    ) {
      return;
    }

    if (!contest.passwordProtected) {
      void handleJoin();
    }
  }, [authLoading, contest, handleJoin, hasJoined, isAuthenticated, status]);

  const loadScore = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoadingScore(true);
    try {
      const storedPassword = getContestPassword(contestId) ?? undefined;
      const data = await fetchContestScore(contestId, storedPassword);
      setScore(data);
    } catch (err) {
      setJoinError(
        err instanceof Error ? err.message : "Không thể tải điểm kì thi",
      );
    } finally {
      setLoadingScore(false);
    }
  }, [contestId, isAuthenticated]);

  useEffect(() => {
    if (status === "finished" && isAuthenticated && !authLoading) {
      void loadScore();
    }
  }, [authLoading, isAuthenticated, loadScore, status]);

  if (loading) {
    return (
      <p className="text-center text-gray-500 py-[40px] text-[14px]">
        Đang tải thông tin kì thi...
      </p>
    );
  }

  if (error || !contest || !status) {
    return (
      <p className="text-center text-red-600 py-[40px] text-[14px]" role="alert">
        {error ?? "Không tìm thấy kì thi"}
      </p>
    );
  }

  const showPasswordForm =
    status === "ongoing" &&
    contest.passwordProtected &&
    !hasJoined &&
    isAuthenticated;

  const showLoginPrompt = status === "ongoing" && !authLoading && !isAuthenticated;

  const showProblems =
    status === "ongoing" && hasJoined && problems.length > 0;

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="bg-oj-white px-[24px] py-[24px] rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#DEDEDE]">
        <div className="flex flex-wrap items-start justify-between gap-[12px] mb-[16px]">
          <div>
            <p className="text-[13px] text-gray-500 mb-[4px]">Kì thi #{contest.id}</p>
            <h1 className="text-[22px] font-[700] text-black">{contest.title}</h1>
          </div>
          <span
            className={`inline-block rounded-[6px] px-[10px] py-[5px] text-[13px] font-[600] ${getContestStatusClass(status)}`}
          >
            {getContestStatusLabel(status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] text-[14px] text-gray-700 mb-[20px]">
          <p>
            <span className="font-[600] text-black">Bắt đầu:</span>{" "}
            {formatDateTime(contest.startTime)}
          </p>
          <p>
            <span className="font-[600] text-black">Kết thúc:</span>{" "}
            {formatDateTime(contest.endTime)}
          </p>
          <p>
            <span className="font-[600] text-black">Mật khẩu:</span>{" "}
            {contest.passwordProtected ? "Yêu cầu mật khẩu" : "Không"}
          </p>
        </div>

        <section>
          <h2 className="text-[16px] font-[600] mb-[8px]">Mô tả</h2>
          <p className="text-[14px] text-gray-800 whitespace-pre-wrap">
            {contest.description || "—"}
          </p>
        </section>
      </div>

      {status === "upcoming" && (
        <div className="rounded-[8px] border border-[#BFDBFE] bg-[#EFF6FF] px-[20px] py-[16px] text-[14px] text-[#1D4ED8]">
          Kì thi chưa bắt đầu. Vui lòng quay lại sau thời gian mở thi.
        </div>
      )}

      {status === "finished" && (
        <div className="rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[20px] py-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-[600] mb-[12px]">Kết quả kì thi</h2>
          {!isAuthenticated ? (
            <p className="text-[14px] text-gray-700 mb-[12px]">
              Đăng nhập để xem điểm của bạn trong kì thi.
            </p>
          ) : loadingScore ? (
            <p className="text-[14px] text-gray-500">Đang tải điểm...</p>
          ) : score ? (
            <div>
              <div className="flex flex-wrap gap-[16px] mb-[16px] text-[14px]">
                <p>
                  <span className="text-gray-600">Tổng điểm:</span>{" "}
                  <strong className="text-oj-orange text-[18px]">
                    {score.totalScore}
                  </strong>
                </p>
                <p>
                  <span className="text-gray-600">Bài đúng:</span>{" "}
                  <strong>
                    {score.solvedCount}/{score.totalProblems}
                  </strong>
                </p>
              </div>
              {score.problemScores && score.problemScores.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-[14px]">
                    <thead>
                      <tr className="border-b border-[#EEEEEE] text-left text-gray-600">
                        <th className="py-[8px] pr-[12px]">#</th>
                        <th className="py-[8px] pr-[12px]">Bài thi</th>
                        <th className="py-[8px] pr-[12px]">Điểm</th>
                        <th className="py-[8px]">Kết quả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...score.problemScores]
                        .sort((a, b) => a.sortIndex - b.sortIndex)
                        .map((item, index) => (
                          <tr key={item.problemId} className="border-b border-[#F3F4F6]">
                            <td className="py-[10px] pr-[12px]">{index + 1}</td>
                            <td className="py-[10px] pr-[12px]">
                              {item.problemTitle ?? item.problemId}
                            </td>
                            <td className="py-[10px] pr-[12px]">
                              {item.bestScore ?? "0"}
                            </td>
                            <td className="py-[10px]">
                              {item.bestResult
                                ? getResultLabel(
                                    item.bestResult as "AC" | "WA" | "TLE" | "MLE",
                                  )
                                : "—"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[14px] text-gray-600">
              Chưa có dữ liệu điểm cho tài khoản của bạn.
            </p>
          )}
          {!isAuthenticated && (
            <Link
              href="/login"
              className="inline-block mt-[12px] text-[14px] text-oj-orange hover:underline"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      )}

      {showLoginPrompt && (
        <div className="rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[24px] py-[24px] text-center">
          <p className="text-[14px] text-gray-700 mb-[16px]">
            Bạn cần đăng nhập để tham gia và làm bài trong kì thi.
          </p>
          <Link
            href="/login"
            className="inline-block border border-oj-orange rounded-[20px] px-[20px] py-[8px] text-[14px] text-oj-orange hover:bg-[#FFF5EE]"
          >
            Đăng nhập
          </Link>
        </div>
      )}

      {showPasswordForm && (
        <div className="rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[24px] py-[24px]">
          <h2 className="text-[16px] font-[600] mb-[8px]">Nhập mật khẩu kì thi</h2>
          <p className="text-[14px] text-gray-600 mb-[16px]">
            Kì thi này được bảo vệ bằng mật khẩu. Nhập mật khẩu để xem danh sách bài thi.
          </p>
          <div className="flex flex-wrap items-center gap-[10px]">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleJoin(passwordInput);
              }}
              placeholder="Mật khẩu kì thi"
              className="h-[40px] min-w-[220px] flex-1 rounded-[8px] border border-[#DEDEDE] px-[12px] text-[14px] focus:border-oj-orange focus:outline-none"
            />
            <Button
              displayContent={joining ? "Đang xác minh..." : "Tham gia"}
              onButtonClick={() => void handleJoin(passwordInput)}
              disabled={joining || !passwordInput.trim()}
              className="!h-[40px] min-w-[120px] disabled:opacity-60"
            />
          </div>
          {joinError && (
            <p className="mt-[12px] text-[13px] text-red-600" role="alert">
              {joinError}
            </p>
          )}
        </div>
      )}

      {status === "ongoing" && hasJoined && joining && (
        <p className="text-[14px] text-gray-500 text-center py-[12px]">
          Đang xác nhận quyền tham gia...
        </p>
      )}

      {joinMessage && hasJoined && !joinError && (
        <p className="text-[14px] text-[#047857] text-center">{joinMessage}</p>
      )}

      {showProblems && (
        <div className="rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[24px] py-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-[12px] mb-[16px]">
            <h2 className="text-[18px] font-[600]">Danh sách bài thi</h2>
            {loadingProblems && (
              <span className="text-[13px] text-gray-500">Đang cập nhật...</span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[14px]">
              <thead>
                <tr className="border-b border-[#EEEEEE] text-left text-gray-600">
                  <th className="py-[8px] pr-[12px] w-[60px]">#</th>
                  <th className="py-[8px] pr-[12px]">Tên bài</th>
                  <th className="py-[8px] pr-[12px] w-[120px]">Trạng thái</th>
                  <th className="py-[8px] pr-[12px] w-[80px]">Điểm</th>
                  <th className="py-[8px] w-[120px]" />
                </tr>
              </thead>
              <tbody>
                {problems.map((problem, index) => {
                  const resultStyle = problem.bestResult
                    ? resolveResultStyle(
                        problem.bestResult as "AC" | "WA" | "TLE" | "MLE",
                      )
                    : null;

                  return (
                    <tr
                      key={problem.problemId}
                      className="border-b border-[#F3F4F6] hover:bg-[#FFFAF7]"
                    >
                      <td className="py-[12px] pr-[12px]">{index + 1}</td>
                      <td className="py-[12px] pr-[12px] font-[500]">
                        {problem.problemTitle ?? problem.problemId}
                      </td>
                      <td className="py-[12px] pr-[12px]">
                        {problem.bestResult && resultStyle ? (
                          <span
                            className={`inline-block text-xs font-[600] px-2 py-1 rounded-md ${resultStyle.badge}`}
                          >
                            {getResultLabel(
                              problem.bestResult as "AC" | "WA" | "TLE" | "MLE",
                            )}
                          </span>
                        ) : (
                          <span className="text-[13px] text-gray-500">Chưa nộp</span>
                        )}
                      </td>
                      <td className="py-[12px] pr-[12px] text-gray-700">
                        {problem.bestScore ?? "—"}
                      </td>
                      <td className="py-[12px]">
                        <Link
                          href={`/problem/${problem.problemId}?contestId=${contestId}`}
                          className={`inline-flex items-center justify-center rounded-[6px] px-[12px] py-[6px] text-[13px] hover:opacity-90 ${
                            problem.bestResult === "AC"
                              ? "border border-oj-orange text-oj-orange bg-[#FFF5EE]"
                              : "bg-oj-orange text-white"
                          }`}
                        >
                          {problem.bestResult === "AC" ? "Xem lại" : "Làm bài"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {status === "ongoing" && hasJoined && problems.length === 0 && !joining && (
        <div className="rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[20px] py-[16px] text-[14px] text-gray-600">
          Kì thi chưa có bài thi nào.
        </div>
      )}
    </div>
  );
}
