import { prisma } from "@/lib/prisma";
import { updateAbout } from "@/lib/actions/about";
import { inputClass, labelClass, btnPrimary, card } from "@/components/admin/styles";

export default async function AdminAboutPage() {
  const about = await prisma.aboutContent.findUnique({
    where: { id: "about" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-ink">동아리 소개 편집</h1>
      <form action={updateAbout} className={`${card} space-y-4`}>
        <div>
          <label className={labelClass}>소개 내용</label>
          <textarea
            name="body"
            rows={14}
            defaultValue={about?.body ?? ""}
            placeholder="동아리 소개, 역사, 활동 등을 자유롭게 작성하세요."
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted">
            줄바꿈은 그대로 표시됩니다.
          </p>
        </div>
        <button type="submit" className={btnPrimary}>
          저장
        </button>
      </form>
    </div>
  );
}
