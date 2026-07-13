"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderExecutives } from "@/lib/actions/executives";

type Executive = {
  id: string;
  generation: number;
  title: string;
  member: { name: string; generation: number };
};

// 집행부 목록. ⠿ 핸들을 잡아 같은 기수 안에서 순서를 바꾸면 즉시 저장한다.
// PointerSensor를 써서 마우스(PC)·터치(모바일) 모두 동작하고, 키보드로도 정렬 가능하다.
// 핸들에만 드래그를 걸어 모바일에서 페이지 스크롤과 충돌하지 않게 한다.
export function ExecutiveList({ executives }: { executives: Executive[] }) {
  const [items, setItems] = useState(executives);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    // 5px 이상 움직여야 드래그로 인식 → 탭/클릭이 드래그로 오인되지 않는다.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const gens = Array.from(new Set(items.map((e) => e.generation))).sort(
    (a, b) => b - a,
  );

  function handleDragEnd(gen: number) {
    return (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const group = items.filter((e) => e.generation === gen);
      const from = group.findIndex((e) => e.id === active.id);
      const to = group.findIndex((e) => e.id === over.id);
      if (from < 0 || to < 0) return;

      const reordered = arrayMove(group, from, to);
      // 다른 기수 그룹은 그대로 두고 이 기수만 새 순서로 교체
      setItems(
        gens.flatMap((g) =>
          g === gen ? reordered : items.filter((e) => e.generation === g),
        ),
      );

      setSaving(true);
      reorderExecutives(reordered.map((e) => e.id)).finally(() =>
        setSaving(false),
      );
    };
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">
        ⠿ 를 잡고 끌어 같은 기수 안에서 순서를 바꿀 수 있습니다. (PC·모바일 모두)
        {saving && <span className="ml-1 text-brand">저장 중…</span>}
      </p>

      {gens.map((gen) => {
        const group = items.filter((e) => e.generation === gen);
        return (
          <div key={gen}>
            <h2 className="mb-2 text-sm font-semibold text-accent">{gen}기</h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd(gen)}
            >
              <SortableContext
                items={group.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="overflow-hidden rounded-xl border border-line">
                  {group.map((e) => (
                    <SortableRow key={e.id} executive={e} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        );
      })}
    </div>
  );
}

function SortableRow({ executive }: { executive: Executive }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: executive.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 border-b border-line-soft bg-surface px-4 py-3 last:border-b-0 ${
        isDragging ? "relative z-10 opacity-90 shadow-md" : ""
      }`}
    >
      <button
        type="button"
        aria-label="순서 변경 핸들"
        {...attributes}
        {...listeners}
        // touch-action: none 이어야 모바일에서 스크롤 대신 드래그가 잡힌다.
        style={{ touchAction: "none" }}
        className="cursor-grab select-none px-1 py-2 text-base leading-none text-muted2 active:cursor-grabbing"
      >
        ⠿
      </button>
      <span className="w-24 shrink-0 truncate text-sm font-semibold text-ink">
        {executive.title}
      </span>
      <span className="flex-1 truncate text-muted">
        {executive.member.name}
        <span className="ml-2 text-xs text-muted2">
          {executive.member.generation}기
        </span>
      </span>
      <Link
        href={`/admin/executives/${executive.id}`}
        className="shrink-0 text-sm text-muted hover:text-brand"
      >
        수정
      </Link>
    </li>
  );
}
