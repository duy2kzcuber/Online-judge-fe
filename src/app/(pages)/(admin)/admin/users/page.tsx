const users = [
  {
    id: 1,
    username: "root",
    fullName: "System Root",
    email: "root@uttoj.vn",
    role: "Super Admin",
    createdAt: "2026-04-10",
  },
  {
    id: 2,
    username: "admin_math",
    fullName: "Nguyen Van A",
    email: "admin.math@uttoj.vn",
    role: "Admin",
    createdAt: "2026-04-15",
  },
  {
    id: 3,
    username: "student001",
    fullName: "Tran Thi B",
    email: "student001@utt.edu.vn",
    role: "Regular User",
    createdAt: "2026-04-20",
  },
];

export default function AdminUsersPage() {
  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <div className="flex items-center justify-between mb-[12px]">
        <h2 className="text-[18px] font-[600]">User</h2>
        <input
          placeholder="Tìm theo username / email"
          className="h-[38px] w-[280px] border border-[#D1D5DB] rounded-[8px] px-[10px] text-[14px]"
        />
      </div>

      <div className="overflow-auto">
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="border-b text-left text-[#6B7280]">
              <th className="py-[12px] px-[8px]">ID</th>
              <th className="py-[12px] px-[8px]">Username</th>
              <th className="py-[12px] px-[8px]">Họ tên</th>
              <th className="py-[12px] px-[8px]">Email</th>
              <th className="py-[12px] px-[8px]">Vai trò</th>
              <th className="py-[12px] px-[8px]">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-[#FAFAFA]">
                <td className="py-[12px] px-[8px]">{user.id}</td>
                <td className="py-[12px] px-[8px] font-[600]">{user.username}</td>
                <td className="py-[12px] px-[8px]">{user.fullName}</td>
                <td className="py-[12px] px-[8px]">{user.email}</td>
                <td className="py-[12px] px-[8px]">{user.role}</td>
                <td className="py-[12px] px-[8px]">{user.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
