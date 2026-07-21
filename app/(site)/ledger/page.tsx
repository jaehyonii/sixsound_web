import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateDot, formatSignedWon } from "@/lib/format";
import { summarizeLedger } from "@/lib/ledger";
import { LedgerSummary } from "@/components/ledger/LedgerSummary";

export const metadata = { title: "장부" };
export const dynamic = "force-dynamic";

export default async function LedgerPage() {
  // 공개 페이지는 영수증 사진(receiptUrl)을 절대 조회하지 않는다.
  const entries = await prisma.ledgerEntry.findMany({
    orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      occurredAt: true,
      type: true,
      description: true,
      amount: true,
      category: true,
    },
  });

  const { income, expense, balance } = summarizeLedger(entries);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink">장부</h1>
        <p className="mt-2 text-muted">
          여섯소리의 회비 수입과 지출 내역입니다.
        </p>
      </header>

      <div className="mb-8">
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
                  href={`/ledger/${entry.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-bg"
                >
                  <span className="w-20 shrink-0 text-sm text-muted2 tabular-nums">
                    {formatDateDot(entry.occurredAt)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink">
                      {entry.description}
                    </span>
                    {entry.category && (
                      <span className="block truncate text-xs text-muted2">
                        {entry.category}
                      </span>
                    )}
                  </span>
                  <span
                    className={`shrink-0 text-right font-semibold tabular-nums ${
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
