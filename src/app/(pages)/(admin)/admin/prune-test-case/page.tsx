const pruneRows = [
  { problemId: "A001", title: "Simple A + B Problem", size: "18 MB", lastUpdate: "2026-04-20" },
  { problemId: "A145", title: "Binary Search Adventure", size: "32 MB", lastUpdate: "2026-04-24" },
  { problemId: "C302", title: "Dynamic Path Finder", size: "45 MB", lastUpdate: "2026-05-02" },
];

export default function AdminPruneTestCasePage() {
  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <div className="flex items-center justify-between mb-[12px]">
        <h2 className="text-[18px] font-[600]">Prune Test Case</h2>
        <button className="border border-[#D1D5DB] rounded-[8px] px-[12px] py-[8px] hover:border-oj-orange hover:text-oj-orange">
          Prune tất cả testcase không dùng
        </button>
      </div>

      <p className="text-[14px] text-[#6B7280] mb-[10px]">
        Danh sách testcase dung lượng lớn để rà soát và dọn dẹp.
      </p>

      <div className="overflow-auto">
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="border-b text-left text-[#6B7280]">
              <th className="py-[12px] px-[8px]">Problem ID</th>
              <th className="py-[12px] px-[8px]">Title</th>
              <th className="py-[12px] px-[8px]">Size</th>
              <th className="py-[12px] px-[8px]">Last Update</th>
            </tr>
          </thead>
          <tbody>
            {pruneRows.map((row) => (
              <tr key={row.problemId} className="border-b hover:bg-[#FAFAFA]">
                <td className="py-[12px] px-[8px] font-[600]">{row.problemId}</td>
                <td className="py-[12px] px-[8px]">{row.title}</td>
                <td className="py-[12px] px-[8px]">{row.size}</td>
                <td className="py-[12px] px-[8px]">{row.lastUpdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
