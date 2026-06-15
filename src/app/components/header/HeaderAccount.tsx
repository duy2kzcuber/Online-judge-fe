"use client";

import { useAuth } from "@/contexts/AuthContext";
import { canAccessAnyAdminRoute, getFirstAccessibleAdminPath } from "@/lib/auth/admin-access";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import type { ReactNode } from "react";

const menuLinkClass =
  "block w-full px-[16px] py-[10px] text-[14px] font-[500] text-black hover:text-oj-orange hover:bg-[#FFF5EE] transition-colors";

const pillButtonClass =
  "border-[0.8px] border-[#DEDEDE] rounded-[20px] text-[12px] md:text-[16px] text-black hover:border-oj-orange hover:text-oj-orange transition-colors";

function AccountSlot({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center min-w-[100px]">{children}</div>
  );
}

export const HeaderAccount = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <AccountSlot>
        <span className="text-[12px] md:text-[14px] text-gray-400">...</span>
      </AccountSlot>
    );
  }

  if (!isAuthenticated) {
    return (
      <AccountSlot>
        <Link href="/login" className={`${pillButtonClass} px-[15px] py-[6px]`}>
          Đăng nhập
        </Link>
      </AccountSlot>
    );
  }

  const displayName =
    user?.fullName?.trim() || user?.username || "Tài khoản";
  const adminHref = getFirstAccessibleAdminPath(user);
  const showAdminLink = canAccessAnyAdminRoute(user);
  return (
    <AccountSlot>
      <div className="relative group">
        <button
          type="button"
          className={`${pillButtonClass} flex items-center gap-[8px] pl-[6px] pr-[12px] py-[4px] text-[12px] md:text-[14px]`}
          aria-haspopup="true"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="h-[32px] w-[32px] rounded-full object-cover border border-[#DEDEDE]"
            />
          ) : (
            <span className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-oj-orange text-[13px] font-[600] text-white uppercase">
              {displayName.charAt(0)}
            </span>
          )}
          <span className="inline max-w-[100px] sm:max-w-[120px] truncate font-[500] text-[12px] md:text-[14px]">
            {displayName}
          </span>
          <FiChevronDown className="shrink-0 text-[16px]" />
        </button>

        <ul
          className="absolute top-[calc(100%+8px)] right-0 z-[999] min-w-[220px] overflow-hidden rounded-[8px] border border-[#DEDEDE] bg-oj-white py-[6px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] opacity-0 invisible translate-y-[-4px] transition-all duration-200 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0"
          role="menu"
        >
          <li role="none">
            <Link href="/" className={menuLinkClass} role="menuitem">
              Trang chủ
            </Link>
          </li>
          <li role="none">
            <Link href="/problem" className={menuLinkClass} role="menuitem">
              Bài tập
            </Link>
          </li>
          <li role="none">
            <Link href="#" className={menuLinkClass} role="menuitem">
              Các bài tập đã nộp
            </Link>
          </li>
          {showAdminLink && adminHref && (
            <li role="none">
              <Link href={adminHref} className={menuLinkClass} role="menuitem">
                Trang quản trị
              </Link>
            </li>
          )}
          <li className="my-[4px] border-t border-[#DEDEDE]" role="separator" />
          <li role="none">
            <button
              type="button"
              onClick={handleLogout}
              className={`${menuLinkClass} text-left text-oj-orange`}
              role="menuitem"
            >
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </AccountSlot>
  );
};
