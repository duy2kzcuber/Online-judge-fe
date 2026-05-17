"use client";

import {
  Pagination,
  type PaginationData,
} from "@/app/components/Pagination/Pagination";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/lib/api/category-api";
import type { Category } from "@/lib/api/problem-types";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

const inputClass =
  "w-full border border-[#D1D5DB] rounded-[8px] px-[12px] py-[9px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange focus:outline-none";

const searchClass =
  "h-[38px] w-full max-w-[320px] border border-[#D1D5DB] rounded-[8px] px-[10px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange focus:outline-none";

function AdminCategoriesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const keywordParam = searchParams.get("keyword") ?? "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [keywordInput, setKeywordInput] = useState(keywordParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setKeywordInput(keywordParam);
  }, [keywordParam]);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải danh mục",
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const q = keywordParam.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.title.toLowerCase().includes(q));
  }, [categories, keywordParam]);

  const pagination: PaginationData = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    return {
      page: safePage,
      pageSize: PAGE_SIZE,
      totalPages,
      totalItems: filteredCategories.length,
    };
  }, [filteredCategories.length, page]);

  const pagedCategories = useMemo(() => {
    const start = (pagination.page - 1) * PAGE_SIZE;
    return filteredCategories.slice(start, start + PAGE_SIZE);
  }, [filteredCategories, pagination.page]);

  const openCreateDialog = () => {
    setDialogMode("create");
    setEditingId(null);
    setTitle("");
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setDialogMode("edit");
    setEditingId(category.id);
    setTitle(category.title);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setTitle("");
  };

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      window.alert("Vui lòng nhập tên danh mục");
      return;
    }
    if (trimmed.length > 100) {
      window.alert("Tên danh mục không được quá 100 ký tự");
      return;
    }

    setSaving(true);
    try {
      if (dialogMode === "create") {
        await createCategory({ title: trimmed });
      } else if (editingId) {
        await updateCategory(editingId, { title: trimmed });
      }
      closeDialog();
      await loadCategories();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Không thể lưu danh mục",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa danh mục "${category.title}"?`,
    );
    if (!confirmed) return;

    setDeletingId(category.id);
    try {
      await deleteCategory(category.id);
      const data = await fetchCategories();
      setCategories(data);
      const q = keywordParam.trim().toLowerCase();
      const filtered = q
        ? data.filter((c) => c.title.toLowerCase().includes(q))
        : data;
      const nextTotalPages = Math.max(
        1,
        Math.ceil(filtered.length / PAGE_SIZE),
      );
      if (page > nextTotalPages) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(nextTotalPages));
        router.push(`/admin/categories?${params.toString()}`);
      }
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Không thể xóa danh mục",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keywordInput.trim()) params.set("keyword", keywordInput.trim());
    params.set("page", "1");
    router.push(`/admin/categories?${params.toString()}`);
  };

  const handleReload = () => {
    setKeywordInput("");
    router.push("/admin/categories?page=1");
    loadCategories();
  };

  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[14px]">
        <div>
          <h2 className="text-[18px] font-[600]">Quản lý danh mục</h2>
          <p className="text-[13px] text-[#6B7280] mt-[4px]">
            Danh mục dùng để phân loại bài tập
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateDialog}
          className="bg-oj-orange text-oj-white rounded-[8px] px-[14px] py-[9px] text-[14px] font-[500] hover:bg-[#F5965B]"
        >
          + Tạo danh mục
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-[8px] mb-[14px]">
        <input
          type="text"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className={searchClass}
          placeholder="Tìm theo tên danh mục"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="h-[38px] px-[14px] bg-oj-orange text-oj-white rounded-[8px] text-[14px] hover:bg-[#F5965B]"
        >
          Tìm kiếm
        </button>
        <button
          type="button"
          onClick={handleReload}
          className="h-[38px] px-[12px] border border-oj-orange text-oj-orange rounded-[8px] text-[14px] hover:bg-[#FFF5EE]"
        >
          Tải lại
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
      ) : pagedCategories.length === 0 ? (
        <p className="py-[40px] text-center text-[14px] text-[#6B7280]">
          Không có danh mục nào phù hợp.
        </p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="border-b text-left text-[#6B7280]">
                <th className="py-[12px] px-[8px] w-[56px]">#</th>
                <th className="py-[12px] px-[8px]">ID</th>
                <th className="py-[12px] px-[8px]">Tên danh mục</th>
                <th className="py-[12px] px-[8px] w-[160px] text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedCategories.map((category, index) => (
                <tr key={category.id} className="border-b hover:bg-[#FAFAFA]">
                  <td className="py-[12px] px-[8px] text-[#6B7280]">
                    {(pagination.page - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td
                    className="py-[12px] px-[8px] font-mono text-[12px] text-[#6B7280] max-w-[120px] truncate"
                    title={category.id}
                  >
                    {category.id}
                  </td>
                  <td className="py-[12px] px-[8px] font-[500]">
                    {category.title}
                  </td>
                  <td className="py-[12px] px-[8px]">
                    <div className="flex items-center justify-end gap-[6px]">
                      <button
                        type="button"
                        onClick={() => openEditDialog(category)}
                        className="border border-[#D1D5DB] rounded-[6px] px-[8px] py-[5px] text-[13px] hover:border-oj-orange hover:text-oj-orange"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === category.id}
                        onClick={() => handleDelete(category)}
                        className="border border-[#FECACA] text-red-600 rounded-[6px] px-[8px] py-[5px] text-[13px] hover:bg-[#FEF2F2] disabled:opacity-50"
                      >
                        {deletingId === category.id ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && pagination.totalPages > 1 && (
        <Pagination pagination={pagination} basePath="/admin/categories" />
      )}

      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[16px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-oj-white w-full max-w-[440px] rounded-[10px] border border-[#E5E7EB] shadow-lg">
            <div className="px-[20px] py-[16px] border-b border-[#E5E7EB]">
              <h3 className="text-[17px] font-[600]">
                {dialogMode === "create" ? "Tạo danh mục" : "Chỉnh sửa danh mục"}
              </h3>
            </div>
            <div className="px-[20px] py-[16px]">
              <label className="block text-[13px] font-[500] mb-[6px]">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="VD: Dynamic Programming"
                maxLength={100}
              />
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

export function AdminCategoriesPage() {
  return (
    <Suspense
      fallback={
        <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[40px] text-center text-[#6B7280]">
          Đang tải...
        </section>
      }
    >
      <AdminCategoriesPageContent />
    </Suspense>
  );
}
