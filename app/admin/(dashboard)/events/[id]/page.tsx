import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/admin/EventForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { updateEvent, deleteEvent } from "@/lib/actions/events";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/events" className="text-sm text-muted hover:text-brand">
        ← 일정 목록
      </Link>
      <div className="mb-6 mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">일정 수정</h1>
        <DeleteButton action={deleteEvent.bind(null, id)} label="일정 삭제" />
      </div>
      <EventForm
        action={updateEvent.bind(null, id)}
        defaults={event}
        submitLabel="일정 저장"
      />
    </div>
  );
}
