import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateDot, formatSignedWon } from "@/lib/format";
import { summarizeLedger } from "@/lib/ledger";
import { LedgerSummary } from "@/components/ledger/LedgerSummary";

export default async function AdminLedgerPage() {
  const entries = await prisma.ledgerEntry.findMany({
    orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
  });

  const { income, expense, balance } = summarizeLedger(entries);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">장부</h1>
        <Link
          href="/admin/ledger/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + 내역 추가
        </Link>
      </div>

      <div className="mb-6">
        <LedgerSummary income={income} expense={expense} balance={balance} />
      </div>

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line py-16 text-center text-muted">
          등록된 내역이 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {entries.map((entry) => {
            const isExpense = entry.type === "EXPENSE";
            return (
              <li key={entry.id}>
                <Link
                  href={`/admin/ledger/${entry.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-bg"
                >
                  <span className="w-20 shrink-0 text-sm text-muted2 tabular-nums">
                    {formatDateDot(entry.occurredAt)}
                    {entry.paidTime && (
                      <span className="block text-[11px] text-muted2">
                        {entry.paidTime}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink">
                      {entry.description}
                    </span>
                    <span className="block truncate text-xs text-muted2">
                      {[entry.category, entry.vendor, entry.method]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </span>
                  </span>
                  {entry.receiptUrl && (
                    <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-muted">
                      영수증
                    </span>
                  )}
                  <span
                    className={`w-32 shrink-0 text-right font-semibold tabular-nums ${
                      isExpense ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {formatSignedWon(entry.amount, isExpense)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
