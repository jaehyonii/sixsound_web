import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MemberForm } from "@/components/admin/MemberForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { updateMember, deleteMember } from "@/lib/actions/members";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/members" className="text-sm text-muted hover:text-brand">
        ← 부원 목록
      </Link>
      <div className="mb-6 mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">부원 수정</h1>
        <DeleteButton action={deleteMember.bind(null, id)} label="부원 삭제" />
      </div>
      <MemberForm
        action={updateMember.bind(null, id)}
        defaults={member}
        submitLabel="부원 저장"
      />
    </div>
  );
}
