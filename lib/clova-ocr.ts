import "server-only";
import { randomUUID } from "node:crypto";

// 네이버 클라우드 CLOVA OCR — 영수증(Receipt) 특화 도메인 클라이언트.
//
// 설정: NCP 콘솔에서 CLOVA OCR 도메인(영수증)을 만들면 Invoke URL과 Secret Key가 나온다.
//   CLOVA_OCR_INVOKE_URL=https://xxxx.apigw.ntruss.com/custom/v1/.../document/receipt
//   CLOVA_OCR_SECRET=<Secret Key>
// 키가 없으면 isOcrConfigured()가 false를 반환하고, 호출부는 "미설정"으로 안내한다.

export type ReceiptFields = {
  /** "YYYY-MM-DD" (인식 실패 시 없음) */
  occurredAt?: string;
  /** 상호명 */
  vendor?: string;
  /** 총 결제 금액(원) */
  amount?: number;
};

export function isOcrConfigured(): boolean {
  return Boolean(
    process.env.CLOVA_OCR_INVOKE_URL && process.env.CLOVA_OCR_SECRET,
  );
}

/** MIME 타입 → CLOVA가 받는 format. 호출부가 image/* 만 통과시키므로 이미지만 다룬다. */
function toFormat(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("tif")) return "tiff";
  return "jpg"; // image/jpeg 등
}

/** CLOVA 응답의 중첩 필드에서 값을 최대한 안전하게 꺼낸다. */
function pickText(node: unknown): string | undefined {
  if (!node || typeof node !== "object") return undefined;
  const n = node as Record<string, unknown>;
  const formatted = n.formatted as Record<string, unknown> | undefined;
  const value = formatted?.value;
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof n.text === "string" && n.text.trim()) return n.text.trim();
  return undefined;
}

/** "1,000" / "1000원" → 1000. 숫자를 못 만들면 undefined. */
function toAmount(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return undefined;
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** paymentInfo.date 의 formatted(year/month/day) 를 YYYY-MM-DD 로. */
function toDate(dateNode: unknown): string | undefined {
  if (!dateNode || typeof dateNode !== "object") return undefined;
  const formatted = (dateNode as Record<string, unknown>).formatted as
    | Record<string, unknown>
    | undefined;

  const year = formatted?.year;
  const month = formatted?.month;
  const day = formatted?.day;
  if (
    typeof year === "string" &&
    typeof month === "string" &&
    typeof day === "string" &&
    year.length === 4
  ) {
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // formatted가 없으면 text에서 날짜 패턴을 뽑아본다. (2024-01-05 / 2024.01.05 / 20240105)
  const text = pickText(dateNode);
  if (!text) return undefined;
  const sep = text.match(/(\d{4})[-.\/]\s?(\d{1,2})[-.\/]\s?(\d{1,2})/);
  if (sep) {
    return `${sep[1]}-${sep[2].padStart(2, "0")}-${sep[3].padStart(2, "0")}`;
  }
  const plain = text.match(/(\d{4})(\d{2})(\d{2})/);
  if (plain) return `${plain[1]}-${plain[2]}-${plain[3]}`;
  return undefined;
}

/** 영수증 이미지를 CLOVA OCR로 인식해 장부 입력에 쓸 필드를 뽑는다. */
export async function recognizeReceipt(file: File): Promise<ReceiptFields> {
  const invokeUrl = process.env.CLOVA_OCR_INVOKE_URL;
  const secret = process.env.CLOVA_OCR_SECRET;
  if (!invokeUrl || !secret) {
    throw new Error("영수증 자동 인식이 설정되지 않았습니다.");
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  const response = await fetch(invokeUrl, {
    method: "POST",
    headers: {
      "X-OCR-SECRET": secret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "V2",
      requestId: randomUUID(),
      timestamp: Date.now(),
      images: [
        {
          format: toFormat(file.type),
          name: "receipt",
          data: base64,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `영수증 인식 서버 오류입니다. (HTTP ${response.status})`,
    );
  }

  const json = (await response.json()) as Record<string, unknown>;
  const images = json.images as Array<Record<string, unknown>> | undefined;
  const image = images?.[0];
  if (!image) throw new Error("영수증을 인식하지 못했습니다.");

  if (image.inferResult && image.inferResult !== "SUCCESS") {
    throw new Error("영수증을 인식하지 못했습니다. 더 선명한 사진을 올려 주세요.");
  }

  const result = (image.receipt as Record<string, unknown> | undefined)
    ?.result as Record<string, unknown> | undefined;
  if (!result) throw new Error("영수증에서 정보를 찾지 못했습니다.");

  const storeInfo = result.storeInfo as Record<string, unknown> | undefined;
  const paymentInfo = result.paymentInfo as Record<string, unknown> | undefined;
  const totalPrice = result.totalPrice as Record<string, unknown> | undefined;

  const vendor = pickText(storeInfo?.name);
  const occurredAt = toDate(paymentInfo?.date);
  const amount = toAmount(pickText(totalPrice?.price));

  return {
    ...(occurredAt ? { occurredAt } : {}),
    ...(vendor ? { vendor } : {}),
    ...(amount !== undefined ? { amount } : {}),
  };
}
