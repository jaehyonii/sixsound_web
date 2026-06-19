import { prisma } from "@/lib/prisma";

export const metadata = { title: "동아리 소개" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const about = await prisma.aboutContent.findUnique({
    where: { id: "about" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink">동아리 소개</h1>
        <p className="mt-2 text-muted">클래식기타 동아리 여섯소리</p>
      </header>

      {about?.body ? (
        <div className="whitespace-pre-wrap leading-relaxed text-ink">
          {about.body}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-line py-16 text-center text-muted">
          소개 내용이 아직 등록되지 않았습니다.
        </p>
      )}
    </div>
  );
}
