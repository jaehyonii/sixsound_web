import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export default async function AdminConcertsPage() {
  const concerts = await prisma.concert.findMany({
    orderBy: { performedAt: "desc" },
    include: { _count: { select: { videos: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">연주회 · 영상</h1>
        <Link
          href="/admin/concerts/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + 새 연주회
        </Link>
      </div>

      {concerts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-16 text-center text-muted">
          등록된 연주회가 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {concerts.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/concerts/${c.id}`}
                className="flex items-center justify-between px-4 py-4 hover:bg-bg"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{c.title}</p>
                  <p className="text-sm text-muted">
                    {formatDate(c.performedAt)} · 영상 {c._count.videos}개
                  </p>
                </div>
                <span className="text-sm text-brand">관리 →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
