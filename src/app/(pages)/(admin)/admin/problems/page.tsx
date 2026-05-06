import Link from "next/link";

const problems = [
  {
    id: "A001",
    title: "Simple A + B Problem",
    author: "root",
    createdAt: "2026-04-08",
    visible: "Công khai",
  },
  {
    id: "A145",
    title: "Binary Search Adventure",
    author: "admin_math",
    createdAt: "2026-04-18",
    visible: "Công khai",
  },
  {
    id: "C302",
    title: "Dynamic Path Finder",
    author: "admin_algo",
    createdAt: "2026-04-28",
    visible: "Ẩn",
  },
];

export default function AdminProblemsPage() {
  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <div className="flex items-center justify-between mb-[12px]">
        <h2 className="text-[18px] font-[600]">Problem List</h2>
        <Link
          href="/admin/problems/create"
          className="bg-oj-orange text-oj-white rounded-[8px] px-[12px] py-[8px] hover:bg-[#F5965B]"
        >
          Create Problem
        </Link>
      </div>

      <div className="overflow-auto">
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="border-b text-left text-[#6B7280]">
              <th className="py-[12px] px-[8px]">Display ID</th>
              <th className="py-[12px] px-[8px]">Tiêu đề</th>
              <th className="py-[12px] px-[8px]">Tác giả</th>
              <th className="py-[12px] px-[8px]">Ngày tạo</th>
              <th className="py-[12px] px-[8px]">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr key={problem.id} className="border-b hover:bg-[#FAFAFA]">
                <td className="py-[12px] px-[8px] font-[600]">{problem.id}</td>
                <td className="py-[12px] px-[8px]">{problem.title}</td>
                <td className="py-[12px] px-[8px]">{problem.author}</td>
                <td className="py-[12px] px-[8px]">{problem.createdAt}</td>
                <td className="py-[12px] px-[8px]">{problem.visible}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
