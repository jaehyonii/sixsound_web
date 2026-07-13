import type { LedgerType } from "@prisma/client";

/**
 * 장부 합계. 금액은 항상 양수로 저장되고 수입/지출은 type이 결정한다.
 * 공개 페이지와 관리자 페이지가 같은 숫자를 보여주도록 계산을 한 곳에 둔다.
 */
export function summarizeLedger(
  entries: { type: LedgerType; amount: number }[],
) {
  let income = 0;
  let expense = 0;
  for (const entry of entries) {
    if (entry.type === "INCOME") income += entry.amount;
    else expense += entry.amount;
  }
  return { income, expense, balance: income - expense };
}
