import Link from "next/link";

const FEATURES = [
  {
    title: "Luyện tập bài tập",
    description:
      "Kho bài tập đa dạng theo chủ đề và độ khó, hỗ trợ nộp bài bằng C/C++ với chấm tự động theo test case.",
  },
  {
    title: "Kì thi trực tuyến",
    description:
      "Tham gia các kì thi lập trình có thời gian, theo dõi bảng xếp hạng và kết quả ngay sau khi nộp bài.",
  },
  {
    title: "Theo dõi bài nộp",
    description:
      "Xem lại lịch sử nộp bài, kết quả chấm (AC, WA, TLE, MLE) và chi tiết từng lần submit.",
  },
  {
    title: "Quản lý tài khoản",
    description:
      "Cập nhật ảnh đại diện, mật khẩu và thông tin cá nhân trên hệ thống.",
  },
] as const;

const STEPS = [
  "Đăng nhập bằng tài khoản sinh viên được cấp.",
  "Chọn mục Bài tập để luyện tập hoặc Kì thi để tham gia thi.",
  "Đọc đề bài, viết code và nộp bài — hệ thống chấm tự động và trả kết quả.",
  "Xem lại các bài đã nộp trong mục Các bài tập đã nộp.",
] as const;

export default function AboutPage() {
  return (
    <div className="container pt-[100px] pb-[48px]">
      <section className="mb-[28px] rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[24px] py-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <p className="text-[13px] font-[600] uppercase tracking-wide text-oj-orange mb-[8px]">
          UTT Online Judge
        </p>
        <h1 className="text-[26px] md:text-[32px] font-[700] text-black mb-[12px]">
          Giới thiệu hệ thống
        </h1>
        <p className="text-[15px] md:text-[16px] text-[#4B5563] leading-relaxed max-w-[720px]">
          UTT Online Judge là nền tảng chấm bài lập trình trực tuyến dành cho
          sinh viên Trường Đại học Công nghệ Giao thông Vận tải (UTT). Hệ thống
          hỗ trợ luyện tập thuật toán, tham gia kì thi và theo dõi tiến độ học
          tập một cách minh bạch, nhanh chóng.
        </p>
      </section>

      <div className="grid gap-[20px] lg:grid-cols-2 mb-[28px]">
        <section className="rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[24px] py-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-[600] text-black mb-[14px]">
            Tính năng chính
          </h2>
          <ul className="space-y-[14px]">
            {FEATURES.map((feature) => (
              <li key={feature.title}>
                <h3 className="text-[15px] font-[600] text-black mb-[4px]">
                  {feature.title}
                </h3>
                <p className="text-[14px] text-[#6B7280] leading-relaxed">
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[24px] py-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-[600] text-black mb-[14px]">
            Hướng dẫn sử dụng nhanh
          </h2>
          <ol className="list-decimal list-inside space-y-[10px] text-[14px] text-[#4B5563] leading-relaxed">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <div className="mt-[20px] pt-[16px] border-t border-[#EEEEEE]">
            <h3 className="text-[15px] font-[600] text-black mb-[10px]">
              Truy cập nhanh
            </h3>
            <div className="flex flex-wrap gap-[10px]">
              <Link
                href="/problem"
                className="inline-flex items-center rounded-[8px] border border-[#D1D5DB] px-[14px] py-[8px] text-[14px] text-black hover:border-oj-orange hover:text-oj-orange transition-colors"
              >
                Danh sách bài tập
              </Link>
              <Link
                href="/ki-thi"
                className="inline-flex items-center rounded-[8px] border border-[#D1D5DB] px-[14px] py-[8px] text-[14px] text-black hover:border-oj-orange hover:text-oj-orange transition-colors"
              >
                Kì thi
              </Link>
              <Link
                href="/submissions"
                className="inline-flex items-center rounded-[8px] border border-[#D1D5DB] px-[14px] py-[8px] text-[14px] text-black hover:border-oj-orange hover:text-oj-orange transition-colors"
              >
                Bài nộp của tôi
              </Link>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[8px] border border-[#DEDEDE] bg-oj-white px-[24px] py-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <h2 className="text-[18px] font-[600] text-black mb-[12px]">
          Đối tượng sử dụng
        </h2>
        <div className="grid gap-[16px] md:grid-cols-2 text-[14px] text-[#4B5563] leading-relaxed">
          <div className="rounded-[8px] bg-[#FAFAFA] px-[16px] py-[14px]">
            <p className="font-[600] text-black mb-[6px]">Sinh viên</p>
            <p>
              Luyện tập, nộp bài, tham gia kì thi và xem kết quả chấm chi tiết
              để cải thiện kỹ năng lập trình.
            </p>
          </div>
          <div className="rounded-[8px] bg-[#FAFAFA] px-[16px] py-[14px]">
            <p className="font-[600] text-black mb-[6px]">Giảng viên / Quản trị</p>
            <p>
              Quản lý bài tập, kì thi, người dùng và theo dõi bài nộp của sinh
              viên qua trang quản trị.
            </p>
          </div>
        </div>

        <p className="mt-[20px] text-[13px] text-[#9CA3AF]">
          Mọi thắc mắc về tài khoản hoặc kỹ thuật, vui lòng liên hệ giảng viên
          phụ trách môn học hoặc bộ phận quản trị hệ thống của khoa.
        </p>
      </section>
    </div>
  );
}
