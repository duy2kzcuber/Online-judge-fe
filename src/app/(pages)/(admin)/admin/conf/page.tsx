export default function AdminConfPage() {
  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <h2 className="text-[18px] font-[600] mb-[12px]">System Config</h2>

      <form className="grid gap-y-[12px] max-w-[820px]">
        <div className="grid md:grid-cols-2 gap-[12px]">
          <div>
            <label className="block mb-[6px] text-[14px]">Site Name</label>
            <input
              defaultValue="UTT Online Judge"
              className="w-full border border-[#D1D5DB] rounded-[8px] h-[40px] px-[10px]"
            />
          </div>
          <div>
            <label className="block mb-[6px] text-[14px]">CDN Host</label>
            <input
              placeholder="https://cdn.example.com"
              className="w-full border border-[#D1D5DB] rounded-[8px] h-[40px] px-[10px]"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-[12px]">
          <label className="border border-[#E5E7EB] rounded-[8px] px-[12px] py-[10px] flex items-center justify-between">
            <span>Enable HTTPS</span>
            <input type="checkbox" defaultChecked />
          </label>
          <label className="border border-[#E5E7EB] rounded-[8px] px-[12px] py-[10px] flex items-center justify-between">
            <span>Force HTTPS</span>
            <input type="checkbox" />
          </label>
          <label className="border border-[#E5E7EB] rounded-[8px] px-[12px] py-[10px] flex items-center justify-between">
            <span>Register Enabled</span>
            <input type="checkbox" defaultChecked />
          </label>
        </div>

        <div>
          <label className="block mb-[6px] text-[14px]">Footer Text</label>
          <textarea
            rows={4}
            defaultValue="UTT Online Judge - Powered by UTT Team"
            className="w-full border border-[#D1D5DB] rounded-[8px] px-[10px] py-[8px]"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="bg-oj-orange text-oj-white rounded-[8px] px-[14px] py-[9px] hover:bg-[#F5965B]"
          >
            Save Config
          </button>
        </div>
      </form>
    </section>
  );
}
