"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMenu } from "react-icons/fi";

export const AdminTopbar = ({
  isSidebarOpen,
  onToggleSidebar,
}: {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const displayName = user?.username ?? "Tài khoản";
  const displayEmail = user?.email ?? displayName;

  return (
    <header className="h-[64px] bg-[#FDFDFD] border-b border-[#E5E7EB] px-[24px] flex items-center justify-between">
      <div className="flex items-center gap-[12px]">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="h-[38px] w-[38px] border border-[#D1D5DB] rounded-[8px] flex items-center justify-center hover:border-oj-orange hover:text-oj-orange"
          aria-label={isSidebarOpen ? "Đóng sidebar" : "Mở sidebar"}
          title={isSidebarOpen ? "Đóng sidebar" : "Mở sidebar"}
        >
          <FiMenu />
        </button>
        <h1 className="text-[20px] font-[600]">Quản trị hệ thống</h1>
      </div>
      <div className="flex items-center gap-[16px]">
        <span className="text-[14px] text-[#6B7280]">{displayEmail}</span>
        <Link
          href="/"
          className="text-[14px] text-[#374151] hover:text-oj-orange transition-colors"
        >
          Về trang chủ
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="text-[14px] text-oj-orange hover:underline"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
};
