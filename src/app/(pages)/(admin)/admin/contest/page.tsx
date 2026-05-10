import Link from "next/link";

const contests = [
  {
    id: 1,
    title: "Kì thi thuật toán UTT — Vòng loại",
    rule: "ACM",
    start: "2026-05-15 08:00",
    end: "2026-05-15 12:00",
    visible: "Công khai",
  },
  {
    id: 2,
    title: "Practice Contest — Dynamic Programming",
    rule: "OI",
    start: "2026-05-20 14:00",
    end: "2026-05-20 18:00",
    visible: "Ẩn",
  },
];

export default function AdminContestListPage() {
  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[14px]">
        <h2 className="text-[18px] font-[600]">Danh sách kì thi</h2>
        <Link
          href="/admin/contest/create"
          className="bg-oj-orange text-oj-white rounded-[8px] px-[14px] py-[9px] text-[14px] font-[500] hover:bg-[#F5965B]"
        >
          Tạo kì thi
        </Link>
      </div>

      <div className="overflow-auto">
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="border-b text-left text-[#6B7280]">
              <th className="py-[12px] px-[8px]">ID</th>
              <th className="py-[12px] px-[8px]">Tiêu đề</th>
              <th className="py-[12px] px-[8px]">Luật</th>
              <th className="py-[12px] px-[8px]">Bắt đầu</th>
              <th className="py-[12px] px-[8px]">Kết thúc</th>
              <th className="py-[12px] px-[8px]">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {contests.map((c) => (
              <tr key={c.id} className="border-b hover:bg-[#FAFAFA]">
                <td className="py-[12px] px-[8px]">{c.id}</td>
                <td className="py-[12px] px-[8px] font-[500]">{c.title}</td>
                <td className="py-[12px] px-[8px]">{c.rule}</td>
                <td className="py-[12px] px-[8px]">{c.start}</td>
                <td className="py-[12px] px-[8px]">{c.end}</td>
                <td className="py-[12px] px-[8px]">{c.visible}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
