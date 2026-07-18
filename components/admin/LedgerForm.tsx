"use client";

import { useState } from "react";
import { inputClass, labelClass, btnPrimary, card } from "./styles";
import { toDateInput, formatWon } from "@/lib/format";

type Item = {
  name: string;
  count?: string;
  unitPrice?: number;
  price?: number;
};
type AmountLine = { label: string; value: number };

type LedgerDefaults = {
  id: string;
  occurredAt: Date | string;
  type: "INCOME" | "EXPENSE";
  description: string;
  amount: number;
  category: string | null;
  vendor: string | null;
  method: string | null;
  paidTime: string | null;
  items: unknown;
  amountDetail: unknown;
  note: string | null;
  receiptUrl: string | null;
};

type OcrState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "saved";
      filled: string[];
      ocrDisabled: boolean;
      ocrError?: string;
    }
  | { status: "error"; message: string };

const MAX_AMOUNT = 2_000_000_000;

// DB의 Json 값(unknown)을 배열로 안전 변환.
function asItems(v: unknown): Item[] {
  return Array.isArray(v) ? (v as Item[]) : [];
}
function asLines(v: unknown): AmountLine[] {
  return Array.isArray(v) ? (v as AmountLine[]) : [];
}

/**
 * 장부 입력 폼. 영수증 사진을 고르면 /api/ledger/ocr 로 올려 비공개 저장하고,
 * 인식되면 거래일·시각·상호·결제수단·금액·품목·금액상세를 자동으로 채운다.
 * 총무가 검토·수정한 뒤 저장한다. OCR이 실패해도 수기 입력으로 저장할 수 있다.
 */
export function LedgerForm({
  action,
  defaults,
  submitLabel = "저장",
}: {
  action: (formData: FormData) => Promise<void>;
  defaults?: LedgerDefaults;
  submitLabel?: string;
}) {
  const isEdit = Boolean(defaults);

  const [occurredAt, setOccurredAt] = useState(
    defaults ? toDateInput(defaults.occurredAt) : toDateInput(new Date()),
  );
  const [paidTime, setPaidTime] = useState(defaults?.paidTime ?? "");
  const [vendor, setVendor] = useState(defaults?.vendor ?? "");
  const [method, setMethod] = useState(defaults?.method ?? "");
  const [amount, setAmount] = useState(defaults ? String(defaults.amount) : "");
  const [items, setItems] = useState<Item[]>(asItems(defaults?.items));
  const [amountDetail, setAmountDetail] = useState<AmountLine[]>(
    asLines(defaults?.amountDetail),
  );
  const [receiptPath, setReceiptPath] = useState("");
  const [ocr, setOcr] = useState<OcrState>({ status: "idle" });

  async function handleReceiptChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setOcr({ status: "loading" });
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/ledger/ocr", { method: "POST", body });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setOcr({
          status: "error",
          message: json.error ?? "사진을 올리지 못했습니다.",
        });
        return;
      }

      if (json.receiptPath) setReceiptPath(json.receiptPath);

      const d = json.data ?? {};
      const filled: string[] = [];
      const canFill = (current: string) => !isEdit || current.trim() === "";

      if (d.occurredAt && canFill(occurredAt)) {
        setOccurredAt(d.occurredAt);
        filled.push("거래일");
      }
      if (d.paidTime && canFill(paidTime)) {
        setPaidTime(d.paidTime);
        filled.push("시각");
      }
      if (d.vendor && canFill(vendor)) {
        setVendor(d.vendor);
        filled.push("상호");
      }
      if (d.method && canFill(method)) {
        setMethod(d.method);
        filled.push("결제수단");
      }
      if (typeof d.amount === "number" && canFill(amount)) {
        setAmount(String(Math.min(d.amount, MAX_AMOUNT)));
        filled.push("금액");
      }
      if (Array.isArray(d.items) && d.items.length) {
        setItems(d.items);
        filled.push(`품목 ${d.items.length}건`);
      }
      if (Array.isArray(d.amountDetail) && d.amountDetail.length) {
        setAmountDetail(d.amountDetail);
        filled.push("금액상세");
      }

      setOcr({
        status: "saved",
        filled,
        ocrDisabled: json.configured === false,
        ocrError: json.ocrError,
      });
    } catch {
      setOcr({
        status: "error",
        message: "사진을 올리는 중 오류가 발생했습니다.",
      });
    }
  }

  return (
    <form action={action} className={`${card} space-y-4`}>
      {/* 영수증 → 저장 + 자동 기입 */}
      <div className="rounded-lg border border-dashed border-line bg-bg p-4">
        <label className={labelClass}>영수증 사진</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleReceiptChange}
          className="text-sm"
        />
        <input type="hidden" name="receiptPath" value={receiptPath} />
        <input type="hidden" name="items" value={JSON.stringify(items)} />
        <input
          type="hidden"
          name="amountDetail"
          value={JSON.stringify(amountDetail)}
        />
        <OcrStatus state={ocr} />
        {defaults?.receiptUrl && ocr.status === "idle" && (
          <p className="mt-2 text-xs text-muted">
            등록된 영수증이 있습니다. 새로 올리면 교체됩니다.{" "}
            <a
              href={`/api/ledger/receipt/${defaults.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline"
            >
              보기
            </a>
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>거래일 *</label>
          <input
            name="occurredAt"
            type="date"
            required
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>시각</label>
          <input
            name="paidTime"
            type="time"
            value={paidTime}
            onChange={(e) => setPaidTime(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>유형 *</label>
          <select
            name="type"
            required
            defaultValue={defaults?.type ?? "EXPENSE"}
            className={inputClass}
          >
            <option value="EXPENSE">지출</option>
            <option value="INCOME">수입</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>금액(원) *</label>
          <input
            name="amount"
            type="number"
            min="1"
            max={MAX_AMOUNT}
            step="1"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="예) 15000"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>상호</label>
          <input
            name="vendor"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="예) 낙원상가 기타나라"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>결제수단</label>
          <input
            name="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="예) 카드, 현금, 이체"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>분류</label>
          <input
            name="category"
            defaultValue={defaults?.category ?? ""}
            placeholder="예) 비품, 식비, 회비"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>내역 *</label>
        <input
          name="description"
          required
          defaultValue={defaults?.description ?? ""}
          placeholder="예) 동아리방 기타 줄 구입"
          className={inputClass}
        />
      </div>

      {/* 품목 상세 (영수증에서 자동 추출) */}
      {items.length > 0 && (
        <ItemsPreview items={items} onClear={() => setItems([])} />
      )}

      {/* 금액 상세 */}
      {amountDetail.length > 0 && (
        <AmountDetailPreview
          lines={amountDetail}
          onClear={() => setAmountDetail([])}
        />
      )}

      <div>
        <label className={labelClass}>비고</label>
        <input
          name="note"
          defaultValue={defaults?.note ?? ""}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={ocr.status === "loading"}
        className={btnPrimary}
      >
        {ocr.status === "loading" ? "사진 업로드 중…" : submitLabel}
      </button>
    </form>
  );
}

function ItemsPreview({
  items,
  onClear,
}: {
  items: Item[];
  onClear: () => void;
}) {
  return (
    <div className="rounded-lg border border-line bg-bg p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-ink">품목 상세</span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted hover:text-red-600"
        >
          지우기
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted2">
              <th className="py-1 pr-2 font-medium">품목</th>
              <th className="py-1 px-2 text-right font-medium">수량</th>
              <th className="py-1 px-2 text-right font-medium">단가</th>
              <th className="py-1 pl-2 text-right font-medium">금액</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-t border-line-soft">
                <td className="py-1.5 pr-2 text-ink">{it.name}</td>
                <td className="py-1.5 px-2 text-right tabular-nums text-muted">
                  {it.count ?? "—"}
                </td>
                <td className="py-1.5 px-2 text-right tabular-nums text-muted">
                  {it.unitPrice !== undefined ? formatWon(it.unitPrice) : "—"}
                </td>
                <td className="py-1.5 pl-2 text-right tabular-nums text-ink">
                  {it.price !== undefined ? formatWon(it.price) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AmountDetailPreview({
  lines,
  onClear,
}: {
  lines: AmountLine[];
  onClear: () => void;
}) {
  return (
    <div className="rounded-lg border border-line bg-bg p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-ink">금액 상세</span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted hover:text-red-600"
        >
          지우기
        </button>
      </div>
      <dl className="space-y-1 text-sm">
        {lines.map((l, i) => (
          <div key={i} className="flex justify-between">
            <dt className="text-muted">{l.label}</dt>
            <dd className="tabular-nums text-ink">{formatWon(l.value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function OcrStatus({ state }: { state: OcrState }) {
  if (state.status === "loading") {
    return <p className="mt-2 text-xs text-brand">사진을 올리는 중입니다…</p>;
  }

  if (state.status === "error") {
    return (
      <p className="mt-2 text-xs text-red-600">
        {state.message} 사진 없이 직접 입력해 저장할 수 있습니다.
      </p>
    );
  }

  if (state.status === "saved") {
    if (state.ocrDisabled) {
      return (
        <p className="mt-2 text-xs text-muted">
          사진이 첨부되었습니다. 자동 인식은 사용하지 않으니 아래 항목을 직접
          입력해 주세요.
        </p>
      );
    }
    if (state.ocrError) {
      return (
        <p className="mt-2 text-xs text-muted">
          사진은 첨부되었지만 인식하지 못했습니다. ({state.ocrError}) 아래 항목을
          직접 입력해 주세요.
        </p>
      );
    }
    return state.filled.length > 0 ? (
      <p className="mt-2 text-xs text-emerald-600">
        인식 완료 — {state.filled.join(" · ")} 을(를) 자동으로 채웠습니다. 값을
        확인하고 필요하면 고쳐 주세요.
      </p>
    ) : (
      <p className="mt-2 text-xs text-muted">
        사진이 첨부되었습니다. 영수증에서 값을 찾지 못해 직접 입력이 필요합니다.
      </p>
    );
  }

  return (
    <p className="mt-2 text-xs text-muted">
      사진을 올리면 거래일·시각·상호·결제수단·금액·품목을 자동으로 채웁니다.
    </p>
  );
}
