const judgeServers = [
  {
    id: "js-01",
    host: "10.10.20.11",
    serviceUrl: "http://10.10.20.11:8080",
    status: "Online",
    taskNumber: 14,
  },
  {
    id: "js-02",
    host: "10.10.20.12",
    serviceUrl: "http://10.10.20.12:8080",
    status: "Online",
    taskNumber: 9,
  },
  {
    id: "js-03",
    host: "10.10.20.13",
    serviceUrl: "http://10.10.20.13:8080",
    status: "Offline",
    taskNumber: 0,
  },
];

export default function AdminJudgeServerPage() {
  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <h2 className="text-[18px] font-[600] mb-[12px]">Judge Server</h2>

      <div className="overflow-auto">
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="border-b text-left text-[#6B7280]">
              <th className="py-[12px] px-[8px]">ID</th>
              <th className="py-[12px] px-[8px]">Host</th>
              <th className="py-[12px] px-[8px]">Service URL</th>
              <th className="py-[12px] px-[8px]">Status</th>
              <th className="py-[12px] px-[8px]">Task Number</th>
            </tr>
          </thead>
          <tbody>
            {judgeServers.map((server) => (
              <tr key={server.id} className="border-b hover:bg-[#FAFAFA]">
                <td className="py-[12px] px-[8px]">{server.id}</td>
                <td className="py-[12px] px-[8px]">{server.host}</td>
                <td className="py-[12px] px-[8px]">{server.serviceUrl}</td>
                <td className="py-[12px] px-[8px]">
                  <span
                    className={`px-[8px] py-[3px] rounded-[999px] text-[12px] ${
                      server.status === "Online"
                        ? "bg-[#E8F8EE] text-[#0E9F4B]"
                        : "bg-[#FDECEC] text-[#D14343]"
                    }`}
                  >
                    {server.status}
                  </span>
                </td>
                <td className="py-[12px] px-[8px]">{server.taskNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
