"use client";

import { useState } from "react";

type EventItem = {
  id: string;
  title: string;
  startAt: string; // ISO
  endAt: string | null; // ISO
  location: string | null;
  description: string | null;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// ISO → KST 기준 연/월/일
function kstYmd(iso: string): { y: number; m: number; d: number } {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

function dayKey(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// 일정이 걸치는 모든 날짜 키(시작~종료, KST). 종료 없으면 하루.
function eventDayKeys(ev: EventItem): string[] {
  const s = kstYmd(ev.startAt);
  const e = ev.endAt ? kstYmd(ev.endAt) : s;
  let t = Date.UTC(s.y, s.m - 1, s.d);
  const end = Date.UTC(e.y, e.m - 1, e.d);
  if (end < t) return [dayKey(s.y, s.m, s.d)];
  const keys: string[] = [];
  let guard = 0;
  while (t <= end && guard < 366) {
    const dt = new Date(t);
    keys.push(dayKey(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()));
    t += 86_400_000;
    guard++;
  }
  return keys;
}

function shortLabel(ev: EventItem): string {
  const s = kstYmd(ev.startAt);
  let out = `${s.m}.${s.d}`;
  if (ev.endAt) {
    const e = kstYmd(ev.endAt);
    if (dayKey(e.y, e.m, e.d) !== dayKey(s.y, s.m, s.d)) out += `~${e.m}.${e.d}`;
  }
  return out;
}

function longLabel(ev: EventItem): string {
  const s = kstYmd(ev.startAt);
  let out = `${s.y}년 ${s.m}월 ${s.d}일`;
  if (ev.endAt) {
    const e = kstYmd(ev.endAt);
    if (dayKey(e.y, e.m, e.d) !== dayKey(s.y, s.m, s.d)) {
      out += ` ~ ${e.y}년 ${e.m}월 ${e.d}일`;
    }
  }
  return out;
}

export function EventCalendar({
  events,
  initialYear,
  initialMonth,
  todayKey,
}: {
  events: EventItem[];
  initialYear: number;
  initialMonth: number; // 1-based
  todayKey: string;
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = events.find((e) => e.id === selectedId) ?? null;

  // 날짜 → 일정 목록
  const byDay = new Map<string, EventItem[]>();
  for (const ev of events) {
    for (const k of eventDayKeys(ev)) {
      const list = byDay.get(k) ?? [];
      list.push(ev);
      byDay.set(k, list);
    }
  }

  // 달 그리드
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function move(delta: number) {
    let y = year;
    let m = month + delta;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setYear(y);
    setMonth(m);
  }

  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
  const monthEvents = events
    .filter((e) => eventDayKeys(e).some((k) => k.startsWith(monthPrefix)))
    .sort((a, b) => (a.startAt < b.startAt ? -1 : 1));

  return (
    <div>
      {/* 월 이동 */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => move(-1)}
          className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:border-brand hover:text-brand"
        >
          ← 이전
        </button>
        <h2 className="font-serif text-xl font-bold text-ink">
          {year}년 {month}월
        </h2>
        <button
          type="button"
          onClick={() => move(1)}
          className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:border-brand hover:text-brand"
        >
          다음 →
        </button>
      </div>

      {/* 캘린더 */}
      <div className="overflow-hidden rounded-xl border border-line">
        <div className="grid grid-cols-7 border-b border-line bg-bg text-center text-xs font-semibold">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={`py-2 ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-muted2"}`}
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            if (d === null) {
              return (
                <div
                  key={i}
                  className="min-h-[76px] border-b border-r border-line-soft bg-bg/40"
                />
              );
            }
            const k = dayKey(year, month, d);
            const dayEvents = byDay.get(k) ?? [];
            const isToday = k === todayKey;
            const wd = i % 7;
            return (
              <div
                key={i}
                className="min-h-[76px] border-b border-r border-line-soft p-1"
              >
                <div
                  className={`mb-1 text-xs ${
                    isToday
                      ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand font-bold text-white"
                      : wd === 0
                        ? "text-red-500"
                        : wd === 6
                          ? "text-blue-500"
                          : "text-muted"
                  }`}
                >
                  {d}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => setSelectedId(ev.id)}
                      className="block w-full truncate rounded bg-brand/10 px-1 py-0.5 text-left text-[10px] font-medium text-brand hover:bg-brand/20"
                    >
                      {ev.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="px-1 text-[10px] text-muted2">
                      +{dayEvents.length - 3}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 이번 달 일정 목록 */}
      <div className="mt-6">
        <h3 className="mb-2 text-sm font-semibold text-muted">이번 달 일정</h3>
        {monthEvents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line py-8 text-center text-sm text-muted">
            이번 달 일정이 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {monthEvents.map((ev) => (
              <li key={ev.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(ev.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-bg"
                >
                  <span className="w-24 shrink-0 text-sm text-muted2 tabular-nums">
                    {shortLabel(ev)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink">
                      {ev.title}
                    </span>
                    {ev.location && (
                      <span className="block truncate text-xs text-muted2">
                        {ev.location}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 상세 모달 */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="mb-2 ml-auto block text-sm text-muted"
            >
              닫기 ✕
            </button>
            <p className="font-accent text-sm text-accent italic">
              {longLabel(selected)}
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold text-ink">
              {selected.title}
            </h2>
            {selected.location && (
              <p className="mt-2 text-sm text-muted">📍 {selected.location}</p>
            )}
            {selected.description && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {selected.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
