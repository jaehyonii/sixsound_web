import Link from "next/link";
import { videoTone } from "@/lib/tone";

type Props = {
  concertId: string;
  videoId: string;
  title: string;
  composer?: string | null;
  performers?: string | null;
  concertTitle?: string | null;
  thumbnail?: string | null;
};

export function VideoCard({
  concertId,
  videoId,
  title,
  composer,
  performers,
  concertTitle,
  thumbnail,
}: Props) {
  const sub = [composer, performers ? `연주 ${performers}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/archive/${concertId}?v=${videoId}`}
      className="vc-card group block"
    >
      <div
        className="vc-thumb relative aspect-video overflow-hidden rounded-xl transition-transform duration-[250ms] group-hover:scale-[1.03]"
        style={thumbnail ? undefined : { background: videoTone(videoId) }}
      >
        {thumbnail ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </>
        ) : (
          <span className="absolute top-2.5 left-3 text-[10px] tracking-[0.12em] text-white/20">
            VIDEO
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-[250ms] group-hover:opacity-100">
          <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/95 shadow-[0_4px_16px_rgba(0,0,0,.28)]">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#2b2622">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </div>
      <div className="pt-3.5">
        <div className="text-base leading-snug font-semibold text-ink">
          {title}
        </div>
        {sub && <div className="mt-1 text-[13px] text-muted">{sub}</div>}
        {concertTitle && (
          <div className="mt-1.5 text-xs text-accent">{concertTitle}</div>
        )}
      </div>
    </Link>
  );
}
