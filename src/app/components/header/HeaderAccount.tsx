import Link from "next/link"

export const HeaderAccount = () => {
  const isLogin = false;
  return (
    <>
      {/* If user is not logged on, display login button */}
      {
        !isLogin && (
          <div className="flex items-center justify-center">
            <Link href="/login" className="border-[0.8px] rounded-[20px] px-[15px] py-[6px] hover:border-oj-orange hover:text-oj-orange text-[12px] md:text-[16px]">Đăng nhập</Link>
          </div>
        )
      }

    </>
  )
}