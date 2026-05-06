import Link from "next/link";

export default function AdminCreateProblemPage() {
  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <div className="flex items-center justify-between mb-[14px]">
        <h2 className="text-[18px] font-[600]">Create Problem</h2>
        <Link
          href="/admin/problems"
          className="border border-[#D1D5DB] rounded-[8px] px-[12px] py-[8px] hover:border-oj-orange hover:text-oj-orange"
        >
          Quay lại danh sách
        </Link>
      </div>

      <form className="grid gap-y-[14px]">
        <div className="grid md:grid-cols-3 gap-[12px]">
          <div>
            <label className="block mb-[6px] text-[14px]">Display ID</label>
            <input className="w-full border border-[#D1D5DB] rounded-[8px] h-[40px] px-[10px]" />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-[6px] text-[14px]">Title</label>
            <input className="w-full border border-[#D1D5DB] rounded-[8px] h-[40px] px-[10px]" />
          </div>
        </div>

        <div>
          <label className="block mb-[6px] text-[14px]">Description</label>
          <textarea
            rows={5}
            className="w-full border border-[#D1D5DB] rounded-[8px] px-[10px] py-[8px]"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-[12px]">
          <div>
            <label className="block mb-[6px] text-[14px]">Time Limit (ms)</label>
            <input
              type="number"
              defaultValue={1000}
              className="w-full border border-[#D1D5DB] rounded-[8px] h-[40px] px-[10px]"
            />
          </div>
          <div>
            <label className="block mb-[6px] text-[14px]">Memory Limit (MB)</label>
            <input
              type="number"
              defaultValue={256}
              className="w-full border border-[#D1D5DB] rounded-[8px] h-[40px] px-[10px]"
            />
          </div>
          <div>
            <label className="block mb-[6px] text-[14px]">Difficulty</label>
            <select className="w-full border border-[#D1D5DB] rounded-[8px] h-[40px] px-[10px]">
              <option>Low</option>
              <option>Mid</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-[6px] text-[14px]">Tags</label>
          <input
            placeholder="Ví dụ: dp, graph, greedy"
            className="w-full border border-[#D1D5DB] rounded-[8px] h-[40px] px-[10px]"
          />
        </div>

        <div>
          <label className="block mb-[6px] text-[14px]">Test Case (zip)</label>
          <input
            type="file"
            className="block w-full border border-[#D1D5DB] rounded-[8px] h-[40px] px-[10px] py-[6px]"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="bg-oj-orange text-oj-white rounded-[8px] px-[14px] py-[9px] hover:bg-[#F5965B]"
          >
            Save Problem
          </button>
        </div>
      </form>
    </section>
  );
}
