import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContestParticipantsRedirectPage({
  params,
}: PageProps) {
  const { id } = await params;
  redirect(`/admin/contest/${id}/view`);
}
