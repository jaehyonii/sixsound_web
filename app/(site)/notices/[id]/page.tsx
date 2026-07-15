import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = await prisma.notice.findUnique({ where: { id } });
  return { title: notice?.title ?? "공지" };
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/notices"
        className="text-sm font-medium text-muted hover:text-brand"
      >
        ← 공지 목록
      </Link>

      <header className="mt-4 mb-8 border-b border-line pb-6">
        <div className="flex items-center gap-2">
          {notice.isPinned && (
            <span className="rounded bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
              공지
            </span>
          )}
          <h1 className="text-2xl font-bold text-ink">{notice.title}</h1>
        </div>
        <p className="mt-2 text-sm text-muted">{formatDate(notice.createdAt)}</p>
      </header>

      <div className="whitespace-pre-wrap leading-relaxed text-ink">
        {notice.content}
      </div>
    </div>
  );
}
