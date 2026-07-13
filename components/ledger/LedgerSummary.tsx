import { formatWon } from "@/lib/format";

/** 총수입·총지출·잔액 카드. 공개 페이지와 관리자 페이지가 함께 쓴다. */
export function LedgerSummary({
  income,
  expense,
  balance,
}: {
  income: number;
  expense: number;
  balance: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card label="총수입" value={formatWon(income)} tone="text-emerald-600" />
      <Card label="총지출" value={formatWon(expense)} tone="text-red-600" />
      <Card label="잔액" value={formatWon(balance)} tone="text-ink" />
    </div>
  );
}

function Card({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-xl font-bold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
