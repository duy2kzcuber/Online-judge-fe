"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChartLine, FaTrophy } from "react-icons/fa";
import { MdGridView, MdKeyboardArrowDown, MdOutlineFormatListBulleted } from "react-icons/md";

const generalChildren = [
  { href: "/admin/users", label: "User" },
  { href: "/admin/announcement", label: "Announcement" },
  { href: "/admin/conf", label: "System Config" },
  { href: "/admin/judge-server", label: "Judge Server" },
  { href: "/admin/prune-test-case", label: "Prune Test Case" },
];

const problemChildren = [
  { href: "/admin/problems", label: "Problem List" },
  { href: "/admin/problems/create", label: "Create Problem" },
  { href: "/admin/problems/import-export", label: "Export Or Import Problem" },
];

const contestChildren = [
  { href: "/admin/contest", label: "Contest List" },
  { href: "/admin/contest/create", label: "Create Contest" },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  const isGeneralSection =
    pathname.startsWith("/admin/users") ||
    pathname.startsWith("/admin/announcement") ||
    pathname.startsWith("/admin/conf") ||
    pathname.startsWith("/admin/judge-server") ||
    pathname.startsWith("/admin/prune-test-case");
  const isProblemSection = pathname.startsWith("/admin/problems");
  const isContestSection = pathname.startsWith("/admin/contest");

  const groupClass = (isActive: boolean) =>
    `flex items-center justify-between px-[12px] py-[10px] rounded-[8px] border text-[15px] ${
      isActive
        ? "border-oj-orange text-oj-orange bg-[#FFF1E9]"
        : "border-transparent text-[#374151]"
    }`;

  const childClass = (isActive: boolean) =>
    `block px-[10px] py-[8px] rounded-[6px] text-[15px] ${
      isActive
        ? "text-oj-orange bg-[#FFF1E9]"
        : "text-[#1F2937] hover:text-oj-orange hover:bg-[#FFF7F2]"
    }`;

  return (
    <aside className="w-[250px] min-h-screen bg-[#FDFDFD] border-r border-[#E5E7EB] px-[14px] py-[16px] fixed left-0 top-0 overflow-y-auto">
      <div className="mb-[14px] flex justify-center">
        <div className="w-[74px] h-[74px] rounded-full border-[3px] border-white bg-[#EAF7FF] text-oj-orange font-[700] flex items-center justify-center shadow-sm">
          UOJ
        </div>
      </div>
      <ul className="grid gap-y-[8px]">
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
            <span>Dashboard</span>
          </Link>
        </li>

        <li>
          <div className={groupClass(isGeneralSection)}>
            <span className="flex items-center gap-[10px]">
              <MdGridView />
              <span>General</span>
            </span>
            <MdKeyboardArrowDown />
          </div>
          <div className="mt-[6px] ml-[10px] border-l border-[#E5E7EB] pl-[10px] grid gap-y-[4px]">
            {generalChildren.map((item) => {
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
        </li>

        <li>
          <div className={groupClass(isProblemSection)}>
            <span className="flex items-center gap-[10px]">
              <MdOutlineFormatListBulleted />
              <span>Problem</span>
            </span>
            <MdKeyboardArrowDown />
          </div>
          <div className="mt-[6px] ml-[10px] border-l border-[#E5E7EB] pl-[10px] grid gap-y-[4px]">
            {problemChildren.map((item) => {
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
        </li>

        <li>
          <div className={groupClass(isContestSection)}>
            <span className="flex items-center gap-[10px]">
              <FaTrophy />
              <span>Contest</span>
            </span>
            <MdKeyboardArrowDown />
          </div>
          <div className="mt-[6px] ml-[10px] border-l border-[#E5E7EB] pl-[10px] grid gap-y-[4px]">
            {contestChildren.map((item) => {
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
        </li>
      </ul>
    </aside>
  );
};
