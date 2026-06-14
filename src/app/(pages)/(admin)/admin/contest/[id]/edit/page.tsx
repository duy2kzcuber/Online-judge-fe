import { AdminEditContestForm } from "./AdminEditContestForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditContestPage({ params }: PageProps) {
  const { id } = await params;
  const contestId = Number(id);

  if (!Number.isInteger(contestId) || contestId <= 0) {
    return (
      <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[40px] text-center text-red-600">
        ID kì thi không hợp lệ.
      </section>
    );
  }

  return <AdminEditContestForm contestId={contestId} />;
}
