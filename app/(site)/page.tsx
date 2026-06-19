import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VideoCard } from "@/components/ui/VideoCard";
import { resolveThumbnail } from "@/lib/video";
import { formatMonthDay } from "@/lib/format";
import { videoTone } from "@/lib/tone";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [latestVideos, notices, concertCount, videoCount, topMember] =
    await Promise.all([
      prisma.video.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { concert: true },
      }),
      prisma.notice.findMany({
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        take: 3,
      }),
      prisma.concert.count(),
      prisma.video.count(),
      prisma.member.findFirst({ orderBy: { generation: "desc" } }),
    ]);

  const hero = latestVideos[0] ?? null;
  const heroThumb = hero
    ? resolveThumbnail(hero.sourceType, hero.sourceRef, hero.thumbnailUrl)
    : null;

  return (
    <>
      {/* ===== 히어로 ===== */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-14 lg:px-10 lg:pt-[76px] lg:pb-[68px]">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="font-accent text-sm tracking-[0.04em] text-accent italic">
              Kwangwoon Univ. · Classical Guitar Club
            </p>
            <h1 className="mt-4 font-serif text-[40px] leading-[1.2] font-bold tracking-[-0.02em] text-ink sm:text-5xl lg:text-[52px]">
              여섯 줄이 만드는
              <br />
              여섯 가지 울림
            </h1>
            <p className="mt-5 max-w-[40ch] text-[17px] leading-relaxed text-muted lg:text-lg">
              광운대학교 클래식기타 동아리 여섯소리. 무대 위 작은 떨림까지 영상으로
              남겨, 소장할 가치가 있는 아카이브로 모읍니다.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={hero ? `/archive/${hero.concertId}?v=${hero.id}` : "/archive"}
                className="inline-flex items-center gap-2 rounded-[10px] bg-brand px-[22px] py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                대표 영상 보기
              </Link>
              <Link
                href="/archive"
                className="rounded-[10px] border border-brand px-[22px] py-[13px] text-[15px] font-semibold text-brand transition-colors hover:bg-brand/5"
              >
                아카이브 보기
              </Link>
            </div>

            <div className="mt-9 flex gap-7">
              <Stat
                value={topMember?.generation ?? 0}
                unit="기"
                label="현재 활동 기수"
              />
              <span className="w-px bg-line" />
              <Stat value={concertCount} unit="회" label="등록 연주회" />
              <span className="w-px bg-line" />
              <Stat value={videoCount} unit="＋" label="아카이브 영상" />
            </div>
          </div>

          {/* 대표 영상 */}
          <Link
            href={hero ? `/archive/${hero.concertId}?v=${hero.id}` : "/archive"}
            className="group relative block aspect-4/5 overflow-hidden rounded-2xl"
            style={
              heroThumb ? undefined : { background: videoTone(hero?.id ?? "hero") }
            }
          >
            {heroThumb ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroThumb}
                  alt={hero?.title ?? "대표 연주 영상"}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/15" />
              </>
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-white/90 shadow-[0_6px_20px_rgba(0,0,0,.22)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#2b2622">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>
            {hero && (
              <div className="absolute bottom-[18px] left-[18px] rounded-lg bg-black/65 px-3 py-2 text-white">
                <div className="text-[13px] font-semibold">
                  {hero.pieceTitle ?? hero.title}
                </div>
                <div className="mt-0.5 text-[11px] text-white/75">
                  {[hero.concert?.title, hero.performers]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
            )}
          </Link>
        </div>
      </section>

      <Divider />

      {/* ===== 최신 연주 영상 ===== */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-accent text-sm text-accent italic">Latest</p>
            <h2 className="mt-2.5 font-serif text-[30px] font-bold text-ink">
              최신 연주 영상
            </h2>
            <p className="mt-1.5 text-[15px] text-muted">
              가장 최근 무대에서 기록한 연주들.
            </p>
          </div>
          <Link
            href="/archive"
            className="group inline-flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-ink transition-colors hover:text-brand"
          >
            전체 아카이브 <span className="font-accent">→</span>
          </Link>
        </div>

        {latestVideos.length === 0 ? (
          <EmptyState text="아직 등록된 영상이 없습니다." />
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {latestVideos.map((v) => (
              <VideoCard
                key={v.id}
                concertId={v.concertId}
                videoId={v.id}
                title={v.pieceTitle ?? v.title}
                composer={v.composer}
                performers={v.performers}
                concertTitle={v.concert?.title}
                thumbnail={resolveThumbnail(
                  v.sourceType,
                  v.sourceRef,
                  v.thumbnailUrl,
                )}
              />
            ))}
          </div>
        )}
      </section>

      {/* ===== 공지 + 소개 ===== */}
      <section className="mx-auto max-w-6xl px-5 pb-16 lg:px-10">
        <div className="grid gap-7 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-2xl border border-line bg-surface px-8 py-7">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[19px] font-bold text-ink">다가오는 일정 · 공지</h3>
              <Link
                href="/notices"
                className="text-sm text-muted transition-colors hover:text-brand"
              >
                더보기 →
              </Link>
            </div>
            {notices.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                등록된 공지가 없습니다.
              </p>
            ) : (
              notices.map((n) => (
                <Link
                  key={n.id}
                  href={`/notices/${n.id}`}
                  className="flex items-center gap-2.5 border-t border-line-soft py-[15px]"
                >
                  {n.isPinned ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 17v5" />
                        <path d="M9 10.76V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6.76l2.83 4.24A1 1 0 0 1 17 17H7a1 1 0 0 1-.83-2z" />
                      </svg>
                      고정
                    </span>
                  ) : n.eventDate ? (
                    <span className="shrink-0 rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                      일정
                    </span>
                  ) : null}
                  <span className="flex-1 truncate text-[15px] font-medium text-ink">
                    {n.title}
                  </span>
                  <span className="shrink-0 text-[13px] text-muted2 tabular-nums">
                    {formatMonthDay(n.eventDate ?? n.createdAt)}
                  </span>
                </Link>
              ))
            )}
          </div>

          <Link
            href="/about"
            className="group flex flex-col rounded-2xl p-8 text-white"
            style={{ background: "linear-gradient(160deg,#8a5a2b,#5e3d1d)" }}
          >
            <p className="font-accent text-[13px] text-[#e8cfa8] italic">About</p>
            <h3 className="mt-3.5 font-serif text-2xl leading-snug font-bold">
              스무 해 넘게
              <br />
              여섯 줄을 함께
            </h3>
            <p className="mt-3.5 flex-1 text-[15px] leading-relaxed text-[#f0e3d0]">
              매 학기 합주와 개인 연주를 준비하고, 봄·가을 정기연주회로 무대에
              섭니다. 클래식기타가 처음이어도 괜찮습니다.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold">
              소개 더보기 <span className="font-accent">→</span>
            </span>
          </Link>
        </div>
      </section>

      {/* ===== 부원 배너 ===== */}
      <Link
        href="/members"
        className="relative block h-60 overflow-hidden"
        style={{ background: "linear-gradient(135deg,#e3d9c9,#c4b39a)" }}
      >
        <div
          className="absolute inset-0 flex flex-col justify-center px-5 lg:px-10"
          style={{
            background:
              "linear-gradient(90deg,#2b2622e0,#2b262288 55%,#2b262200)",
          }}
        >
          <div className="mx-auto w-full max-w-6xl">
            <h3 className="font-serif text-[28px] font-bold text-white">
              함께 연주하는 사람들
            </h3>
            <p className="mt-2 max-w-[34ch] text-[15px] text-[#e7ddcd]">
              {topMember?.generation ?? 28}기까지 이어 온 여섯소리의 부원들을
              소개합니다.
            </p>
            <span className="mt-4 inline-block text-[15px] font-semibold text-white">
              부원 소개 →
            </span>
          </div>
        </div>
      </Link>
    </>
  );
}

function Stat({
  value,
  unit,
  label,
}: {
  value: number;
  unit: string;
  label: string;
}) {
  return (
    <div>
      <div className="font-serif text-[26px] font-bold text-ink tabular-nums">
        {value}
        <span className="font-sans text-[15px] text-muted">{unit}</span>
      </div>
      <div className="mt-0.5 text-[13px] text-muted2">{label}</div>
    </div>
  );
}

function Divider() {
  return (
    <div className="mx-auto max-w-6xl px-5 lg:px-10">
      <div className="h-px bg-line" />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-line py-16 text-center text-muted">
      {text}
    </p>
  );
}
