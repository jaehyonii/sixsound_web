import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateDot } from "@/lib/format";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">일정</h1>
        <Link
          href="/admin/events/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + 일정 추가
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-16 text-center text-muted">
          등록된 일정이 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {events.map((e) => (
            <li key={e.id}>
              <Link
                href={`/admin/events/${e.id}`}
                className="flex items-center gap-3 px-4 py-4 hover:bg-bg"
              >
                <span className="w-28 shrink-0 text-sm text-muted2 tabular-nums">
                  {formatDateDot(e.startAt)}
                  {e.endAt ? ` ~ ${formatDateDot(e.endAt)}` : ""}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">
                    {e.title}
                  </span>
                  {e.location && (
                    <span className="block truncate text-xs text-muted2">
                      {e.location}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
