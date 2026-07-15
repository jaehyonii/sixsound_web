import { prisma } from "@/lib/prisma";
import { EventCalendar } from "@/components/events/EventCalendar";

export const metadata = { title: "일정" };
export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const events = await prisma.event.findMany({ orderBy: { startAt: "asc" } });
  const items = events.map((e) => ({
    id: e.id,
    title: e.title,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt ? e.endAt.toISOString() : null,
    location: e.location,
    description: e.description,
  }));

  // KST 기준 현재 연/월/오늘 (SSR·클라이언트 초기값을 일치시킨다)
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [ty, tm] = todayKey.split("-").map(Number);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink">일정</h1>
        <p className="mt-2 text-muted">
          여섯소리의 연습·공연 일정입니다. 일정을 누르면 자세히 볼 수 있어요.
        </p>
      </header>
      <EventCalendar
        events={items}
        initialYear={ty}
        initialMonth={tm}
        todayKey={todayKey}
      />
    </div>
  );
}
