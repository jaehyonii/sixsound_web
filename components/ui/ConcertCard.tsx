import Link from "next/link";
import { formatDateDot, getYear } from "@/lib/format";
import { concertTone } from "@/lib/tone";

type Props = {
  id: string;
  title: string;
  performedAt: Date | string;
  venue?: string | null;
  posterUrl?: string | null;
  videoCount?: number;
  thumbnailFallback?: string | null; // 포스터 없을 때 첫 영상 썸네일
};

export function ConcertCard({
  id,
  title,
  performedAt,
  venue,
  posterUrl,
  videoCount,
  thumbnailFallback,
}: Props) {
  const cover = posterUrl ?? thumbnailFallback ?? null;

  return (
    <Link href={`/archive/${id}`} className="cc-card group block">
      <div
        className="relative flex aspect-3/4 flex-col justify-end overflow-hidden rounded-xl p-5 shadow-[0_1px_3px_rgba(43,38,34,.06)] transition-transform duration-[250ms] group-hover:-translate-y-1"
        style={cover ? undefined : { background: concertTone(id) }}
      >
        {cover ? (
          <>
            {/* 외부(YouTube)·업로드 이미지 모두 가능하므로 일반 img 사용 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />
          </>
        ) : null}
        <span className="absolute top-[18px] left-[18px] text-[11px] tracking-[0.14em] text-white/60">
          {getYear(performedAt)}
        </span>
        <div className="relative font-serif text-[22px] leading-snug font-bold text-white">
          {title}
        </div>
        {venue && (
          <div className="relative mt-2 text-[13px] text-white/80">{venue}</div>
        )}
      </div>

      <div className="pt-3.5">
        <div className="cc-title text-[17px] font-semibold text-ink transition-colors duration-200 group-hover:text-brand">
          {title}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[13px] text-muted tabular-nums">
            {formatDateDot(performedAt)}
          </span>
          {typeof videoCount === "number" && videoCount > 0 && (
            <>
              <span className="h-[3px] w-[3px] rounded-full bg-[#cabfae]" />
              <span className="text-[13px] text-accent">영상 {videoCount}편</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
