const exportRows = [
  { id: 1, displayId: "A001", title: "Simple A + B Problem", author: "root" },
  { id: 2, displayId: "A145", title: "Binary Search Adventure", author: "admin_math" },
  { id: 3, displayId: "C302", title: "Dynamic Path Finder", author: "admin_algo" },
];

export default function AdminImportExportProblemPage() {
  return (
    <div className="grid gap-y-[14px]">
      <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
        <div className="flex items-center justify-between mb-[10px]">
          <h2 className="text-[18px] font-[600]">Export Problems</h2>
          <button className="bg-oj-orange text-oj-white rounded-[8px] px-[12px] py-[8px] hover:bg-[#F5965B]">
            Export selected
          </button>
        </div>
        <div className="overflow-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="border-b text-left text-[#6B7280]">
                <th className="py-[12px] px-[8px]">#</th>
                <th className="py-[12px] px-[8px]">ID</th>
                <th className="py-[12px] px-[8px]">Display ID</th>
                <th className="py-[12px] px-[8px]">Title</th>
                <th className="py-[12px] px-[8px]">Author</th>
              </tr>
            </thead>
            <tbody>
              {exportRows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-[#FAFAFA]">
                  <td className="py-[12px] px-[8px]">
                    <input type="checkbox" />
                  </td>
                  <td className="py-[12px] px-[8px]">{row.id}</td>
                  <td className="py-[12px] px-[8px]">{row.displayId}</td>
                  <td className="py-[12px] px-[8px]">{row.title}</td>
                  <td className="py-[12px] px-[8px]">{row.author}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
        <h3 className="text-[17px] font-[600] mb-[10px]">Import QDUOJ Problems</h3>
        <div className="flex items-center gap-[10px]">
          <input type="file" className="text-[14px]" />
          <button className="border border-[#D1D5DB] rounded-[8px] px-[12px] py-[8px] hover:border-oj-orange hover:text-oj-orange">
            Upload
          </button>
        </div>
      </section>

      <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
        <h3 className="text-[17px] font-[600] mb-[10px]">Import FPS Problems</h3>
        <div className="flex items-center gap-[10px]">
          <input type="file" className="text-[14px]" />
          <button className="border border-[#D1D5DB] rounded-[8px] px-[12px] py-[8px] hover:border-oj-orange hover:text-oj-orange">
            Upload
          </button>
        </div>
      </section>
    </div>
  );
}
