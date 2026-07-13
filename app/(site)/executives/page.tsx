import { prisma } from "@/lib/prisma";
import { ExecutivesBrowser } from "@/components/executives/ExecutivesBrowser";

export const metadata = { title: "집행부 소개" };
export const dynamic = "force-dynamic";

export default async function ExecutivesPage() {
  const executives = await prisma.executive.findMany({
    orderBy: [{ generation: "desc" }, { sortOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      generation: true,
      title: true,
      member: { select: { name: true, photoUrl: true, bio: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink">집행부 소개</h1>
        <p className="mt-2 text-muted">
          기수를 선택하면 해당 기수의 집행부를 볼 수 있어요.
        </p>
      </header>

      {executives.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-16 text-center text-muted">
          등록된 집행부가 없습니다.
        </p>
      ) : (
        <ExecutivesBrowser executives={executives} />
      )}
    </div>
  );
}
