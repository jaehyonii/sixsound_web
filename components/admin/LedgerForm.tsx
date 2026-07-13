"use client";

import { useState } from "react";
import { inputClass, labelClass, btnPrimary, card } from "./styles";
import { toDateInput } from "@/lib/format";

type LedgerDefaults = {
  id: string;
  occurredAt: Date | string;
  type: "INCOME" | "EXPENSE";
  description: string;
  amount: number;
  category: string | null;
  vendor: string | null;
  method: string | null;
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

/**
 * 장부 입력 폼.
 *
 * 영수증 사진은 파일 그대로 서버 액션에 실어 보내지 않는다. 카메라 사진은 수 MB라
 * 서버 액션 본문 제한에 걸리기 때문이다. 대신 사진을 고르는 즉시 /api/ledger/ocr 로
 * 올려 비공개 보관함에 저장하고, 폼에는 **파일명 문자열만** 담아 제출한다.
 * OCR이 성공하면 거래일·상호·금액까지 자동으로 채운다.
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
  const [vendor, setVendor] = useState(defaults?.vendor ?? "");
  const [amount, setAmount] = useState(defaults ? String(defaults.amount) : "");
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

      // 수정 화면에서는 이미 적혀 있는 값을 OCR 추측으로 덮어쓰지 않는다.
      const filled: string[] = [];
      const canFill = (current: string) => !isEdit || current.trim() === "";

      if (json.data?.occurredAt && canFill(occurredAt)) {
        setOccurredAt(json.data.occurredAt);
        filled.push("거래일");
      }
      if (json.data?.vendor && canFill(vendor)) {
        setVendor(json.data.vendor);
        filled.push("상호");
      }
      if (typeof json.data?.amount === "number" && canFill(amount)) {
        setAmount(String(Math.min(json.data.amount, MAX_AMOUNT)));
        filled.push("금액");
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
      {/* 영수증 → 저장 + 자동 기입. 파일이 아니라 저장된 파일명만 제출한다. */}
      <div className="rounded-lg border border-dashed border-line bg-bg p-4">
        <label className={labelClass}>영수증 사진</label>
        {/* capture 를 강제하지 않는다. 지정하면 iOS에서 카메라만 열려
            미리 찍어 둔 영수증을 갤러리에서 고를 수 없다. */}
        <input
          type="file"
          accept="image/*"
          onChange={handleReceiptChange}
          className="text-sm"
        />
        <input type="hidden" name="receiptPath" value={receiptPath} />
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
          <label className={labelClass}>분류</label>
          <input
            name="category"
            defaultValue={defaults?.category ?? ""}
            placeholder="예) 비품, 식비, 회비"
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
            defaultValue={defaults?.method ?? ""}
            placeholder="예) 카드, 현금, 이체"
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

      <div>
        <label className={labelClass}>비고</label>
        <input
          name="note"
          defaultValue={defaults?.note ?? ""}
          className={inputClass}
        />
      </div>

      {/* 업로드가 끝나기 전에 저장하면 receiptPath가 비어 영수증이 조용히 누락된다. */}
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
    // OCR 미설정 — 오류가 아니라 정상 상태다.
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
        인식 완료 — {state.filled.join("·")}을(를) 자동으로 채웠습니다. 값을
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
      사진을 올리면 거래일·상호·금액을 자동으로 채웁니다.
    </p>
  );
}
