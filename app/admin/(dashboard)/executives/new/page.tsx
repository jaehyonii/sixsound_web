import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ExecutiveForm } from "@/components/admin/ExecutiveForm";
import { createExecutive } from "@/lib/actions/executives";

export default async function NewExecutivePage() {
  const members = await prisma.member.findMany({
    orderBy: [{ generation: "desc" }, { name: "asc" }],
    select: { id: true, name: true, generation: true },
  });

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/executives"
        className="text-sm text-muted hover:text-brand"
      >
        ← 집행부 목록
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-ink">집행부 추가</h1>
      {members.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-12 text-center text-muted">
          먼저 <Link href="/admin/members/new" className="text-brand underline">부원</Link>을 등록해 주세요.
        </p>
      ) : (
        <ExecutiveForm
          action={createExecutive}
          members={members}
          submitLabel="집행부 등록"
        />
      )}
    </div>
  );
}
