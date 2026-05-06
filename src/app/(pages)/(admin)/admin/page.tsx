const overviewCards = [
  { label: "Tổng người dùng", value: "1,248" },
  { label: "Bài nộp hôm nay", value: "3,512" },
  { label: "Đề bài công khai", value: "486" },
  { label: "Kỳ thi hoạt động", value: "7" },
];

const releaseNotes = [
  {
    version: "v1.6.0",
    title: "Nâng cấp module chấm bài",
    detail: "Tối ưu thời gian chấm cho ngôn ngữ C++ và Python.",
  },
  {
    version: "v1.5.9",
    title: "Cập nhật quản lý người dùng",
    detail: "Bổ sung kiểm tra dữ liệu đầu vào khi chỉnh sửa quyền.",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-y-[18px]">
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[14px]">
        {overviewCards.map((card) => (
          <article
            key={card.label}
            className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]"
          >
            <div className="text-[14px] text-[#6B7280]">{card.label}</div>
            <div className="text-[28px] font-[700] text-oj-orange mt-[8px]">
              {card.value}
            </div>
          </article>
        ))}
      </section>

      <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
        <h2 className="text-[18px] font-[600] mb-[10px]">Thông tin phiên gần nhất</h2>
        <div className="grid md:grid-cols-2 gap-y-[6px] text-[15px]">
          <div>Thời gian: 2026-05-06 21:43:08</div>
          <div>IP: 192.168.1.8</div>
          <div>OS: Windows 11</div>
          <div>Browser: Chrome 136</div>
        </div>
      </section>

      <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
        <h2 className="text-[18px] font-[600] mb-[10px]">Release Notes</h2>
        <div className="grid gap-y-[10px]">
          {releaseNotes.map((note) => (
            <article
              key={note.version}
              className="border border-[#EFEFEF] rounded-[8px] px-[12px] py-[10px]"
            >
              <div className="text-[14px] text-oj-orange font-[600]">
                {note.version}
              </div>
              <div className="font-[600]">{note.title}</div>
              <div className="text-[14px] text-[#4B5563]">{note.detail}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
