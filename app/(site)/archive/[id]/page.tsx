import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { formatDateTime } from "@/lib/format";
import { resolveThumbnail } from "@/lib/video";
import { concertTone, videoTone } from "@/lib/tone";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const concert = await prisma.concert.findUnique({ where: { id } });
  return { title: concert?.title ?? "연주회" };
}

export default async function ConcertDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ v?: string }>;
}) {
  const { id } = await params;
  const { v } = await searchParams;
  const concert = await prisma.concert.findUnique({
    where: { id },
    include: { videos: { orderBy: { sortOrder: "asc" } } },
  });

  if (!concert) notFound();

  const videos = concert.videos;
  const selected = videos.find((x) => x.id === v) ?? videos[0] ?? null;

  return (
    <div className="mx-auto max-w-6xl px-5 lg:px-10">
      {/* breadcrumb + 헤더 */}
      <section className="pt-11 pb-8">
        <div className="mb-5 flex items-center gap-2 text-[13px] text-muted2">
          <Link href="/archive" className="transition-colors hover:text-brand">
            연주회 아카이브
          </Link>
          <span className="font-accent">/</span>
          <span className="text-ink">{concert.title}</span>
        </div>

        <div className="grid gap-10 sm:grid-cols-[200px_1fr] sm:items-start">
          {/* 포스터 */}
          <div
            className="relative flex aspect-3/4 flex-col justify-end overflow-hidden rounded-xl p-4 shadow-[0_1px_3px_rgba(43,38,34,.1)]"
            style={
              concert.posterUrl ? undefined : { background: concertTone(concert.id) }
            }
          >
            {concert.posterUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={concert.posterUrl}
                  alt={concert.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </>
            ) : (
              <div className="relative font-serif text-lg leading-snug font-bold text-white">
                {concert.title}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-serif text-[34px] font-bold text-ink lg:text-[38px]">
              {concert.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <Meta
                icon={
                  <>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </>
                }
                text={formatDateTime(concert.performedAt)}
              />
              {concert.venue && (
                <Meta
                  icon={
                    <>
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </>
                  }
                  text={concert.venue}
                />
              )}
            </div>
            {concert.description && (
              <p className="mt-5 max-w-[60ch] leading-loose whitespace-pre-wrap text-ink">
                {concert.description}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                정기연주회
              </span>
              {videos.length > 0 && (
                <span className="rounded-full bg-brand/[0.08] px-3 py-1 text-xs font-semibold text-brand">
                  영상 {videos.length}편
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 플레이어 + 수록 영상 */}
      {videos.length === 0 ? (
        <p className="mb-16 rounded-2xl border border-dashed border-line py-16 text-center text-muted">
          등록된 영상이 없습니다.
        </p>
      ) : (
        <section className="grid gap-7 pb-16 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            {selected && (
              <VideoPlayer
                sourceType={selected.sourceType}
                sourceRef={selected.sourceRef}
                title={selected.title}
              />
            )}
            {/* Now Playing */}
            {selected && (
              <div className="mt-[18px] rounded-2xl border border-line bg-surface px-6 py-6">
                <p className="font-accent text-xs text-accent italic">
                  Now Playing
                </p>
                <h2 className="mt-2 text-2xl font-bold text-ink">
                  {selected.pieceTitle ?? selected.title}
                </h2>
                <div className="mt-3.5 flex flex-wrap gap-x-9 gap-y-3">
                  {selected.composer && (
                    <Field label="작곡" value={selected.composer} />
                  )}
                  {selected.performers && (
                    <Field label="연주" value={selected.performers} />
                  )}
                  {selected.pieceTitle && selected.pieceTitle !== selected.title && (
                    <Field label="영상" value={selected.title} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 수록 영상 리스트 */}
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line-soft px-[22px] py-5">
              <span className="text-base font-bold text-ink">수록 영상</span>
              <span className="text-[13px] text-muted2">총 {videos.length}곡</span>
            </div>
            <ul className="max-h-[560px] overflow-y-auto">
              {videos.map((vid) => {
                const active = selected?.id === vid.id;
                const thumb = resolveThumbnail(
                  vid.sourceType,
                  vid.sourceRef,
                  vid.thumbnailUrl,
                );
                return (
                  <li key={vid.id}>
                    <Link
                      href={`/archive/${concert.id}?v=${vid.id}`}
                      scroll={false}
                      className={`flex gap-3.5 border-t border-line-soft px-[18px] py-[13px] transition-colors first:border-t-0 ${
                        active
                          ? "border-l-[3px] border-l-brand bg-brand/[0.05]"
                          : "hover:bg-bg"
                      }`}
                    >
                      <div
                        className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg"
                        style={thumb ? undefined : { background: videoTone(vid.id) }}
                      >
                        {thumb ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumb}
                              alt={vid.title}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          </>
                        ) : null}
                        {active && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="#fff"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-ink">
                          {vid.pieceTitle ?? vid.title}
                        </div>
                        <div className="mt-1 truncate text-xs text-muted">
                          {[vid.composer, vid.performers]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

function Meta({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[15px] text-muted">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8a5a2b"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon}
      </svg>
      {text}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-xs text-muted2">{label}</div>
      <div className="text-[15px] font-medium text-ink">{value}</div>
    </div>
  );
}
