import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ConcertCard } from "@/components/ui/ConcertCard";
import { resolveThumbnail } from "@/lib/video";
import { getYear } from "@/lib/format";

export const metadata = { title: "연주회 아카이브" };

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;

  const concerts = await prisma.concert.findMany({
    orderBy: { performedAt: "desc" },
    include: {
      videos: { orderBy: { sortOrder: "asc" }, take: 1 },
      _count: { select: { videos: true } },
    },
  });

  const years = Array.from(
    new Set(concerts.map((c) => getYear(c.performedAt))),
  ).sort((a, b) => b - a);

  const selectedYear = year ? Number(year) : null;
  const filtered = selectedYear
    ? concerts.filter((c) => getYear(c.performedAt) === selectedYear)
    : concerts;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink">연주회 아카이브</h1>
        <p className="mt-2 text-muted">
          여섯소리가 함께한 무대를 영상으로 다시 만나보세요.
        </p>
      </header>

      {/* 연도 필터 */}
      {years.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <FilterChip href="/archive" active={!selectedYear} label="전체" />
          {years.map((y) => (
            <FilterChip
              key={y}
              href={`/archive?year=${y}`}
              active={selectedYear === y}
              label={`${y}년`}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-16 text-center text-muted">
          아직 등록된 연주회가 없습니다.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
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
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-brand bg-brand text-white"
          : "border-line bg-surface text-muted hover:border-brand hover:text-brand"
      }`}
    >
      {label}
    </Link>
  );
}
