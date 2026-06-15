"use client";

import { useAuth } from "@/contexts/AuthContext";
import { fetchMyInfo, updatePersonalSettings } from "@/lib/api/user-api";
import { resolveUserAvatarUrl, type User } from "@/lib/api/user-types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const inputClass =
  "w-full border border-[#D1D5DB] rounded-[8px] px-[12px] py-[9px] text-[14px] placeholder:text-[#9CA3AF] hover:border-oj-orange focus:border-oj-orange focus:outline-none";

const readOnlyInputClass = `${inputClass} bg-[#F9FAFB] text-[#6B7280] cursor-not-allowed`;

type ProfileForm = {
  bio: string;
  password: string;
  confirmPassword: string;
};

const emptyForm: ProfileForm = {
  bio: "",
  password: "",
  confirmPassword: "",
};

function buildFormFromProfile(profile: User): ProfileForm {
  return {
    bio: profile.bio ?? "",
    password: "",
    confirmPassword: "",
  };
}

export function AccountProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, applySessionToken, refreshUser } =
    useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMyInfo();
        if (cancelled) return;
        setProfile(data);
        setForm(buildFormFromProfile(data));
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải thông tin cá nhân",
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
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const displayAvatar = avatarPreview || resolveUserAvatarUrl(profile);
  const displayName = useMemo(() => {
    return profile?.fullName?.trim() || profile?.username || "Tài khoản";
  }, [profile?.fullName, profile?.username]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAvatarFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      window.alert("Vui lòng chọn file ảnh hợp lệ");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      window.alert("Ảnh đại diện không được vượt quá 5MB");
      event.target.value = "";
      return;
    }

    setAvatarFile(file);
    setSuccess(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSuccess(null);
    setError(null);

    const bio = form.bio.trim();
    const password = form.password;
    const confirmPassword = form.confirmPassword;

    if (password || confirmPassword) {
      if (password.length < 8) {
        setError("Mật khẩu mới phải có ít nhất 8 ký tự");
        return;
      }
      if (password !== confirmPassword) {
        setError("Mật khẩu xác nhận không khớp");
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Parameters<typeof updatePersonalSettings>[0] = {
        bio,
      };

      if (password) {
        payload.password = password;
      }

      const { user, token } = await updatePersonalSettings(payload, avatarFile);
      setProfile(user);
      setForm(buildFormFromProfile(user));
      setAvatarFile(null);

      if (token) {
        await applySessionToken(token);
      } else {
        await refreshUser();
      }

      setSuccess("Cập nhật thông tin cá nhân thành công");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể cập nhật thông tin",
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container pt-[100px] pb-[40px] text-center text-gray-500 text-[14px]">
        Đang tải thông tin...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container pt-[100px] pb-[40px]">
        <div className="rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[24px] py-[32px] text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <h1 className="text-[20px] font-[700] text-black mb-[8px]">
            Thông tin cá nhân
          </h1>
          <p className="text-[14px] text-gray-600 mb-[16px]">
            Vui lòng đăng nhập để quản lý thông tin tài khoản.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-[8px] bg-oj-orange px-[20px] py-[10px] text-[14px] text-white hover:opacity-90 transition-opacity"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container pt-[100px] pb-[40px]">
      <div className="mb-[24px]">
        <h1 className="text-[24px] font-[700] text-black mb-[8px]">
          Thông tin cá nhân
        </h1>
        <p className="text-[14px] text-gray-600">
          Cập nhật ảnh đại diện, giới thiệu bản thân và mật khẩu của bạn.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-[720px] rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[24px] py-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
      >
        {error && (
          <p className="mb-[16px] rounded-[8px] border border-red-200 bg-red-50 px-[12px] py-[10px] text-[14px] text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-[16px] rounded-[8px] border border-green-200 bg-green-50 px-[12px] py-[10px] text-[14px] text-green-700">
            {success}
          </p>
        )}

        <section className="mb-[24px]">
          <h2 className="text-[16px] font-[600] mb-[12px]">Ảnh đại diện</h2>
          <div className="flex flex-wrap items-center gap-[16px]">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={displayName}
                className="h-[88px] w-[88px] rounded-full object-cover border border-[#DEDEDE]"
              />
            ) : (
              <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-oj-orange text-[28px] font-[600] text-white uppercase">
                {displayName.charAt(0)}
              </span>
            )}
            <div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-[8px] border border-[#D1D5DB] px-[14px] py-[8px] text-[14px] hover:border-oj-orange hover:text-oj-orange">
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
              <p className="mt-[8px] text-[12px] text-[#6B7280]">
                JPG, PNG hoặc GIF. Tối đa 5MB.
              </p>
              {avatarFile && (
                <button
                  type="button"
                  onClick={() => setAvatarFile(null)}
                  className="mt-[6px] text-[13px] text-oj-orange hover:underline"
                >
                  Hủy ảnh đã chọn
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mb-[24px] grid gap-[14px]">
          <h2 className="text-[16px] font-[600]">Thông tin tài khoản</h2>
          <p className="text-[13px] text-[#6B7280] -mt-[8px]">
            Họ tên và email do quản trị viên quản lý, bạn không thể tự thay đổi.
          </p>

          <div>
            <label className="mb-[6px] block text-[14px] text-[#374151]">
              Mã sinh viên / Username
            </label>
            <input
              type="text"
              value={profile?.username ?? ""}
              readOnly
              disabled
              className={readOnlyInputClass}
            />
          </div>

          <div>
            <label className="mb-[6px] block text-[14px] text-[#374151]">
              Họ tên
            </label>
            <input
              type="text"
              value={profile?.fullName ?? ""}
              readOnly
              disabled
              className={readOnlyInputClass}
              placeholder="—"
            />
          </div>

          <div>
            <label className="mb-[6px] block text-[14px] text-[#374151]">
              Email
            </label>
            <input
              type="email"
              value={profile?.email ?? ""}
              readOnly
              disabled
              className={readOnlyInputClass}
              placeholder="—"
            />
          </div>

          {/* <div>
            <label className="mb-[6px] block text-[14px] text-[#374151]">
              Giới thiệu
            </label>
            <textarea
              value={form.bio}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              className={`${inputClass} min-h-[96px] resize-y`}
              placeholder="Một vài dòng về bạn (tuỳ chọn)"
              maxLength={2000}
            />
          </div> */}
        </section>

        <section className="mb-[24px] grid gap-[14px]">
          <h2 className="text-[16px] font-[600]">Đổi mật khẩu</h2>
          <p className="text-[13px] text-[#6B7280] -mt-[8px]">
            Để trống nếu bạn không muốn thay đổi mật khẩu.
          </p>

          <div>
            <label className="mb-[6px] block text-[14px] text-[#374151]">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              className={inputClass}
              placeholder="Ít nhất 8 ký tự"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="mb-[6px] block text-[14px] text-[#374151]">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              className={inputClass}
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
            />
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-[10px]">
          <button
            type="submit"
            disabled={saving}
            className="rounded-[8px] bg-oj-orange px-[18px] py-[10px] text-[14px] font-[500] text-white hover:bg-[#F5965B] disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
