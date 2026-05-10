"use client";

import { FiMenu } from "react-icons/fi";

export const AdminTopbar = ({
  isSidebarOpen,
  onToggleSidebar,
}: {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}) => {
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
      <div className="text-[14px] text-[#6B7280]">admin@uttoj.local</div>
    </header>
  );
};
