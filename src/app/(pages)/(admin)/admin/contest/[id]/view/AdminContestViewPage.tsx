"use client";

import { fetchContestById, fetchContestParticipants } from "@/lib/api/contest-api";
import type { Contest, ContestParticipant } from "@/lib/api/contest-types";
import {
  getContestStatusClass,
  getContestStatusLabel,
  resolveContestStatus,
} from "@/lib/contest/status";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ParticipantDetailDialog } from "./ParticipantDetailDialog";

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

function formatCreator(contest: Contest): string {
  if (!contest.createdBy) return "—";
  return contest.createdBy.fullName?.trim() || contest.createdBy.username;
}

type AdminContestViewPageProps = {
  contestId: number;
};

export function AdminContestViewPage({ contestId }: AdminContestViewPageProps) {
  const [contest, setContest] = useState<Contest | null>(null);
  const [participants, setParticipants] = useState<ContestParticipant[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] =
    useState<ContestParticipant | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [contestData, participantData] = await Promise.all([
          fetchContestById(contestId),
          fetchContestParticipants(contestId),
        ]);
        if (cancelled) return;
        setContest(contestData);
        setParticipants(participantData);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Không thể tải dữ liệu kì thi",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [contestId]);

  const problems = useMemo(
    () =>
      [...(contest?.problems ?? [])].sort((a, b) => a.sortIndex - b.sortIndex),
    [contest?.problems],
  );

  const filteredParticipants = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return participants;

    return participants.filter((item) => {
      const fullName = item.fullName?.toLowerCase() ?? "";
      const username = item.username.toLowerCase();
      const userId = item.userId.toLowerCase();
      return (
        fullName.includes(q) || username.includes(q) || userId.includes(q)
      );
    });
  }, [keyword, participants]);

  const stats = useMemo(() => {
    const totalSubmissions = participants.reduce(
      (sum, item) => sum + item.submissionCount,
      0,
    );
    const topScore =
      participants.length > 0
        ? Math.max(...participants.map((item) => item.totalScore))
        : 0;
    const solvedParticipants = participants.filter(
      (item) => item.solvedCount > 0,
    ).length;

    return {
      totalSubmissions,
      topScore,
      solvedParticipants,
    };
  }, [participants]);

  if (loading) {
    return (
      <p className="text-center text-gray-500 py-[40px] text-[14px]">
        Đang tải thông tin kì thi...
      </p>
    );
  }

  if (error || !contest) {
    return (
      <p className="text-center text-red-600 py-[40px] text-[14px]" role="alert">
        {error ?? "Không tìm thấy kì thi"}
      </p>
    );
  }

  const status = resolveContestStatus(contest);

  return (
    <div className="space-y-[24px]">
      <div className="flex flex-wrap items-start justify-between gap-[12px]">
        <div>
          <p className="text-[13px] text-gray-500 mb-[4px]">Kì thi #{contestId}</p>
          <h1 className="text-[24px] font-[700] text-black">{contest.title}</h1>
          <div className="mt-[10px] flex flex-wrap items-center gap-[10px]">
            <span
              className={`inline-block rounded-[6px] px-[10px] py-[4px] text-[12px] font-[600] ${getContestStatusClass(status)}`}
            >
              {getContestStatusLabel(status)}
            </span>
            <span
              className={`inline-block rounded-[6px] px-[10px] py-[4px] text-[12px] font-[600] ${
                contest.visible
                  ? "bg-[#FFF7ED] text-oj-orange"
                  : "bg-[#F3F4F6] text-[#6B7280]"
              }`}
            >
              {contest.visible ? "Đang hiển thị" : "Đang ẩn"}
            </span>
            {contest.passwordProtected && (
              <span className="inline-block rounded-[6px] bg-[#EFF6FF] px-[10px] py-[4px] text-[12px] font-[600] text-[#1D4ED8]">
                Có mật khẩu
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-[8px]">
          <Link
            href={`/admin/contest/${contestId}/edit`}
            className="inline-flex h-[38px] items-center rounded-[8px] border border-[#D1D5DB] px-[14px] text-[14px] hover:border-oj-orange hover:text-oj-orange"
          >
            Sửa kì thi
          </Link>
          <Link
            href="/admin/contest"
            className="inline-flex h-[38px] items-center rounded-[8px] border border-[#D1D5DB] px-[14px] text-[14px] hover:border-oj-orange hover:text-oj-orange"
          >
            Danh sách kì thi
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[12px] md:grid-cols-4">
        {[
          { label: "Thí sinh", value: participants.length },
          { label: "Bài thi", value: problems.length },
          { label: "Tổng lượt nộp", value: stats.totalSubmissions },
          { label: "Điểm cao nhất", value: stats.topScore },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[16px] py-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
          >
            <p className="text-[13px] text-gray-500">{item.label}</p>
            <p className="mt-[4px] text-[22px] font-[700] text-oj-orange">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[24px] py-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-[600] mb-[16px]">Thông tin kì thi</h2>
        <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2 text-[14px]">
          <div className="space-y-[10px]">
            <p>
              <span className="font-[600] text-black">Bắt đầu:</span>{" "}
              <span className="text-gray-700">{formatDateTime(contest.startTime)}</span>
            </p>
            <p>
              <span className="font-[600] text-black">Kết thúc:</span>{" "}
              <span className="text-gray-700">{formatDateTime(contest.endTime)}</span>
            </p>
            <p>
              <span className="font-[600] text-black">Người tạo:</span>{" "}
              <span className="text-gray-700">{formatCreator(contest)}</span>
            </p>
          </div>
          <div className="space-y-[10px]">
            <p>
              <span className="font-[600] text-black">Tạo lúc:</span>{" "}
              <span className="text-gray-700">{formatDateTime(contest.createTime)}</span>
            </p>
            <p>
              <span className="font-[600] text-black">Cập nhật:</span>{" "}
              <span className="text-gray-700">
                {formatDateTime(contest.lastUpdateTime)}
              </span>
            </p>
            <p>
              <span className="font-[600] text-black">Thí sinh có bài đúng:</span>{" "}
              <span className="text-gray-700">{stats.solvedParticipants}</span>
            </p>
          </div>
        </div>
        <div className="mt-[16px] pt-[16px] border-t border-[#EEEEEE]">
          <h3 className="text-[15px] font-[600] mb-[8px]">Mô tả</h3>
          <p className="text-[14px] text-gray-800 whitespace-pre-wrap">
            {contest.description || "—"}
          </p>
        </div>
      </section>

      <section className="rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[24px] py-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-[600] mb-[16px]">
          Danh sách bài thi ({problems.length})
        </h2>
        {problems.length === 0 ? (
          <p className="text-[14px] text-gray-600">Kì thi chưa có bài tập nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-[14px]">
              <thead>
                <tr className="border-b border-[#EEEEEE] text-left text-gray-600">
                  <th className="py-[10px] pr-[12px] w-[60px]">#</th>
                  <th className="py-[10px] pr-[12px]">Tên bài</th>
                  <th className="py-[10px] pr-[12px] w-[120px]">Mã bài</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem, index) => (
                  <tr key={problem.problemId} className="border-b border-[#F3F4F6]">
                    <td className="py-[12px] pr-[12px]">{index + 1}</td>
                    <td className="py-[12px] pr-[12px] font-[500]">
                      {problem.problemTitle ?? "—"}
                    </td>
                    <td className="py-[12px] pr-[12px] text-gray-600 font-mono text-[13px]">
                      {problem.problemId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[24px] py-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-[12px] mb-[16px]">
          <h2 className="text-[18px] font-[600]">Kết quả & thí sinh</h2>
          <div className="flex flex-wrap items-center gap-[12px]">
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên, username..."
              className="h-[38px] w-full min-w-[220px] max-w-[320px] border border-[#D1D5DB] rounded-[8px] px-[10px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange focus:outline-none"
            />
            <span className="text-[14px] text-gray-600">
              {filteredParticipants.length} thí sinh
            </span>
          </div>
        </div>

        {filteredParticipants.length === 0 ? (
          <div className="rounded-[8px] border border-[#EEEEEE] bg-[#FAFAFA] px-[20px] py-[32px] text-center text-[14px] text-gray-600">
            {participants.length === 0
              ? "Chưa có sinh viên nào nộp bài trong kì thi này."
              : "Không tìm thấy thí sinh phù hợp."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-[14px]">
              <thead>
                <tr className="border-b border-[#DEDEDE] bg-[#FAFAFA] text-left text-gray-600">
                  <th className="py-[12px] px-[12px] w-[60px]">Hạng</th>
                  <th className="py-[12px] px-[12px]">Username</th>
                  <th className="py-[12px] px-[12px]">Họ tên</th>
                  <th className="py-[12px] px-[12px] w-[120px]">Tổng điểm</th>
                  <th className="py-[12px] px-[12px] w-[120px]">Bài đúng</th>
                  <th className="py-[12px] px-[12px] w-[120px]">Lượt nộp</th>
                  <th className="py-[12px] px-[12px] w-[120px]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant, index) => (
                  <tr
                    key={participant.userId}
                    className="border-b border-[#EEEEEE] hover:bg-[#FFFAF7]"
                  >
                    <td className="py-[12px] px-[12px] font-[600]">{index + 1}</td>
                    <td className="py-[12px] px-[12px] font-[500]">
                      {participant.username}
                    </td>
                    <td className="py-[12px] px-[12px]">
                      {participant.fullName?.trim() || "—"}
                    </td>
                    <td className="py-[12px] px-[12px] font-[600] text-oj-orange">
                      {participant.totalScore}
                    </td>
                    <td className="py-[12px] px-[12px]">
                      {participant.solvedCount}/{participant.totalProblems}
                    </td>
                    <td className="py-[12px] px-[12px]">
                      {participant.submissionCount}
                    </td>
                    <td className="py-[12px] px-[12px]">
                      <button
                        type="button"
                        onClick={() => setSelectedParticipant(participant)}
                        className="inline-flex h-[32px] items-center rounded-[6px] border border-[#D1D5DB] px-[10px] text-[13px] hover:border-oj-orange hover:text-oj-orange"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedParticipant && (
        <ParticipantDetailDialog
          contestId={contestId}
          participant={selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
    </div>
  );
}
