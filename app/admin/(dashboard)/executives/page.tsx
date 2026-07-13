import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminExecutivesPage() {
  const executives = await prisma.executive.findMany({
    orderBy: [{ generation: "desc" }, { sortOrder: "asc" }, { title: "asc" }],
    include: { member: true },
  });

  // 기수별 그룹핑
  const byGen = new Map<number, typeof executives>();
  for (const e of executives) {
    const list = byGen.get(e.generation) ?? [];
    list.push(e);
    byGen.set(e.generation, list);
  }
  const gens = Array.from(byGen.keys()).sort((a, b) => b - a);

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
        <div className="space-y-6">
          {gens.map((gen) => (
            <div key={gen}>
              <h2 className="mb-2 text-sm font-semibold text-accent">{gen}기</h2>
              <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                {byGen.get(gen)!.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/admin/executives/${e.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-bg"
                    >
                      <span className="w-24 shrink-0 text-sm font-semibold text-ink">
                        {e.title}
                      </span>
                      <span className="flex-1 truncate text-muted">
                        {e.member.name}
                        <span className="ml-2 text-xs text-muted2">
                          {e.member.generation}기
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
