import Link from "next/link";
import { ConcertForm } from "@/components/admin/ConcertForm";
import { createConcert } from "@/lib/actions/concerts";

export default function NewConcertPage() {
  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/concerts"
        className="text-sm text-muted hover:text-brand"
      >
        ← 연주회 목록
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-ink">새 연주회 등록</h1>
      <ConcertForm action={createConcert} submitLabel="연주회 만들기" />
      <p className="mt-3 text-sm text-muted">
        먼저 연주회를 만든 뒤, 다음 화면에서 영상을 추가합니다.
      </p>
    </div>
  );
}
