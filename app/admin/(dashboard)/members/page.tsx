import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminMembersPage() {
  const members = await prisma.member.findMany({
    orderBy: [{ generation: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">부원</h1>
        <Link
          href="/admin/members/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + 부원 추가
        </Link>
      </div>

      {members.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-16 text-center text-muted">
          등록된 부원이 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {members.map((m) => (
            <li key={m.id}>
              <Link
                href={`/admin/members/${m.id}`}
                className="flex items-center gap-3 px-4 py-4 hover:bg-bg"
              >
                <span className="w-12 shrink-0 text-sm font-semibold text-accent">
                  {m.generation}기
                </span>
                <span className="flex-1 truncate font-medium text-ink">
                  {m.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
