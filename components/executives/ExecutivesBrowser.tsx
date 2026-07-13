"use client";

import { useState } from "react";

type Executive = {
  id: string;
  generation: number;
  title: string;
  member: {
    name: string;
    photoUrl: string | null;
    bio: string | null;
  };
};

// 기수(임기)를 선택하면 해당 기수의 집행부를 직책 순서대로 보여준다.
export function ExecutivesBrowser({ executives }: { executives: Executive[] }) {
  const gens = Array.from(new Set(executives.map((e) => e.generation))).sort(
    (a, b) => b - a,
  );
  const [gen, setGen] = useState(gens[0]);
  const list = executives.filter((e) => e.generation === gen);

  return (
    <div>
      {/* 기수 선택 */}
      <div className="mb-8 flex flex-wrap gap-2">
        {gens.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGen(g)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              g === gen
                ? "bg-brand text-white"
                : "border border-line bg-surface text-ink hover:border-brand hover:text-brand"
            }`}
          >
            {g}기
          </button>
        ))}
      </div>

      {/* 해당 기수 집행부 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((e) => (
          <div
            key={e.id}
            className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-neutral-100">
              {e.member.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={e.member.photoUrl}
                  alt={e.member.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl text-muted">
                  🎸
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-accent text-xs font-semibold text-accent italic">
                {e.title}
              </p>
              <p className="font-serif text-lg font-bold text-ink">
                {e.member.name}
              </p>
              {e.member.bio && (
                <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                  {e.member.bio}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
