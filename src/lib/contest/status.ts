export type ContestStatus = "upcoming" | "ongoing" | "finished";

export const CONTEST_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "upcoming", label: "Sắp diễn ra" },
  { value: "ongoing", label: "Đang diễn ra" },
  { value: "finished", label: "Đã kết thúc" },
] as const;

export const CONTEST_VISIBLE_OPTIONS = [
  { value: "", label: "Tất cả hiển thị" },
  { value: "visible", label: "Đang hiển thị" },
  { value: "hidden", label: "Đang ẩn" },
] as const;

export function getContestStatus(
  startTime: string,
  endTime: string,
  now = Date.now(),
): ContestStatus {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return "upcoming";
  }
  if (now < start) return "upcoming";
  if (now > end) return "finished";
  return "ongoing";
}

export function getContestStatusLabel(status: ContestStatus): string {
  switch (status) {
    case "upcoming":
      return "Sắp diễn ra";
    case "ongoing":
      return "Đang diễn ra";
    case "finished":
      return "Đã kết thúc";
  }
}

export function getContestStatusClass(status: ContestStatus): string {
  switch (status) {
    case "upcoming":
      return "bg-[#EFF6FF] text-[#1D4ED8]";
    case "ongoing":
      return "bg-[#ECFDF5] text-[#047857]";
    case "finished":
      return "bg-[#F3F4F6] text-[#6B7280]";
  }
}

export function resolveContestStatus(
  contest: { status?: string | null; startTime: string; endTime: string },
  now = Date.now(),
): ContestStatus {
  const raw = contest.status?.toLowerCase();
  if (raw === "upcoming" || raw === "ongoing" || raw === "finished") {
    return raw;
  }
  return getContestStatus(contest.startTime, contest.endTime, now);
}
