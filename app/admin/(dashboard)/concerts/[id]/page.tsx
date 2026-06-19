import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConcertForm } from "@/components/admin/ConcertForm";
import { VideoForm } from "@/components/admin/VideoForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { card } from "@/components/admin/styles";
import {
  updateConcert,
  deleteConcert,
  addVideo,
  updateVideo,
  deleteVideo,
} from "@/lib/actions/concerts";

export default async function EditConcertPage({
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
    <div className="max-w-2xl space-y-10">
      <div>
        <Link
          href="/admin/concerts"
          className="text-sm text-muted hover:text-brand"
        >
          ← 연주회 목록
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">연주회 수정</h1>
          <DeleteButton
            action={deleteConcert.bind(null, id)}
            label="연주회 삭제"
            confirmText="연주회와 소속 영상이 모두 삭제됩니다. 계속할까요?"
          />
        </div>
      </div>

      <ConcertForm
        action={updateConcert.bind(null, id)}
        defaults={concert}
        submitLabel="연주회 정보 저장"
      />

      {/* 영상 관리 */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-ink">
          영상 ({concert.videos.length})
        </h2>

        <div className="space-y-3">
          {concert.videos.map((v) => (
            <details key={v.id} className={card}>
              <summary className="flex cursor-pointer items-center justify-between">
                <span className="font-medium text-ink">{v.title}</span>
                <span className="text-xs text-muted">{v.sourceType}</span>
              </summary>
              <div className="mt-4 space-y-3">
                <VideoForm
                  action={updateVideo.bind(null, v.id)}
                  defaults={v}
                  submitLabel="영상 저장"
                />
                <DeleteButton
                  action={deleteVideo.bind(null, v.id)}
                  label="이 영상 삭제"
                />
              </div>
            </details>
          ))}
        </div>

        <div className={`${card} mt-4`}>
          <h3 className="mb-3 font-semibold text-ink">+ 영상 추가</h3>
          <VideoForm
            action={addVideo.bind(null, id)}
            submitLabel="영상 추가"
            compact
          />
        </div>
      </section>
    </div>
  );
}
