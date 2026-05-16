"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const HeaderAccount = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-w-[100px]">
        <span className="text-[12px] md:text-[14px] text-gray-400">...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center">
        <Link
          href="/login"
          className="border-[0.8px] rounded-[20px] px-[15px] py-[6px] hover:border-oj-orange hover:text-oj-orange text-[12px] md:text-[16px]"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        onClick={handleLogout}
        className="border-[0.8px] rounded-[20px] px-[15px] py-[6px] hover:border-oj-orange hover:text-oj-orange text-[12px] md:text-[16px]"
      >
        Đăng xuất
      </button>
    </div>
  );
};
