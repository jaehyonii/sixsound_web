import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LedgerForm } from "@/components/admin/LedgerForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { updateLedgerEntry, deleteLedgerEntry } from "@/lib/actions/ledger";

export default async function EditLedgerEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await prisma.ledgerEntry.findUnique({ where: { id } });
  if (!entry) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/ledger" className="text-sm text-muted hover:text-brand">
        ← 장부
      </Link>
      <div className="mb-6 mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">내역 수정</h1>
        <DeleteButton
          action={deleteLedgerEntry.bind(null, id)}
          label="내역 삭제"
        />
      </div>
      <LedgerForm
        action={updateLedgerEntry.bind(null, id)}
        defaults={entry}
        submitLabel="내역 저장"
      />
    </div>
  );
}
