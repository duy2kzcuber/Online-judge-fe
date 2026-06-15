"use client";

import {
  Pagination,
  type PaginationData,
} from "@/app/components/Pagination/Pagination";
import {
  createAnnouncement,
  deleteAnnouncement,
  fetchAnnouncements,
  updateAnnouncement,
} from "@/lib/api/announcement-api";
import type { Announcement } from "@/lib/api/announcement-types";
import { getSpringPageMeta } from "@/lib/api/problem-types";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const PAGE_SIZE = 10;

const inputClass =
  "w-full border border-[#D1D5DB] rounded-[8px] px-[12px] py-[9px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange focus:outline-none";

const textareaClass =
  "w-full min-h-[200px] border border-[#D1D5DB] rounded-[8px] px-[12px] py-[9px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange focus:outline-none resize-y";

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

interface FormState {
  title: string;
  content: string;
  visible: boolean;
}

const emptyForm: FormState = {
  title: "",
  content: "",
  visible: true,
};

function AdminAnnouncementPageContent() {
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
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAnnouncements(page - 1, PAGE_SIZE);

        if (cancelled) return;

        setAnnouncements(data.content ?? []);
        const pageMeta = getSpringPageMeta(data);
        setPagination({
          page,
          pageSize: pageMeta.size,
          totalPages: pageMeta.totalPages,
          totalItems: pageMeta.totalElements,
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách thông báo",
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
  }, [page]);

  const reloadList = async () => {
    const data = await fetchAnnouncements(page - 1, PAGE_SIZE);
    setAnnouncements(data.content ?? []);
    const pageMeta = getSpringPageMeta(data);
    setPagination({
      page,
      pageSize: pageMeta.size,
      totalPages: pageMeta.totalPages,
      totalItems: pageMeta.totalElements,
    });
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (item: Announcement) => {
    setDialogMode("edit");
    setEditingId(item.id);
    setForm({
      title: item.title,
      content: item.content,
      visible: item.visible,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      window.alert("Vui lòng nhập tiêu đề thông báo");
      return;
    }
    if (!form.content.trim()) {
      window.alert("Vui lòng nhập nội dung thông báo");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content,
        visible: form.visible,
      };
      if (dialogMode === "create") {
        await createAnnouncement(payload);
      } else if (editingId != null) {
        await updateAnnouncement(editingId, payload);
      }
      closeDialog();
      await reloadList();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Không thể lưu thông báo",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleVisibleToggle = async (item: Announcement, visible: boolean) => {
    try {
      await updateAnnouncement(item.id, {
        title: item.title,
        content: item.content,
        visible,
      });
      await reloadList();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Không thể cập nhật trạng thái",
      );
      await reloadList();
    }
  };

  const handleDelete = async (item: Announcement) => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa thông báo này? Hành động không thể hoàn tác.",
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    try {
      await deleteAnnouncement(item.id);
      await reloadList();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Không thể xóa thông báo",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <div className="flex items-center justify-between mb-[14px]">
        <div>
          <h2 className="text-[18px] font-[600]">Thông báo chung</h2>
          <p className="text-[13px] text-[#6B7280] mt-[4px]">
            Quản lý thông báo hiển thị trên trang chủ
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateDialog}
          className="bg-oj-orange text-oj-white rounded-[8px] px-[14px] py-[9px] text-[14px] font-[500] hover:bg-[#F5965B]"
        >
          + Tạo thông báo
        </button>
      </div>

      {loading ? (
        <p className="py-[40px] text-center text-[14px] text-[#6B7280]">
          Đang tải...
        </p>
      ) : error ? (
        <p className="py-[40px] text-center text-[14px] text-red-600" role="alert">
          {error}
        </p>
      ) : announcements.length === 0 ? (
        <p className="py-[40px] text-center text-[14px] text-[#6B7280]">
          Chưa có thông báo nào.
        </p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="border-b text-left text-[#6B7280]">
                <th className="py-[12px] px-[8px] w-[72px]">ID</th>
                <th className="py-[12px] px-[8px]">Tiêu đề</th>
                <th className="py-[12px] px-[8px]">Ngày tạo</th>
                <th className="py-[12px] px-[8px]">Cập nhật</th>
                <th className="py-[12px] px-[8px]">Tác giả</th>
                <th className="py-[12px] px-[8px] w-[90px] text-center">
                  Hiển thị
                </th>
                <th className="py-[12px] px-[8px] w-[160px] text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((item) => (
                <tr key={item.id} className="border-b hover:bg-[#FAFAFA]">
                  <td className="py-[12px] px-[8px] text-[#6B7280]">{item.id}</td>
                  <td className="py-[12px] px-[8px] font-[500] max-w-[280px]">
                    <span className="line-clamp-2">{item.title}</span>
                  </td>
                  <td className="py-[12px] px-[8px] text-[#6B7280] whitespace-nowrap">
                    {formatDateTime(item.createTime)}
                  </td>
                  <td className="py-[12px] px-[8px] text-[#6B7280] whitespace-nowrap">
                    {formatDateTime(item.lastUpdateTime)}
                  </td>
                  <td className="py-[12px] px-[8px]">
                    {item.createdBy?.username ?? "—"}
                  </td>
                  <td className="py-[12px] px-[8px] text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={item.visible}
                        onChange={(e) =>
                          handleVisibleToggle(item, e.target.checked)
                        }
                      />
                      <span className="relative w-[40px] h-[22px] bg-[#D1D5DB] rounded-full peer-checked:bg-oj-orange transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[18px] after:h-[18px] after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-[18px]" />
                    </label>
                  </td>
                  <td className="py-[12px] px-[8px]">
                    <div className="flex items-center justify-end gap-[6px]">
                      <button
                        type="button"
                        onClick={() => openEditDialog(item)}
                        className="border border-[#D1D5DB] rounded-[6px] px-[8px] py-[5px] text-[13px] hover:border-oj-orange hover:text-oj-orange"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item)}
                        className="border border-[#FECACA] text-red-600 rounded-[6px] px-[8px] py-[5px] text-[13px] hover:bg-[#FEF2F2] disabled:opacity-50"
                      >
                        {deletingId === item.id ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && (
        <Pagination
          pagination={pagination}
          basePath="/admin/announcement"
        />
      )}

      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[16px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-oj-white w-full max-w-[640px] rounded-[10px] border border-[#E5E7EB] shadow-lg">
            <div className="px-[20px] py-[16px] border-b border-[#E5E7EB]">
              <h3 className="text-[17px] font-[600]">
                {dialogMode === "create"
                  ? "Tạo thông báo"
                  : "Chỉnh sửa thông báo"}
              </h3>
            </div>

            <div className="px-[20px] py-[16px] space-y-[14px]">
              <div>
                <label className="block text-[13px] font-[500] mb-[6px]">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="Nhập tiêu đề thông báo"
                />
              </div>

              <div>
                <label className="block text-[13px] font-[500] mb-[6px]">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, content: e.target.value }))
                  }
                  className={textareaClass}
                  placeholder="Nhập nội dung (hỗ trợ HTML)"
                />
              </div>

              <label className="inline-flex items-center gap-[10px] text-[14px]">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, visible: e.target.checked }))
                  }
                  className="accent-oj-orange w-[16px] h-[16px]"
                />
                Hiển thị công khai
              </label>
            </div>

            <div className="px-[20px] py-[14px] border-t border-[#E5E7EB] flex justify-end gap-[8px]">
              <button
                type="button"
                onClick={closeDialog}
                disabled={saving}
                className="h-[38px] px-[14px] border border-[#D1D5DB] rounded-[8px] text-[14px] hover:bg-[#F9FAFB] disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="h-[38px] px-[16px] bg-oj-orange text-oj-white rounded-[8px] text-[14px] hover:bg-[#F5965B] disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function AdminAnnouncementPage() {
  return (
    <Suspense
      fallback={
        <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[40px] text-center text-[#6B7280]">
          Đang tải...
        </section>
      }
    >
      <AdminAnnouncementPageContent />
    </Suspense>
  );
}
