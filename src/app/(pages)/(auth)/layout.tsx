import "../../globals.css";
import { Providers } from "../../providers";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-[url('/bg-login.jpg')]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}