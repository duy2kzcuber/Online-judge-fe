const announcements = [
  { id: 1, title: "Lịch bảo trì hệ thống cuối tuần", author: "root", createdAt: "2026-05-01" },
  { id: 2, title: "Mở đăng ký kỳ thi thuật toán tháng 5", author: "admin_contest", createdAt: "2026-05-03" },
  { id: 3, title: "Cập nhật bộ đề luyện tập Dynamic Programming", author: "admin_math", createdAt: "2026-05-05" },
];

export default function AdminAnnouncementPage() {
  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <div className="flex items-center justify-between mb-[12px]">
        <h2 className="text-[18px] font-[600]">Announcement</h2>
        <button className="bg-oj-orange text-oj-white rounded-[8px] px-[12px] py-[8px] hover:bg-[#F5965B]">
          Tạo thông báo
        </button>
      </div>

      <div className="overflow-auto">
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="border-b text-left text-[#6B7280]">
              <th className="py-[12px] px-[8px]">ID</th>
              <th className="py-[12px] px-[8px]">Tiêu đề</th>
              <th className="py-[12px] px-[8px]">Người tạo</th>
              <th className="py-[12px] px-[8px]">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((item) => (
              <tr key={item.id} className="border-b hover:bg-[#FAFAFA]">
                <td className="py-[12px] px-[8px]">{item.id}</td>
                <td className="py-[12px] px-[8px] font-[600]">{item.title}</td>
                <td className="py-[12px] px-[8px]">{item.author}</td>
                <td className="py-[12px] px-[8px]">{item.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
