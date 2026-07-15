import { prisma } from "@/lib/prisma";
import { MembersBrowser } from "@/components/members/MembersBrowser";

export const metadata = { title: "부원 소개" };
export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    orderBy: [{ generation: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      generation: true,
      bio: true,
      photoUrl: true,
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink">부원 소개</h1>
        <p className="mt-2 text-muted">
          기수를 눌러 부원 목록을 펼쳐 보세요. 이름을 선택하면 사진과 소개가 나옵니다.
        </p>
      </header>

      {members.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-16 text-center text-muted">
          등록된 부원이 없습니다.
        </p>
      ) : (
        <MembersBrowser members={members} />
      )}
    </div>
  );
}
