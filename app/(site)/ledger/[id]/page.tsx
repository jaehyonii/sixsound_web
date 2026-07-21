import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatDate, formatWon, formatSignedWon } from "@/lib/format";

export const dynamic = "force-dynamic";

type Item = { name: string; count?: string; unitPrice?: number; price?: number };
type AmountLine = { label: string; value: number };

function asItems(v: unknown): Item[] {
  return Array.isArray(v) ? (v as Item[]) : [];
}
function asLines(v: unknown): AmountLine[] {
  return Array.isArray(v) ? (v as AmountLine[]) : [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await prisma.ledgerEntry.findUnique({
    where: { id },
    select: { description: true },
  });
  return { title: entry ? `장부 · ${entry.description}` : "장부" };
}

export default async function LedgerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // 영수증 사진(이미지)은 공개하지 않는다. receiptUrl은 "존재 여부" 판단에만 쓴다.
  const entry = await prisma.ledgerEntry.findUnique({ where: { id } });
  if (!entry) notFound();

  const session = await auth();
  const isAdmin = Boolean(session?.user);
  const isExpense = entry.type === "EXPENSE";
  const items = asItems(entry.items);
  const amountDetail = asLines(entry.amountDetail);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/ledger"
        className="text-sm font-medium text-muted hover:text-brand"
      >
        ← 장부
      </Link>

      <header className="mt-4 mb-6 border-b border-line pb-6">
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${
              isExpense
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {isExpense ? "지출" : "수입"}
          </span>
          <h1 className="text-2xl font-bold text-ink">{entry.description}</h1>
        </div>
        <p
          className={`mt-3 text-2xl font-bold tabular-nums ${
            isExpense ? "text-red-600" : "text-emerald-600"
          }`}
        >
          {formatSignedWon(entry.amount, isExpense)}
        </p>
      </header>

      {/* 기본 내역 */}
      <dl className="divide-y divide-line-soft overflow-hidden rounded-xl border border-line bg-surface">
        <Row label="거래일">
          {formatDate(entry.occurredAt)}
          {entry.paidTime ? ` ${entry.paidTime}` : ""}
        </Row>
        {entry.vendor && <Row label="상호">{entry.vendor}</Row>}
        {entry.method && <Row label="결제수단">{entry.method}</Row>}
        {entry.category && <Row label="분류">{entry.category}</Row>}
        {entry.note && <Row label="비고">{entry.note}</Row>}
      </dl>

      {/* 품목 상세 */}
      {items.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-muted">품목 상세</h2>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted2">
                  <th className="px-4 py-2 font-medium">품목</th>
                  <th className="px-2 py-2 text-right font-medium">수량</th>
                  <th className="px-2 py-2 text-right font-medium">단가</th>
                  <th className="px-4 py-2 text-right font-medium">금액</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-b border-line-soft last:border-0">
                    <td className="px-4 py-2 text-ink">{it.name}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted">
                      {it.count ?? "—"}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted">
                      {it.unitPrice !== undefined
                        ? formatWon(it.unitPrice)
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-ink">
                      {it.price !== undefined ? formatWon(it.price) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 금액 상세 */}
      {amountDetail.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-muted">금액 상세</h2>
          <dl className="divide-y divide-line-soft overflow-hidden rounded-xl border border-line bg-surface">
            {amountDetail.map((l, i) => (
              <div key={i} className="flex justify-between px-4 py-2.5">
                <dt className="text-sm text-muted">{l.label}</dt>
                <dd className="text-sm tabular-nums text-ink">
                  {formatWon(l.value)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* 영수증: 이미지는 운영진만 */}
      {entry.receiptUrl && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-muted">영수증</h2>
          {isAdmin ? (
            <a
              href={`/api/ledger/receipt/${entry.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-brand hover:border-brand"
            >
              영수증 이미지 보기 ↗
            </a>
          ) : (
            <p className="rounded-lg border border-dashed border-line bg-surface px-4 py-3 text-sm text-muted">
              영수증 이미지는 운영진만 열람할 수 있습니다.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between px-4 py-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink">{children}</dd>
    </div>
  );
}
