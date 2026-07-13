import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ExecutiveList } from "@/components/admin/ExecutiveList";

export default async function AdminExecutivesPage() {
  const executives = await prisma.executive.findMany({
    orderBy: [{ generation: "desc" }, { sortOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      generation: true,
      title: true,
      member: { select: { name: true, generation: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">집행부</h1>
        <Link
          href="/admin/executives/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + 집행부 추가
        </Link>
      </div>

      {executives.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-16 text-center text-muted">
          등록된 집행부가 없습니다.
        </p>
      ) : (
        <ExecutiveList executives={executives} />
      )}
    </div>
  );
}
