import "../../globals.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-[url('/bg-login.jpg')]">
        {children}
      </body>
    </html>
  );
}