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

type AdminContestParticipantsPageProps = {
  contestId: number;
};

export function AdminContestParticipantsPage({
  contestId,
}: AdminContestParticipantsPageProps) {
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
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu thí sinh",
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

  if (loading) {
    return (
      <p className="text-center text-gray-500 py-[40px] text-[14px]">
        Đang tải danh sách thí sinh...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-600 py-[40px] text-[14px]" role="alert">
        {error}
      </p>
    );
  }

  const status = contest ? resolveContestStatus(contest) : null;

  return (
    <div className="space-y-[20px]">
      <div className="flex flex-wrap items-start justify-between gap-[12px]">
        <div>
          <p className="text-[13px] text-gray-500 mb-[4px]">
            Kì thi #{contestId}
          </p>
          <h1 className="text-[22px] font-[700] text-black">
            {contest?.title ?? "Thí sinh tham dự"}
          </h1>
          {contest && status && (
            <div className="mt-[8px] flex flex-wrap items-center gap-[12px] text-[14px] text-gray-600">
              <span
                className={`inline-block rounded-[6px] px-[8px] py-[3px] text-[12px] font-[600] ${getContestStatusClass(status)}`}
              >
                {getContestStatusLabel(status)}
              </span>
              <span>
                {formatDateTime(contest.startTime)} →{" "}
                {formatDateTime(contest.endTime)}
              </span>
            </div>
          )}
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

      <div className="flex flex-wrap items-center gap-[12px]">
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo tên, username hoặc ID..."
          className="h-[38px] w-full max-w-[320px] border border-[#D1D5DB] rounded-[8px] px-[10px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange focus:outline-none"
        />
        <span className="text-[14px] text-gray-600">
          {filteredParticipants.length} thí sinh
        </span>
      </div>

      {filteredParticipants.length === 0 ? (
        <div className="rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[24px] py-[40px] text-center text-[14px] text-gray-600">
          {participants.length === 0
            ? "Chưa có sinh viên nào nộp bài trong kì thi này."
            : "Không tìm thấy thí sinh phù hợp."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[8px] border border-[#DEDEDE] bg-oj-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <table className="w-full min-w-[760px] text-[14px]">
            <thead>
              <tr className="border-b border-[#DEDEDE] bg-[#FAFAFA] text-left text-gray-600">
                <th className="py-[12px] px-[12px] w-[60px]">#</th>
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
