"use client";

import { useAuth } from "@/contexts/AuthContext";
import { canAccessAdminPath } from "@/lib/auth/admin-access";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AdminAccessGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const canAccess = canAccessAdminPath(user, pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isLoading && isAuthenticated && !canAccess) {
      router.replace("/");
    }
  }, [canAccess, isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#6B7280]">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#6B7280]">
        Đang chuyển hướng...
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#6B7280]">
        Bạn không có quyền truy cập trang này...
      </div>
    );
  }

  return <>{children}</>;
}
