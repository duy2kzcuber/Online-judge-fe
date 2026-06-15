import { AdminContestViewPage } from "./AdminContestViewPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContestViewPage({ params }: PageProps) {
  const { id } = await params;
  const contestId = Number(id);

  if (!Number.isInteger(contestId) || contestId <= 0) {
    return (
      <div className="text-center text-red-600 py-[40px]">
        ID kì thi không hợp lệ
      </div>
    );
  }

  return <AdminContestViewPage contestId={contestId} />;
}
