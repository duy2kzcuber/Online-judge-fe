import Link from "next/link";
import { ContestDetailPage } from "./ContestDetailPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function KiThiDetailPage({ params }: PageProps) {
  const { id } = await params;
  const contestId = Number(id);

  if (!Number.isInteger(contestId) || contestId <= 0) {
    return (
      <div className="container pt-[100px] pb-[40px] text-center text-red-600">
        ID kì thi không hợp lệ
      </div>
    );
  }

  return (
    <div className="container pt-[100px] pb-[40px]">
      <Link
        href="/ki-thi"
        className="text-[14px] text-oj-orange hover:underline mb-[16px] inline-block"
      >
        ← Quay lại danh sách kì thi
      </Link>
      <ContestDetailPage contestId={contestId} />
    </div>
  );
}
