"use client";

import { useState } from "react";

type Member = {
  id: string;
  name: string;
  generation: number;
  bio: string | null;
  photoUrl: string | null;
};

// 부원 목록을 사진 없이 기수별 세로 목록으로 보여주고,
// 이름을 선택하면 사진 + 상세 소개를 보여준다.
// 데스크톱: 좌측 목록 + 우측 상세(고정). 모바일: 목록 + 선택 시 하단 시트.
export function MembersBrowser({ members }: { members: Member[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = members.find((m) => m.id === selectedId) ?? null;

  // 기수별 그룹핑 (내림차순)
  const byGen = new Map<number, Member[]>();
  for (const m of members) {
    const list = byGen.get(m.generation) ?? [];
    list.push(m);
    byGen.set(m.generation, list);
  }
  const gens = Array.from(byGen.keys()).sort((a, b) => b - a);

  // 데스크톱 패널은 선택 전이라도 첫 부원을 미리 보여준다.
  const desktopMember = selected ?? members[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,300px)_1fr]">
      {/* 기수별 세로 목록 */}
      <div className="space-y-6">
        {gens.map((gen) => (
          <div key={gen}>
            <h2 className="mb-2 font-accent text-sm font-semibold text-accent italic">
              {gen}기
            </h2>
            <ul className="overflow-hidden rounded-xl border border-line bg-surface">
              {byGen.get(gen)!.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(m.id)}
                    className={`flex w-full items-center justify-between border-b border-line-soft px-4 py-3 text-left text-[15px] transition-colors last:border-b-0 hover:bg-bg ${
                      selectedId === m.id
                        ? "bg-bg font-semibold text-brand"
                        : "text-ink"
                    }`}
                  >
                    <span className="truncate">{m.name}</span>
                    <span className="font-accent text-muted2">→</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 데스크톱 상세 패널 (고정) */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <MemberDetail member={desktopMember} />
        </div>
      </div>

      {/* 모바일 상세 (하단 시트) */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 lg:hidden"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-bg p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="mb-4 ml-auto block text-sm text-muted"
            >
              닫기 ✕
            </button>
            <MemberDetail member={selected} />
          </div>
        </div>
      )}
    </div>
  );
}

function MemberDetail({ member }: { member: Member }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-8 text-center">
      <div className="mx-auto mb-5 h-40 w-40 overflow-hidden rounded-full bg-neutral-100">
        {member.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photoUrl}
            alt={member.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl text-muted">
            🎸
          </div>
        )}
      </div>
      <p className="font-accent text-sm text-accent italic">
        {member.generation}기
      </p>
      <h2 className="mt-1 font-serif text-2xl font-bold text-ink">
        {member.name}
      </h2>
      {member.bio ? (
        <p className="mx-auto mt-4 max-w-prose text-[15px] leading-relaxed text-muted">
          {member.bio}
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted2">등록된 소개가 없습니다.</p>
      )}
    </div>
  );
}
