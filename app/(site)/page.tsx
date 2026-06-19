import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ConcertCard } from "@/components/ui/ConcertCard";
import { resolveThumbnail } from "@/lib/video";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [concerts, notices] = await Promise.all([
    prisma.concert.findMany({
      orderBy: { performedAt: "desc" },
      take: 3,
      include: {
        videos: { orderBy: { sortOrder: "asc" }, take: 1 },
        _count: { select: { videos: true } },
      },
    }),
    prisma.notice.findMany({
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 4,
    }),
  ]);

  return (
    <>
      {/* 히어로 */}
      <section className="border-b border-line bg-gradient-to-b from-[#f3ebe0] to-bg">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <p className="text-sm font-medium tracking-widest text-accent">
            CLASSICAL GUITAR ENSEMBLE
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            여섯 줄이 모여 <span className="text-brand">하나의 소리</span>로
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted">
            클래식기타 동아리 여섯소리의 연주회 영상을 한곳에서 만나보세요.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/archive"
              className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              연주회 아카이브 보기
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
            >
              동아리 소개
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        {/* 최근 연주회 */}
        <section className="py-14">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-ink">최근 연주회</h2>
            <Link href="/archive" className="text-sm font-medium text-brand hover:underline">
              전체 보기 →
            </Link>
          </div>
          {concerts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line py-12 text-center text-muted">
              아직 등록된 연주회가 없습니다.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {concerts.map((c) => (
                <ConcertCard
                  key={c.id}
                  id={c.id}
                  title={c.title}
                  performedAt={c.performedAt}
                  venue={c.venue}
                  posterUrl={c.posterUrl}
                  videoCount={c._count.videos}
                  thumbnailFallback={
                    c.videos[0]
                      ? resolveThumbnail(
                          c.videos[0].sourceType,
                          c.videos[0].sourceRef,
                          c.videos[0].thumbnailUrl,
                        )
                      : null
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* 공지·일정 */}
        <section className="pb-16">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-ink">공지 · 일정</h2>
            <Link href="/notices" className="text-sm font-medium text-brand hover:underline">
              전체 보기 →
            </Link>
          </div>
          {notices.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line py-12 text-center text-muted">
              등록된 공지가 없습니다.
            </p>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
              {notices.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/notices/${n.id}`}
                    className="flex items-center gap-3 px-4 py-4 hover:bg-bg"
                  >
                    {n.isPinned && (
                      <span className="rounded bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                        공지
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
        </section>
      </div>
    </>
  );
}
