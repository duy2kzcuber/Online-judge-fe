"use client";

import { useAuth } from "@/contexts/AuthContext";
import type { AuthUser } from "@/lib/api/types";
import { canAccessAdminPath } from "@/lib/auth/admin-access";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChartLine, FaTrophy } from "react-icons/fa";
import { MdGridView, MdKeyboardArrowDown, MdOutlineFormatListBulleted } from "react-icons/md";

const generalChildren = [
  { href: "/admin/users", label: "Quản lý Người dùng" },
  { href: "/admin/roles", label: "Quản lý vai trò & quyền" },
  { href: "/admin/announcement", label: "Quản lý bài viết" },
];

const problemChildren = [
  { href: "/admin/problems", label: "Danh sách bài tập" },
  { href: "/admin/problems/create", label: "Tạo bài tập" },
  { href: "/admin/categories", label: "Quản lý danh mục" },
];

const contestChildren = [
  { href: "/admin/contest", label: "Danh sách kì thi" },
  { href: "/admin/contest/create", label: "Tạo kì thi" },
];

type NavItem = { href: string; label: string };

function filterNavItems(items: NavItem[], user: AuthUser | null) {
  return items.filter((item) => canAccessAdminPath(user, item.href));
}

export const AdminSidebar = ({ isOpen }: { isOpen: boolean }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const visibleGeneralChildren = useMemo(
    () => filterNavItems(generalChildren, user),
    [user],
  );
  const visibleProblemChildren = useMemo(
    () => filterNavItems(problemChildren, user),
    [user],
  );
  const visibleContestChildren = useMemo(
    () => filterNavItems(contestChildren, user),
    [user],
  );
  const showDashboard = canAccessAdminPath(user, "/admin");

  const isGeneralSection =
    pathname.startsWith("/admin/users") ||
    pathname.startsWith("/admin/roles") ||
    pathname.startsWith("/admin/announcement") ||
    pathname.startsWith("/admin/conf") ||
    pathname.startsWith("/admin/judge-server") ||
    pathname.startsWith("/admin/prune-test-case");
  const isProblemSection =
    pathname.startsWith("/admin/problems") ||
    pathname.startsWith("/admin/categories");
  const isContestSection = pathname.startsWith("/admin/contest");
  const [generalOpen, setGeneralOpen] = useState(isGeneralSection);
  const [problemOpen, setProblemOpen] = useState(isProblemSection);
  const [contestOpen, setContestOpen] = useState(isContestSection);

  useEffect(() => {
    if (isGeneralSection) setGeneralOpen(true);
    if (isProblemSection) setProblemOpen(true);
    if (isContestSection) setContestOpen(true);
  }, [isGeneralSection, isProblemSection, isContestSection]);

  const groupClass = (isActive: boolean) =>
    `flex items-center justify-between px-[12px] py-[10px] rounded-[8px] border text-[15px] hover:border-oj-orange hover:text-oj-orange ${
      isActive
        ? "border-oj-orange text-oj-orange bg-[#FFF1E9]"
        : "border-transparent text-[#374151] hover:border-oj-orange hover:text-oj-orange"
    }`;

  const childClass = (isActive: boolean) =>
    `block px-[10px] py-[8px] rounded-[6px] text-[15px] ${
      isActive
        ? "text-oj-orange bg-[#FFF1E9]"
        : "text-[#1F2937] hover:text-oj-orange hover:bg-[#FFF7F2]"
    }`;

  return (
    <aside
      className={`w-[250px] min-h-screen bg-[#FDFDFD] border-r border-[#E5E7EB] px-[14px] py-[16px] fixed left-0 top-0 overflow-y-auto transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mb-[14px] flex justify-center">
        <div className="w-[74px] h-[74px] rounded-full border-[3px] border-white bg-[#EAF7FF] text-oj-orange font-[700] flex items-center justify-center shadow-sm">
          UTTOJ
        </div>
      </div>
      <ul className="grid gap-y-[8px]">
        {showDashboard && (
          <li>
            <Link
              href="/admin"
              className={`flex items-center gap-[10px] px-[12px] py-[10px] rounded-[8px] border text-[15px] ${
                pathname === "/admin"
                  ? "border-oj-orange text-oj-orange bg-[#FFF1E9]"
                  : "border-transparent hover:border-[#F3D3BF] hover:text-oj-orange"
              }`}
            >
              <span>
                <FaChartLine />
              </span>
              <span>Tổng quan</span>
            </Link>
          </li>
        )}

        {visibleGeneralChildren.length > 0 && (
        <li>
          <button
            type="button"
            onClick={() => setGeneralOpen((prev) => !prev)}
            className={`${groupClass(isGeneralSection)} w-full`}
          >
            <span className="flex items-center gap-[10px]">
              <MdGridView />
              <span>Cài đặt chung</span>
            </span>
            <MdKeyboardArrowDown
              className={`transition-transform duration-200 ${
                generalOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
          {generalOpen && (
            <div className="mt-[6px] ml-[10px] border-l border-[#E5E7EB] pl-[10px] grid gap-y-[4px]">
              {visibleGeneralChildren.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={childClass(isActive)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </li>
        )}

        {visibleProblemChildren.length > 0 && (
        <li>
          <button
            type="button"
            onClick={() => setProblemOpen((prev) => !prev)}
            className={`${groupClass(isProblemSection)} w-full`}
          >
            <span className="flex items-center gap-[10px]">
              <MdOutlineFormatListBulleted />
              <span>Bài tập</span>
            </span>
            <MdKeyboardArrowDown
              className={`transition-transform duration-200 ${
                problemOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
          {problemOpen && (
            <div className="mt-[6px] ml-[10px] border-l border-[#E5E7EB] pl-[10px] grid gap-y-[4px]">
              {visibleProblemChildren.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={childClass(isActive)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </li>
        )}

        {visibleContestChildren.length > 0 && (
        <li>
          <button
            type="button"
            onClick={() => setContestOpen((prev) => !prev)}
            className={`${groupClass(isContestSection)} w-full`}
          >
            <span className="flex items-center gap-[10px]">
              <FaTrophy />
              <span>Kì thi</span>
            </span>
            <MdKeyboardArrowDown
              className={`transition-transform duration-200 ${
                contestOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
          {contestOpen && (
            <div className="mt-[6px] ml-[10px] border-l border-[#E5E7EB] pl-[10px] grid gap-y-[4px]">
              {visibleContestChildren.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={childClass(isActive)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </li>
        )}
      </ul>
    </aside>
  );
};
