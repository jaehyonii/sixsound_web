import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { formatDate } from "@/lib/format";

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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const concert = await prisma.concert.findUnique({
    where: { id },
    include: { videos: { orderBy: { sortOrder: "asc" } } },
  });

  if (!concert) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/archive"
        className="text-sm font-medium text-muted hover:text-brand"
      >
        ← 아카이브로
      </Link>

      <header className="mt-4 mb-8">
        <p className="text-sm text-muted">
          {formatDate(concert.performedAt)}
          {concert.venue ? ` · ${concert.venue}` : ""}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{concert.title}</h1>
        {concert.description && (
          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-muted">
            {concert.description}
          </p>
        )}
      </header>

      {concert.videos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-16 text-center text-muted">
          등록된 영상이 없습니다.
        </p>
      ) : (
        <div className="space-y-12">
          {concert.videos.map((v) => (
            <article key={v.id}>
              <VideoPlayer
                sourceType={v.sourceType}
                sourceRef={v.sourceRef}
                title={v.title}
              />
              <div className="mt-3">
                <h2 className="text-lg font-semibold text-ink">{v.title}</h2>
                <p className="mt-1 text-sm text-muted">
                  {[v.pieceTitle, v.composer].filter(Boolean).join(" · ")}
                  {v.pieceTitle && v.performers ? " / " : ""}
                  {v.performers ? `연주: ${v.performers}` : ""}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
