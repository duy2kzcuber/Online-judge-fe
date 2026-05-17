"use client";

import { Button } from "@/app/components/button/Button";
import {
  Pagination,
  type PaginationData,
} from "@/app/components/Pagination/Pagination";
import { fetchPublicAnnouncements } from "@/lib/api/announcement-api";
import type { Announcement } from "@/lib/api/announcement-types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PAGE_SIZE = 10;

function formatDateTime(iso?: string): string {
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

function authorLabel(announcement: Announcement): string {
  const author = announcement.createdBy;
  if (!author) return "—";
  return author.fullName?.trim() || author.username;
}

export function AnnouncementsPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPublicAnnouncements(page - 1, PAGE_SIZE);

        if (cancelled) return;

        setAnnouncements(data.content ?? []);
        setPagination({
          page,
          pageSize: data.size ?? PAGE_SIZE,
          totalPages: Math.max(1, data.totalPages ?? 1),
          totalItems: data.totalElements ?? 0,
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Không thể tải thông báo",
          );
          setAnnouncements([]);
          setPagination({
            page: 1,
            pageSize: PAGE_SIZE,
            totalPages: 1,
            totalItems: 0,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [page, refreshKey]);

  const handleRefresh = () => {
    setSelected(null);
    if (page !== 1) {
      router.push("/?page=1");
      return;
    }
    setRefreshKey((k) => k + 1);
  };

  const handleBack = () => {
    setSelected(null);
  };

  const panelTitle = selected ? selected.title : "Thông báo";

  return (
    <>
      <div className="bg-oj-white px-[16px] py-[14px] rounded-[5px]">
        <div className="flex flex-wrap items-center justify-between gap-[10px]">
          <h1 className="text-[18px] font-[600] line-clamp-2 pr-[8px]">
            {panelTitle}
          </h1>
          {selected ? (
            <button
              type="button"
              onClick={handleBack}
              className="h-[34px] px-[12px] border border-[#D1D5DB] rounded-[5px] text-[14px] hover:border-oj-orange hover:text-oj-orange"
            >
              Quay lại
            </button>
          ) : (
            <Button
              displayContent={loading ? "Đang tải..." : "Tải lại"}
              onButtonClick={handleRefresh}
              disabled={loading}
            />
          )}
        </div>

        {loading ? (
          <p className="pt-[24px] pb-[12px] text-center text-[14px] text-[#6B7280]">
            Đang tải thông báo...
          </p>
        ) : error ? (
          <p
            className="pt-[24px] pb-[12px] text-center text-[14px] text-red-600"
            role="alert"
          >
            {error}
          </p>
        ) : selected ? (
          <article className="pt-[16px] pb-[8px]">
            <div className="flex flex-wrap gap-[16px] text-[13px] text-[#6B7280] mb-[16px] pb-[12px] border-b border-[#E5E7EB]">
              <span>{formatDateTime(selected.createTime)}</span>
              <span>Bởi {authorLabel(selected)}</span>
            </div>
            <div
              className="announcement-content text-[15px] leading-[1.7] text-[#374151] break-words"
              dangerouslySetInnerHTML={{ __html: selected.content }}
            />
          </article>
        ) : announcements.length === 0 ? (
          <p className="pt-[24px] pb-[12px] text-center text-[16px] text-[#6B7280]">
            Chưa có thông báo nào.
          </p>
        ) : (
          <ul className="pt-[8px]">
            {announcements.map((item) => (
              <li
                key={item.id}
                className="py-[14px] border-b border-[#E5E7EB] last:border-b-0"
              >
                <div className="flex flex-col gap-[8px] sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="text-left text-[17px] text-[#374151] underline-offset-2 hover:text-oj-orange hover:underline sm:flex-1 sm:min-w-0 sm:truncate"
                  >
                    {item.title}
                  </button>
                  <div className="flex flex-wrap gap-[12px] sm:gap-[20px] text-[13px] text-[#6B7280] sm:flex-none">
                    <span className="whitespace-nowrap">
                      {formatDateTime(item.createTime)}
                    </span>
                    <span className="whitespace-nowrap">
                      Bởi {authorLabel(item)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!selected && !loading && !error && (
        <Pagination pagination={pagination} basePath="/" />
      )}
    </>
  );
}
