import Link from "next/link";
import { NoticeForm } from "@/components/admin/NoticeForm";
import { createNotice } from "@/lib/actions/notices";

export default function NewNoticePage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/notices" className="text-sm text-muted hover:text-brand">
        ← 공지 목록
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-ink">새 공지 작성</h1>
      <NoticeForm action={createNotice} submitLabel="공지 등록" />
    </div>
  );
}
