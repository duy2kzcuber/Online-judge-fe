"use client";

import {
  Pagination,
  type PaginationData,
} from "@/app/components/Pagination/Pagination";
import {
  createUser,
  deleteUser,
  fetchRoles,
  fetchUsers,
  updateUser,
} from "@/lib/api/user-api";
import type { Role, User } from "@/lib/api/user-types";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

const inputClass =
  "w-full border border-[#D1D5DB] rounded-[8px] px-[12px] py-[9px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange focus:outline-none";

const searchClass =
  "h-[38px] w-full max-w-[320px] border border-[#D1D5DB] rounded-[8px] px-[10px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange focus:outline-none";

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

function formatRoles(roles?: Role[] | null): string {
  if (!roles?.length) return "—";
  return roles.map((r) => r.name).join(", ");
}

interface CreateFormState {
  username: string;
  password: string;
  email: string;
  fullName: string;
  roleIds: number[];
}

interface EditFormState {
  fullName: string;
  email: string;
  password: string;
  bio: string;
  roleIds: number[];
}

const emptyCreateForm: CreateFormState = {
  username: "",
  password: "",
  email: "",
  fullName: "",
  roleIds: [],
};

const emptyEditForm: EditFormState = {
  fullName: "",
  email: "",
  password: "",
  bio: "",
  roleIds: [],
};

function RoleCheckboxes({
  roles,
  selectedIds,
  onChange,
}: {
  roles: Role[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (roles.length === 0) {
    return <p className="text-[13px] text-[#6B7280]">Không có vai trò nào.</p>;
  }

  return (
    <div className="flex flex-wrap gap-[10px]">
      {roles.map((role) => (
        <label
          key={role.id}
          className="inline-flex items-center gap-[6px] text-[14px] cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(role.id)}
            onChange={() => toggle(role.id)}
            className="accent-oj-orange w-[16px] h-[16px]"
          />
          {role.name}
        </label>
      ))}
    </div>
  );
}

function AdminUsersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const keywordParam = searchParams.get("keyword") ?? "";

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 10,
    totalItems: 0,
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [keywordInput, setKeywordInput] = useState(keywordParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<CreateFormState>(emptyCreateForm);
  const [editForm, setEditForm] = useState<EditFormState>(emptyEditForm);

  useEffect(() => {
    setKeywordInput(keywordParam);
  }, [keywordParam]);

  useEffect(() => {
    fetchRoles()
      .then(setRoles)
      .catch(() => setRoles([]));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUsers(page - 1, PAGE_SIZE);
        if (cancelled) return;

        setUsers(data.content ?? []);
        setPagination({
          page,
          pageSize: data.size ?? PAGE_SIZE,
          totalPages: Math.max(1, data.totalPages ?? 1),
          totalItems: data.totalElements ?? 0,
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách người dùng",
          );
          setUsers([]);
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

  const filteredUsers = useMemo(() => {
    const q = keywordParam.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
    );
  }, [users, keywordParam]);

  const reloadList = async () => {
    const data = await fetchUsers(page - 1, PAGE_SIZE);
    setUsers(data.content ?? []);
    setPagination({
      page,
      pageSize: data.size ?? PAGE_SIZE,
      totalPages: Math.max(1, data.totalPages ?? 1),
      totalItems: data.totalElements ?? 0,
    });
  };

  const defaultUserRoleId = useMemo(() => {
    const userRole = roles.find((r) => r.name === "user");
    return userRole?.id;
  }, [roles]);

  const openCreateDialog = () => {
    setDialogMode("create");
    setEditingUser(null);
    setCreateForm({
      ...emptyCreateForm,
      roleIds: defaultUserRoleId != null ? [defaultUserRoleId] : [],
    });
    setDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setDialogMode("edit");
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      password: "",
      bio: user.bio ?? "",
      roleIds: (user.roles ?? []).map((r) => r.id),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setCreateForm(emptyCreateForm);
    setEditForm(emptyEditForm);
  };

  const handleCreate = async () => {
    if (!createForm.username.trim()) {
      window.alert("Vui lòng nhập username");
      return;
    }
    if (!createForm.password || createForm.password.length < 8) {
      window.alert("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    if (!createForm.email.trim()) {
      window.alert("Vui lòng nhập email");
      return;
    }
    if (!createForm.fullName.trim() || createForm.fullName.trim().length < 5) {
      window.alert("Họ tên phải có ít nhất 5 ký tự");
      return;
    }

    setSaving(true);
    try {
      await createUser({
        username: createForm.username.trim(),
        password: createForm.password,
        email: createForm.email.trim(),
        fullName: createForm.fullName.trim(),
        roleIds:
          createForm.roleIds.length > 0 ? createForm.roleIds : undefined,
      });
      closeDialog();
      await reloadList();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Không thể tạo người dùng",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      const payload: Parameters<typeof updateUser>[1] = {
        fullName: editForm.fullName.trim() || undefined,
        email: editForm.email.trim() || undefined,
        bio: editForm.bio.trim() || undefined,
        roleIds: editForm.roleIds.length > 0 ? editForm.roleIds : undefined,
      };
      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }
      await updateUser(editingUser.id, payload);
      closeDialog();
      await reloadList();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Không thể cập nhật người dùng",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa người dùng "${user.username}"? Hành động không thể hoàn tác.`,
    );
    if (!confirmed) return;

    setDeletingId(user.id);
    try {
      await deleteUser(user.id);
      if (users.length === 1 && page > 1) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(page - 1));
        router.push(`/admin/users?${params.toString()}`);
        return;
      }
      await reloadList();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Không thể xóa người dùng",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keywordInput.trim()) params.set("keyword", keywordInput.trim());
    params.set("page", "1");
    router.push(`/admin/users?${params.toString()}`);
  };

  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[14px]">
        <div>
          <h2 className="text-[18px] font-[600]">Quản lý người dùng</h2>
          <p className="text-[13px] text-[#6B7280] mt-[4px]">
            Danh sách tài khoản trên hệ thống
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateDialog}
          className="bg-oj-orange text-oj-white rounded-[8px] px-[14px] py-[9px] text-[14px] font-[500] hover:bg-[#F5965B]"
        >
          + Tạo người dùng
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-[8px] mb-[14px]">
        <input
          type="text"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className={searchClass}
          placeholder="Lọc username / họ tên / email (trang hiện tại)"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="h-[38px] px-[14px] bg-oj-orange text-oj-white rounded-[8px] text-[14px] hover:bg-[#F5965B]"
        >
          Tìm kiếm
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
      ) : filteredUsers.length === 0 ? (
        <p className="py-[40px] text-center text-[14px] text-[#6B7280]">
          Không có người dùng nào phù hợp.
        </p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="border-b text-left text-[#6B7280]">
                <th className="py-[12px] px-[8px]">ID</th>
                <th className="py-[12px] px-[8px]">Username</th>
                <th className="py-[12px] px-[8px]">Họ tên</th>
                <th className="py-[12px] px-[8px]">Email</th>
                <th className="py-[12px] px-[8px]">Vai trò</th>
                <th className="py-[12px] px-[8px]">Ngày tạo</th>
                <th className="py-[12px] px-[8px] w-[160px] text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-[#FAFAFA]">
                  <td
                    className="py-[12px] px-[8px] font-mono text-[12px] text-[#6B7280] max-w-[100px] truncate"
                    title={user.id}
                  >
                    {user.id}
                  </td>
                  <td className="py-[12px] px-[8px] font-[600]">
                    {user.username}
                  </td>
                  <td className="py-[12px] px-[8px]">{user.fullName ?? "—"}</td>
                  <td className="py-[12px] px-[8px]">{user.email ?? "—"}</td>
                  <td className="py-[12px] px-[8px]">
                    <span className="inline-block bg-[#F3F4F6] text-[#4B5563] text-[12px] px-[8px] py-[3px] rounded-[6px]">
                      {formatRoles(user.roles)}
                    </span>
                  </td>
                  <td className="py-[12px] px-[8px] text-[#6B7280] whitespace-nowrap">
                    {formatDateTime(user.createdAt)}
                  </td>
                  <td className="py-[12px] px-[8px]">
                    <div className="flex items-center justify-end gap-[6px]">
                      <button
                        type="button"
                        onClick={() => openEditDialog(user)}
                        className="border border-[#D1D5DB] rounded-[6px] px-[8px] py-[5px] text-[13px] hover:border-oj-orange hover:text-oj-orange"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === user.id}
                        onClick={() => handleDelete(user)}
                        className="border border-[#FECACA] text-red-600 rounded-[6px] px-[8px] py-[5px] text-[13px] hover:bg-[#FEF2F2] disabled:opacity-50"
                      >
                        {deletingId === user.id ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination pagination={pagination} basePath="/admin/users" />


      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[16px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-oj-white w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-[10px] border border-[#E5E7EB] shadow-lg">
            <div className="px-[20px] py-[16px] border-b border-[#E5E7EB]">
              <h3 className="text-[17px] font-[600]">
                {dialogMode === "create"
                  ? "Tạo người dùng"
                  : `Chỉnh sửa: ${editingUser?.username}`}
              </h3>
            </div>

            <div className="px-[20px] py-[16px] space-y-[14px]">
              {dialogMode === "create" ? (
                <>
                  <div>
                    <label className="block text-[13px] font-[500] mb-[6px]">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.username}
                      onChange={(e) =>
                        setCreateForm((p) => ({
                          ...p,
                          username: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-[500] mb-[6px]">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm((p) => ({
                          ...p,
                          password: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-[500] mb-[6px]">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm((p) => ({ ...p, email: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-[500] mb-[6px]">
                      Họ tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.fullName}
                      onChange={(e) =>
                        setCreateForm((p) => ({
                          ...p,
                          fullName: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-[500] mb-[6px]">
                      Vai trò
                    </label>
                    <RoleCheckboxes
                      roles={roles}
                      selectedIds={createForm.roleIds}
                      onChange={(roleIds) =>
                        setCreateForm((p) => ({ ...p, roleIds }))
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[13px] font-[500] mb-[6px]">
                      Họ tên
                    </label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, fullName: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-[500] mb-[6px]">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, email: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-[500] mb-[6px]">
                      Mật khẩu mới (để trống nếu không đổi)
                    </label>
                    <input
                      type="password"
                      value={editForm.password}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, password: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-[500] mb-[6px]">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, bio: e.target.value }))
                      }
                      className={`${inputClass} min-h-[80px] resize-y`}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-[500] mb-[6px]">
                      Vai trò
                    </label>
                    <RoleCheckboxes
                      roles={roles}
                      selectedIds={editForm.roleIds}
                      onChange={(roleIds) =>
                        setEditForm((p) => ({ ...p, roleIds }))
                      }
                    />
                  </div>
                </>
              )}
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
                onClick={dialogMode === "create" ? handleCreate : handleUpdate}
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

export function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[40px] text-center text-[#6B7280]">
          Đang tải...
        </section>
      }
    >
      <AdminUsersPageContent />
    </Suspense>
  );
}
