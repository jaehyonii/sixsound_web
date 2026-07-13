import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExecutiveForm } from "@/components/admin/ExecutiveForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { updateExecutive, deleteExecutive } from "@/lib/actions/executives";

export default async function EditExecutivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [executive, members] = await Promise.all([
    prisma.executive.findUnique({ where: { id } }),
    prisma.member.findMany({
      orderBy: [{ generation: "desc" }, { name: "asc" }],
      select: { id: true, name: true, generation: true },
    }),
  ]);
  if (!executive) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/executives"
        className="text-sm text-muted hover:text-brand"
      >
        ← 집행부 목록
      </Link>
      <div className="mb-6 mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">집행부 수정</h1>
        <DeleteButton
          action={deleteExecutive.bind(null, id)}
          label="집행부 삭제"
        />
      </div>
      <ExecutiveForm
        action={updateExecutive.bind(null, id)}
        members={members}
        defaults={{
          generation: executive.generation,
          title: executive.title,
          memberId: executive.memberId,
          sortOrder: executive.sortOrder,
        }}
        submitLabel="집행부 저장"
      />
    </div>
  );
}
