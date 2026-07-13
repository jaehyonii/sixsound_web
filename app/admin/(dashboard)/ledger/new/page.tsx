import Link from "next/link";
import { LedgerForm } from "@/components/admin/LedgerForm";
import { createLedgerEntry } from "@/lib/actions/ledger";

export default function NewLedgerEntryPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/ledger" className="text-sm text-muted hover:text-brand">
        ← 장부
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-ink">내역 추가</h1>
      <LedgerForm action={createLedgerEntry} submitLabel="내역 등록" />
    </div>
  );
}
