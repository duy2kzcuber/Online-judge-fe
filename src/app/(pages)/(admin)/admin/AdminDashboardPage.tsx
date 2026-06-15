"use client";

import { useAuth } from "@/contexts/AuthContext";
import { fetchAnnouncements } from "@/lib/api/announcement-api";
import type { Announcement } from "@/lib/api/announcement-types";
import { fetchContests } from "@/lib/api/contest-api";
import { fetchProblems } from "@/lib/api/problem-api";
import { getSpringPageMeta } from "@/lib/api/problem-types";
import { fetchSubmissions } from "@/lib/api/submission-api";
import { fetchUsers } from "@/lib/api/user-api";
import { canAccessAdminPath } from "@/lib/auth/admin-access";
import { resolveContestStatus } from "@/lib/contest/status";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
type DashboardStat = {
  key: string;
  label: string;
  value: string;
  href?: string;
};

const QUICK_LINKS = [
  { href: "/admin/users", label: "Quản lý người dùng", path: "/admin/users" },
  { href: "/admin/problems", label: "Danh sách bài tập", path: "/admin/problems" },
  { href: "/admin/submissions", label: "Quản lý bài nộp", path: "/admin/submissions" },
  { href: "/admin/contest", label: "Danh sách kì thi", path: "/admin/contest" },
  {
    href: "/admin/announcement",
    label: "Quản lý bài viết",
    path: "/admin/announcement",
  },
  { href: "/admin/categories", label: "Quản lý danh mục", path: "/admin/categories" },
] as const;

const DASHBOARD_CONTEST_FETCH_LIMIT = 500;

function formatNumber(value: number): string {
  return value.toLocaleString("vi-VN");
}

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

function truncateText(text: string, maxLength = 140): string {
  const normalized = text.trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}...`;
}

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

async function countTodaySubmissions(): Promise<number> {
  const data = await fetchSubmissions({
    page: 0,
    size: 1,
    createdFrom: startOfToday().toISOString(),
  });
  return getSpringPageMeta(data).totalElements;
}

async function countPublicProblems(): Promise<number> {
  const data = await fetchProblems({ page: 0, size: 1, isPublic: true });
  return getSpringPageMeta(data).totalElements;
}

async function countOngoingContests(): Promise<number> {
  const probe = await fetchContests(0, 1);
  const { totalElements, totalPages } = getSpringPageMeta(probe);

  if (totalElements === 0) {
    return 0;
  }

  const fetchSize = Math.min(totalElements, DASHBOARD_CONTEST_FETCH_LIMIT);
  const data =
    totalPages === 1 && (probe.content?.length ?? 0) >= totalElements
      ? probe
      : await fetchContests(0, fetchSize);

  return (data.content ?? []).filter(
    (contest) => resolveContestStatus(contest) === "ongoing",
  ).length;
}
export function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const visibleQuickLinks = useMemo(
    () => QUICK_LINKS.filter((item) => canAccessAdminPath(user, item.path)),
    [user],
  );

  const canViewAnnouncements = canAccessAdminPath(user, "/admin/announcement");

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      setLoadingStats(true);
      setError(null);

      try {
        const tasks: Promise<DashboardStat | null>[] = [];

        if (canAccessAdminPath(user, "/admin/users")) {
          tasks.push(
            fetchUsers(0, 1).then((data) => ({
              key: "users",
              label: "Tổng người dùng",
              value: formatNumber(getSpringPageMeta(data).totalElements),
              href: "/admin/users",
            })),
          );
        }
        if (canAccessAdminPath(user, "/admin/submissions")) {
          tasks.push(
            countTodaySubmissions().then((count) => ({
              key: "submissions-today",
              label: "Bài nộp hôm nay",
              value: formatNumber(count),
              href: "/admin/submissions",
            })),
          );
        }

        if (canAccessAdminPath(user, "/admin/problems")) {
          tasks.push(
            countPublicProblems().then((count) => ({
              key: "public-problems",
              label: "Đề bài công khai",
              value: formatNumber(count),
              href: "/admin/problems",
            })),
          );
        }

        if (canAccessAdminPath(user, "/admin/contest")) {
          tasks.push(
            countOngoingContests().then((count) => ({
              key: "ongoing-contests",
              label: "Kì thi đang diễn ra",
              value: formatNumber(count),
              href: "/admin/contest",
            })),
          );
        }

        const results = await Promise.all(tasks);
        if (!cancelled) {
          setStats(results.filter((item): item is DashboardStat => item !== null));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải thống kê tổng quan",
          );
          setStats([]);
        }
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    };

    void loadStats();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!canViewAnnouncements) {
      setAnnouncements([]);
      setLoadingAnnouncements(false);
      return;
    }

    let cancelled = false;

    const loadAnnouncements = async () => {
      setLoadingAnnouncements(true);
      try {
        const data = await fetchAnnouncements(0, 5);
        if (!cancelled) {
          setAnnouncements(data.content ?? []);
        }
      } catch {
        if (!cancelled) setAnnouncements([]);
      } finally {
        if (!cancelled) setLoadingAnnouncements(false);
      }
    };

    void loadAnnouncements();
    return () => {
      cancelled = true;
    };
  }, [canViewAnnouncements]);

  const displayName = user?.fullName?.trim() || user?.username || "Quản trị viên";

  return (
    <div className="grid gap-y-[18px]">
      <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
        <h1 className="text-[20px] font-[700] text-black">Tổng quan hệ thống</h1>
        <p className="text-[14px] text-[#6B7280] mt-[6px]">
          Xin chào, <span className="font-[600] text-black">{displayName}</span>.
          Dưới đây là số liệu và thông tin mới nhất trên hệ thống.
        </p>
      </section>

      {loadingStats ? (
        <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[40px] text-center text-[14px] text-[#6B7280]">
          Đang tải thống kê...
        </section>
      ) : error ? (
        <section
          className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[40px] text-center text-[14px] text-red-600"
          role="alert"
        >
          {error}
        </section>
      ) : stats.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[14px]">
          {stats.map((card) => {
            const content = (              <>
                <div className="text-[14px] text-[#6B7280]">{card.label}</div>
                <div className="text-[28px] font-[700] text-oj-orange mt-[8px]">
                  {card.value}
                </div>
              </>
            );

            if (!card.href) {
              return (
                <article
                  key={card.key}
                  className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]"
                >
                  {content}
                </article>
              );
            }

            return (
              <Link
                key={card.key}
                href={card.href}
                className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px] hover:border-oj-orange hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all"
              >
                {content}
              </Link>
            );
          })}
        </section>
      ) : (
        <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[40px] text-center text-[14px] text-[#6B7280]">
          Không có thống kê nào khả dụng với quyền hiện tại.
        </section>
      )}

      <div className="grid gap-[14px] xl:grid-cols-2">
        <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
          <h2 className="text-[18px] font-[600] mb-[10px]">Tài khoản đang đăng nhập</h2>
          <div className="grid gap-y-[8px] text-[14px]">
            <div>
              <span className="text-[#6B7280]">Họ tên:</span>{" "}
              <span className="font-[500]">{user?.fullName?.trim() || "—"}</span>
            </div>
            <div>
              <span className="text-[#6B7280]">Mã sinh viên / Username:</span>{" "}
              <span className="font-[500]">{user?.username || "—"}</span>
            </div>
            <div>
              <span className="text-[#6B7280]">Email:</span>{" "}
              <span className="font-[500]">{user?.email || "—"}</span>
            </div>
            <div>
              <span className="text-[#6B7280]">Vai trò:</span>{" "}
              <span className="font-[500]">
                {user?.roles?.length ? user.roles.join(", ") : "—"}
              </span>
            </div>
          </div>
        </section>

        <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
          <h2 className="text-[18px] font-[600] mb-[10px]">Truy cập nhanh</h2>
          {visibleQuickLinks.length === 0 ? (
            <p className="text-[14px] text-[#6B7280]">
              Không có mục quản trị nào khả dụng.
            </p>
          ) : (
            <div className="flex flex-wrap gap-[8px]">
              {visibleQuickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center rounded-[8px] border border-[#D1D5DB] px-[12px] py-[8px] text-[13px] text-[#374151] hover:border-oj-orange hover:text-oj-orange hover:bg-[#FFF5EE] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {canViewAnnouncements && (
        <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
          <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[12px]">
            <h2 className="text-[18px] font-[600]">Thông báo gần đây</h2>
            <Link
              href="/admin/announcement"
              className="text-[13px] text-oj-orange hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          {loadingAnnouncements ? (
            <p className="text-[14px] text-[#6B7280] py-[20px] text-center">
              Đang tải thông báo...
            </p>
          ) : announcements.length === 0 ? (
            <p className="text-[14px] text-[#6B7280] py-[20px] text-center">
              Chưa có thông báo nào.
            </p>
          ) : (
            <div className="grid gap-y-[10px]">
              {announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="border border-[#EFEFEF] rounded-[8px] px-[12px] py-[10px]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-[8px]">
                    <h3 className="font-[600] text-[15px]">{announcement.title}</h3>
                    <span
                      className={`inline-block rounded-[6px] px-[8px] py-[3px] text-[12px] font-[600] ${
                        announcement.visible
                          ? "bg-[#ECFDF5] text-[#047857]"
                          : "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      {announcement.visible ? "Đang hiển thị" : "Đang ẩn"}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#4B5563] mt-[6px]">
                    {truncateText(announcement.content)}
                  </p>
                  <p className="text-[12px] text-[#9CA3AF] mt-[8px]">
                    {formatDateTime(announcement.createTime)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
