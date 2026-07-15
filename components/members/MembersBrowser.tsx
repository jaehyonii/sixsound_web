"use client";

import { useState } from "react";

type Member = {
  id: string;
  name: string;
  generation: number;
  bio: string | null;
  photoUrl: string | null;
};

// 기수별 아코디언. 기본은 기수만 접혀 있고, 기수를 누르면 그 기수 부원이 펼쳐진다.
// 다시 누르면 접힌다. 이름을 누르면 사진·소개 상세가 뜬다.
export function MembersBrowser({ members }: { members: Member[] }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
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

  function toggle(gen: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(gen)) next.delete(gen);
      else next.add(gen);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-2.5">
      {gens.map((gen) => {
        const open = expanded.has(gen);
        const group = byGen.get(gen)!;
        return (
          <div
            key={gen}
            className="overflow-hidden rounded-xl border border-line bg-surface"
          >
            <button
              type="button"
              onClick={() => toggle(gen)}
              aria-expanded={open}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-bg"
            >
              <span className="font-serif text-lg font-bold text-ink">
                {gen}기
              </span>
              <span className="flex items-center gap-3 text-sm text-muted2">
                <span>{group.length}명</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>

            {open && (
              <div className="border-t border-line-soft p-3">
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {group.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedId(m.id)}
                      className="truncate rounded-lg px-3 py-2 text-left text-[15px] text-ink transition-colors hover:bg-bg hover:text-brand"
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 부원 상세 (모달) */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="mb-2 ml-auto block text-sm text-white/90"
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
