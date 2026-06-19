import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export default async function AdminNoticesPage() {
  const notices = await prisma.notice.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">공지 · 일정</h1>
        <Link
          href="/admin/notices/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + 새 공지
        </Link>
      </div>

      {notices.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-16 text-center text-muted">
          등록된 공지가 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {notices.map((n) => (
            <li key={n.id}>
              <Link
                href={`/admin/notices/${n.id}`}
                className="flex items-center gap-3 px-4 py-4 hover:bg-bg"
              >
                {n.isPinned && (
                  <span className="rounded bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                    고정
                  </span>
                )}
                <span className="flex-1 truncate font-medium text-ink">
                  {n.title}
                </span>
                <span className="shrink-0 text-sm text-muted">
                  {formatDate(n.eventDate ?? n.createdAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
