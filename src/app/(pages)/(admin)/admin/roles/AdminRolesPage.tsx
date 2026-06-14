"use client";

import {
  createPermission,
  createRole,
  deleteRole,
  fetchPermissions,
  fetchRoleList,
  updateRole,
} from "@/lib/api/role-api";
import type { Permission, RoleDetail } from "@/lib/api/role-types";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";

const inputClass =
  "w-full border border-[#D1D5DB] rounded-[8px] px-[12px] py-[9px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange focus:outline-none";

const searchClass =
  "h-[38px] w-full max-w-[320px] border border-[#D1D5DB] rounded-[8px] px-[10px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange focus:outline-none";

const PROTECTED_ROLES = new Set(["admin", "user"]);

interface RoleFormState {
  name: string;
  permissionIds: number[];
}

interface PermissionFormState {
  value: string;
  label: string;
}

const emptyRoleForm: RoleFormState = { name: "", permissionIds: [] };
const emptyPermissionForm: PermissionFormState = { value: "", label: "" };

function PermissionCheckboxes({
  permissions,
  selectedIds,
  onChange,
}: {
  permissions: Permission[];
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

  if (permissions.length === 0) {
    return (
      <p className="text-[13px] text-[#6B7280]">
        Chưa có quyền nào. Hãy tạo quyền ở bảng bên dưới trước.
      </p>
    );
  }

  return (
    <div className="grid gap-[8px] max-h-[240px] overflow-y-auto pr-[4px]">
      {permissions.map((permission) => (
        <label
          key={permission.id}
          className="flex items-start gap-[8px] p-[8px] rounded-[6px] border border-[#E5E7EB] hover:border-oj-orange cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(permission.id)}
            onChange={() => toggle(permission.id)}
            className="accent-oj-orange w-[16px] h-[16px] mt-[2px]"
          />
          <span>
            <span className="block text-[14px] font-[500]">{permission.label}</span>
            <span className="block text-[12px] text-[#6B7280] font-mono">
              {permission.value}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}

function formatPermissionLabels(
  permissionIds: number[] | null | undefined,
  permissionMap: Map<number, Permission>,
): string {
  if (!permissionIds?.length) return "—";
  return permissionIds
    .map((id) => {
      const permission = permissionMap.get(id);
      return permission ? permission.label : `#${id}`;
    })
    .join(", ");
}

export function AdminRolesPage() {
  const { applySessionToken } = useAuth();
  const [roles, setRoles] = useState<RoleDetail[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roleKeyword, setRoleKeyword] = useState("");
  const [permissionKeyword, setPermissionKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleDialogMode, setRoleDialogMode] = useState<"create" | "edit">("create");
  const [editingRole, setEditingRole] = useState<RoleDetail | null>(null);
  const [roleForm, setRoleForm] = useState<RoleFormState>(emptyRoleForm);

  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [permissionForm, setPermissionForm] =
    useState<PermissionFormState>(emptyPermissionForm);

  const permissionMap = useMemo(
    () => new Map(permissions.map((p) => [p.id, p])),
    [permissions],
  );

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roleList, permissionList] = await Promise.all([
        fetchRoleList(),
        fetchPermissions(),
      ]);
      setRoles(roleList);
      setPermissions(permissionList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải dữ liệu phân quyền",
      );
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRoles = useMemo(() => {
    const q = roleKeyword.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((role) => role.name.toLowerCase().includes(q));
  }, [roles, roleKeyword]);

  const filteredPermissions = useMemo(() => {
    const q = permissionKeyword.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.value.toLowerCase().includes(q),
    );
  }, [permissions, permissionKeyword]);

  const openCreateRoleDialog = () => {
    setRoleDialogMode("create");
    setEditingRole(null);
    setRoleForm(emptyRoleForm);
    setRoleDialogOpen(true);
  };

  const openEditRoleDialog = (role: RoleDetail) => {
    setRoleDialogMode("edit");
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      permissionIds: [...(role.permissionIds ?? [])],
    });
    setRoleDialogOpen(true);
  };

  const closeRoleDialog = () => {
    setRoleDialogOpen(false);
    setEditingRole(null);
    setRoleForm(emptyRoleForm);
  };

  const handleSaveRole = async () => {
    if (!roleForm.name.trim()) {
      window.alert("Vui lòng nhập tên vai trò");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: roleForm.name.trim(),
        permissionIds: roleForm.permissionIds,
      };
      if (roleDialogMode === "create") {
        await createRole(payload);
      } else if (editingRole) {
        const { token } = await updateRole(editingRole.id, payload);
        if (token) {
          await applySessionToken(token);
        }
      }
      closeRoleDialog();
      await loadData();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Không thể lưu vai trò",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (role: RoleDetail) => {
    if (PROTECTED_ROLES.has(role.name.toLowerCase())) {
      window.alert(`Không thể xóa vai trò hệ thống "${role.name}"`);
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa vai trò "${role.name}"?`,
    );
    if (!confirmed) return;

    setDeletingRoleId(role.id);
    try {
      await deleteRole(role.id);
      await loadData();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Không thể xóa vai trò",
      );
    } finally {
      setDeletingRoleId(null);
    }
  };

  // const openCreatePermissionDialog = () => {
  //   setPermissionForm(emptyPermissionForm);
  //   setPermissionDialogOpen(true);
  // };

  const closePermissionDialog = () => {
    setPermissionDialogOpen(false);
    setPermissionForm(emptyPermissionForm);
  };

  const handleCreatePermission = async () => {
    if (!permissionForm.value.trim()) {
      window.alert("Vui lòng nhập mã quyền (value)");
      return;
    }
    if (!permissionForm.label.trim()) {
      window.alert("Vui lòng nhập tên hiển thị (label)");
      return;
    }

    setSaving(true);
    try {
      await createPermission({
        value: permissionForm.value.trim().toUpperCase(),
        label: permissionForm.label.trim(),
      });
      closePermissionDialog();
      await loadData();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Không thể tạo quyền",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-[20px]">
      <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
        <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[14px]">
          <div>
            <h2 className="text-[18px] font-[600]">Quản lý vai trò</h2>
            <p className="text-[13px] text-[#6B7280] mt-[4px]">
              Gán quyền cho từng vai trò trên hệ thống
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateRoleDialog}
            className="bg-oj-orange text-oj-white rounded-[8px] px-[14px] py-[9px] text-[14px] font-[500] hover:bg-[#F5965B]"
          >
            + Tạo vai trò
          </button>
        </div>

        <div className="mb-[14px]">
          <input
            type="text"
            value={roleKeyword}
            onChange={(e) => setRoleKeyword(e.target.value)}
            className={searchClass}
            placeholder="Lọc theo tên vai trò"
          />
        </div>

        {loading ? (
          <p className="py-[40px] text-center text-[14px] text-[#6B7280]">
            Đang tải...
          </p>
        ) : error ? (
          <p className="py-[40px] text-center text-[14px] text-red-600" role="alert">
            {error}
          </p>
        ) : filteredRoles.length === 0 ? (
          <p className="py-[40px] text-center text-[14px] text-[#6B7280]">
            Không có vai trò nào phù hợp.
          </p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b text-left text-[#6B7280]">
                  <th className="py-[12px] px-[8px]">ID</th>
                  <th className="py-[12px] px-[8px]">Tên vai trò</th>
                  <th className="py-[12px] px-[8px]">Quyền được gán</th>
                  <th className="py-[12px] px-[8px] w-[160px] text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="border-b hover:bg-[#FAFAFA]">
                    <td className="py-[12px] px-[8px]">{role.id}</td>
                    <td className="py-[12px] px-[8px] font-[600]">{role.name}</td>
                    <td className="py-[12px] px-[8px] text-[#4B5563]">
                      {formatPermissionLabels(role.permissionIds, permissionMap)}
                    </td>
                    <td className="py-[12px] px-[8px]">
                      <div className="flex items-center justify-end gap-[6px]">
                        <button
                          type="button"
                          onClick={() => openEditRoleDialog(role)}
                          className="border border-[#D1D5DB] rounded-[6px] px-[8px] py-[5px] text-[13px] hover:border-oj-orange hover:text-oj-orange"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          disabled={
                            deletingRoleId === role.id ||
                            PROTECTED_ROLES.has(role.name.toLowerCase())
                          }
                          onClick={() => handleDeleteRole(role)}
                          className="border border-[#FECACA] text-red-600 rounded-[6px] px-[8px] py-[5px] text-[13px] hover:bg-[#FEF2F2] disabled:opacity-50"
                        >
                          {deletingRoleId === role.id ? "Đang xóa..." : "Xóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
        <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[14px]">
          <div>
            <h2 className="text-[18px] font-[600]">Danh mục quyền</h2>
            <p className="text-[13px] text-[#6B7280] mt-[4px]">
              Các quyền có thể gán cho vai trò (ví dụ: CREATE_USER, CREATE_POST)
            </p>
          </div>
          {/* <button
            type="button"
            onClick={openCreatePermissionDialog}
            className="bg-oj-orange text-oj-white rounded-[8px] px-[14px] py-[9px] text-[14px] font-[500] hover:bg-[#F5965B]"
          >
            + Tạo quyền
          </button> */}
        </div>

        <div className="mb-[14px]">
          <input
            type="text"
            value={permissionKeyword}
            onChange={(e) => setPermissionKeyword(e.target.value)}
            className={searchClass}
            placeholder="Lọc theo tên hoặc mã quyền"
          />
        </div>

        {loading ? (
          <p className="py-[24px] text-center text-[14px] text-[#6B7280]">
            Đang tải...
          </p>
        ) : filteredPermissions.length === 0 ? (
          <p className="py-[24px] text-center text-[14px] text-[#6B7280]">
            Chưa có quyền nào.
          </p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b text-left text-[#6B7280]">
                  <th className="py-[12px] px-[8px]">ID</th>
                  <th className="py-[12px] px-[8px]">Mã quyền</th>
                  <th className="py-[12px] px-[8px]">Tên hiển thị</th>
                </tr>
              </thead>
              <tbody>
                {filteredPermissions.map((permission) => (
                  <tr key={permission.id} className="border-b hover:bg-[#FAFAFA]">
                    <td className="py-[12px] px-[8px]">{permission.id}</td>
                    <td className="py-[12px] px-[8px] font-mono text-[13px]">
                      {permission.value}
                    </td>
                    <td className="py-[12px] px-[8px]">{permission.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {roleDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[16px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-oj-white w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-[10px] border border-[#E5E7EB] shadow-lg">
            <div className="px-[20px] py-[16px] border-b border-[#E5E7EB]">
              <h3 className="text-[17px] font-[600]">
                {roleDialogMode === "create"
                  ? "Tạo vai trò"
                  : `Chỉnh sửa vai trò: ${editingRole?.name}`}
              </h3>
            </div>

            <div className="px-[20px] py-[16px] space-y-[14px]">
              <div>
                <label className="block text-[13px] font-[500] mb-[6px]">
                  Tên vai trò <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) =>
                    setRoleForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="vd: editor, moderator"
                  disabled={
                    roleDialogMode === "edit" &&
                    !!editingRole &&
                    PROTECTED_ROLES.has(editingRole.name.toLowerCase())
                  }
                />
              </div>
              <div>
                <label className="block text-[13px] font-[500] mb-[6px]">
                  Quyền
                </label>
                <PermissionCheckboxes
                  permissions={permissions}
                  selectedIds={roleForm.permissionIds}
                  onChange={(permissionIds) =>
                    setRoleForm((prev) => ({ ...prev, permissionIds }))
                  }
                />
              </div>
            </div>

            <div className="px-[20px] py-[14px] border-t border-[#E5E7EB] flex justify-end gap-[8px]">
              <button
                type="button"
                onClick={closeRoleDialog}
                disabled={saving}
                className="h-[38px] px-[14px] border border-[#D1D5DB] rounded-[8px] text-[14px] hover:bg-[#F9FAFB] disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                disabled={saving}
                className="h-[38px] px-[16px] bg-oj-orange text-oj-white rounded-[8px] text-[14px] hover:bg-[#F5965B] disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {permissionDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[16px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-oj-white w-full max-w-[480px] rounded-[10px] border border-[#E5E7EB] shadow-lg">
            <div className="px-[20px] py-[16px] border-b border-[#E5E7EB]">
              <h3 className="text-[17px] font-[600]">Tạo quyền mới</h3>
            </div>

            <div className="px-[20px] py-[16px] space-y-[14px]">
              <div>
                <label className="block text-[13px] font-[500] mb-[6px]">
                  Mã quyền (value) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={permissionForm.value}
                  onChange={(e) =>
                    setPermissionForm((prev) => ({
                      ...prev,
                      value: e.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="vd: CREATE_USER"
                />
              </div>
              <div>
                <label className="block text-[13px] font-[500] mb-[6px]">
                  Tên hiển thị (label) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={permissionForm.label}
                  onChange={(e) =>
                    setPermissionForm((prev) => ({
                      ...prev,
                      label: e.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="vd: Tạo người dùng"
                />
              </div>
            </div>

            <div className="px-[20px] py-[14px] border-t border-[#E5E7EB] flex justify-end gap-[8px]">
              <button
                type="button"
                onClick={closePermissionDialog}
                disabled={saving}
                className="h-[38px] px-[14px] border border-[#D1D5DB] rounded-[8px] text-[14px] hover:bg-[#F9FAFB] disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreatePermission}
                disabled={saving}
                className="h-[38px] px-[16px] bg-oj-orange text-oj-white rounded-[8px] text-[14px] hover:bg-[#F5965B] disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
