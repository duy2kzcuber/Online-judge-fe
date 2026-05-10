import type { Metadata } from "next";
import "../../../globals.css";
import { AdminShell } from "../../../components/admin/AdminShell";

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
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
