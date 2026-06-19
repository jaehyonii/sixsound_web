import { prisma } from "@/lib/prisma";

export const metadata = { title: "부원 소개" };
export const dynamic = "force-dynamic";

type Member = {
  id: string;
  name: string;
  generation: number;
  part: string | null;
  bio: string | null;
  photoUrl: string | null;
};

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    orderBy: [{ generation: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  const active = members.filter((m) => m.isActive);
  const alumni = members.filter((m) => !m.isActive);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink">부원 소개</h1>
        <p className="mt-2 text-muted">기수별로 함께하는 사람들을 소개합니다.</p>
      </header>

      {members.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-16 text-center text-muted">
          등록된 부원이 없습니다.
        </p>
      ) : (
        <div className="space-y-12">
          <MemberSection title="활동 부원" members={active} />
          {alumni.length > 0 && (
            <MemberSection title="졸업 / OB" members={alumni} muted />
          )}
        </div>
      )}
    </div>
  );
}

function MemberSection({
  title,
  members,
  muted,
}: {
  title: string;
  members: Member[];
  muted?: boolean;
}) {
  if (members.length === 0) return null;

  // 기수별 그룹핑
  const byGen = new Map<number, Member[]>();
  for (const m of members) {
    const list = byGen.get(m.generation) ?? [];
    list.push(m);
    byGen.set(m.generation, list);
  }
  const gens = Array.from(byGen.keys()).sort((a, b) => a - b);

  return (
    <section>
      <h2 className="mb-6 text-xl font-bold text-ink">{title}</h2>
      <div className="space-y-8">
        {gens.map((gen) => (
          <div key={gen}>
            <h3 className="mb-3 text-sm font-semibold text-accent">{gen}기</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {byGen.get(gen)!.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl border border-line bg-surface p-4 text-center ${
                    muted ? "opacity-80" : ""
                  }`}
                >
                  <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full bg-neutral-100">
                    {m.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photoUrl}
                        alt={m.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl text-muted">
                        🎸
                      </div>
                    )}
                  </div>
                  <p className="font-semibold text-ink">{m.name}</p>
                  {m.part && (
                    <p className="text-xs text-muted">{m.part}</p>
                  )}
                  {m.bio && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted">
                      {m.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
