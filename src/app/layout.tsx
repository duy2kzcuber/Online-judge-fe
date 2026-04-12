import type { Metadata } from "next";
import "../app/globals.css";
import { Header } from "./components/header/Header";


export const metadata: Metadata = {
  title: "UTT Online Judge",
  description: "Trang web chấm bài cho sinh viên UTT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
    >
      <body className="bg-[#EEEEEE]">
        <Header/>
        {children}
      </body>
    </html>
  );
}
