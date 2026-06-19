import Link from "next/link";
import { MemberForm } from "@/components/admin/MemberForm";
import { createMember } from "@/lib/actions/members";

export default function NewMemberPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/members" className="text-sm text-muted hover:text-brand">
        ← 부원 목록
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-ink">부원 추가</h1>
      <MemberForm action={createMember} submitLabel="부원 등록" />
    </div>
  );
}
