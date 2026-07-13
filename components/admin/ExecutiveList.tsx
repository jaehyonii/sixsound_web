"use client";

import { useState } from "react";
import Link from "next/link";
import { reorderExecutives } from "@/lib/actions/executives";

type Executive = {
  id: string;
  generation: number;
  title: string;
  member: { name: string; generation: number };
};

// 집행부 목록. 같은 기수 안에서 행을 드래그해 표시 순서를 바꾸면 즉시 저장한다.
export function ExecutiveList({ executives }: { executives: Executive[] }) {
  const [items, setItems] = useState(executives);
  const [dragId, setDragId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const gens = Array.from(new Set(items.map((e) => e.generation))).sort(
    (a, b) => b - a,
  );

  function handleDrop(targetId: string) {
    const sourceId = dragId;
    setDragId(null);
    if (!sourceId || sourceId === targetId) return;

    const from = items.findIndex((e) => e.id === sourceId);
    const to = items.findIndex((e) => e.id === targetId);
    if (from < 0 || to < 0) return;
    // 기수를 넘나드는 이동은 막는다(기수는 드래그가 아니라 수정 화면에서 바꾼다).
    if (items[from].generation !== items[to].generation) return;

    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);

    const orderedIds = next
      .filter((e) => e.generation === moved.generation)
      .map((e) => e.id);

    setSaving(true);
    reorderExecutives(orderedIds).finally(() => setSaving(false));
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">
        행을 드래그해 같은 기수 안에서 순서를 바꿀 수 있습니다.
        {saving && <span className="ml-1 text-brand">저장 중…</span>}
      </p>

      {gens.map((gen) => (
        <div key={gen}>
          <h2 className="mb-2 text-sm font-semibold text-accent">{gen}기</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {items
              .filter((e) => e.generation === gen)
              .map((e) => (
                <li
                  key={e.id}
                  draggable
                  onDragStart={() => setDragId(e.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(e.id)}
                  onDragEnd={() => setDragId(null)}
                  className={`flex cursor-grab items-center gap-3 px-4 py-3 hover:bg-bg active:cursor-grabbing ${
                    dragId === e.id ? "opacity-40" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className="select-none text-base leading-none text-muted2"
                  >
                    ⠿
                  </span>
                  <span className="w-24 shrink-0 truncate text-sm font-semibold text-ink">
                    {e.title}
                  </span>
                  <span className="flex-1 truncate text-muted">
                    {e.member.name}
                    <span className="ml-2 text-xs text-muted2">
                      {e.member.generation}기
                    </span>
                  </span>
                  <Link
                    href={`/admin/executives/${e.id}`}
                    draggable={false}
                    className="shrink-0 text-sm text-muted hover:text-brand"
                  >
                    수정
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
