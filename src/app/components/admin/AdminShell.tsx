"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

export const AdminShell = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <>
      <AdminSidebar isOpen={isSidebarOpen} />
      <main
        className={`min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "pl-[250px]" : "pl-0"
        }`}
      >
        <AdminTopbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <div className="p-[20px]">{children}</div>
      </main>
    </>
  );
};
