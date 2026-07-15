import Link from "next/link";
import { EventForm } from "@/components/admin/EventForm";
import { createEvent } from "@/lib/actions/events";

export default function NewEventPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/events" className="text-sm text-muted hover:text-brand">
        ← 일정 목록
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-ink">일정 추가</h1>
      <EventForm action={createEvent} submitLabel="일정 등록" />
    </div>
  );
}
