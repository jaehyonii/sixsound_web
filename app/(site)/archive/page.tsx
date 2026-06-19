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
    <div className="mx-auto max-w-6xl px-5 lg:px-10">
      <header className="pt-14 pb-9">
        <p className="font-accent text-sm text-accent italic">Concert Archive</p>
        <h1 className="mt-3 font-serif text-[40px] font-bold text-ink">
          연주회 아카이브
        </h1>
        <p className="mt-3 max-w-[54ch] text-[17px] text-muted">
          여섯소리가 무대에 올린 정기·정모 연주회의 기록. 포스터를 눌러 각
          연주회의 영상으로 들어가세요.
        </p>
      </header>

      {/* 연도 필터 */}
      <div className="flex items-center justify-between border-b border-line pb-5">
        <div className="flex flex-wrap gap-2">
          <FilterChip href="/archive" active={!selectedYear} label="전체" />
          {years.map((y) => (
            <FilterChip
              key={y}
              href={`/archive?year=${y}`}
              active={selectedYear === y}
              label={`${y}`}
            />
          ))}
        </div>
        <div className="hidden items-center gap-1.5 text-sm text-muted sm:flex">
          최신순
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      <div className="py-8 pb-16">
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line py-16 text-center text-muted">
            아직 등록된 연주회가 없습니다.
          </p>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
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
      className={`rounded-full px-4 py-[7px] text-sm transition-colors ${
        active
          ? "bg-brand font-semibold text-white"
          : "border border-line font-medium text-muted hover:border-brand hover:text-brand"
      }`}
    >
      {label}
    </Link>
  );
}
