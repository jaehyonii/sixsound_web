import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NoticeForm } from "@/components/admin/NoticeForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { updateNotice, deleteNotice } from "@/lib/actions/notices";

export default async function EditNoticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/notices" className="text-sm text-muted hover:text-brand">
        ← 공지 목록
      </Link>
      <div className="mb-6 mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">공지 수정</h1>
        <DeleteButton action={deleteNotice.bind(null, id)} label="공지 삭제" />
      </div>
      <NoticeForm
        action={updateNotice.bind(null, id)}
        defaults={notice}
        submitLabel="공지 저장"
      />
    </div>
  );
}
