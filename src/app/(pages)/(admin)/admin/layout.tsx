import type { Metadata } from "next";
import "../../../globals.css";
import { AdminSidebar } from "../../../components/admin/AdminSidebar";
import { AdminTopbar } from "../../../components/admin/AdminTopbar";

export const metadata: Metadata = {
  title: "UTT Online Judge Admin",
  description: "Trang quản trị cho hệ thống chấm bài UTT",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="bg-[#EEEEEE]">
        <AdminSidebar />
        <main className="pl-[250px] min-h-screen">
          <AdminTopbar />
          <div className="p-[20px]">{children}</div>
        </main>
      </body>
    </html>
  );
}
