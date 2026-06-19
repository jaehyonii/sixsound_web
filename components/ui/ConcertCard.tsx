import Link from "next/link";
import { formatDate } from "@/lib/format";

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
    <Link
      href={`/archive/${id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
        {cover ? (
          // 외부(YouTube)·업로드 이미지 모두 가능하므로 일반 img 사용
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted">
            🎸 여섯소리
          </div>
        )}
        {typeof videoCount === "number" && videoCount > 0 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
            영상 {videoCount}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 font-semibold text-ink group-hover:text-brand">
          {title}
        </h3>
        <p className="mt-auto text-sm text-muted">
          {formatDate(performedAt)}
          {venue ? ` · ${venue}` : ""}
        </p>
      </div>
    </Link>
  );
}
