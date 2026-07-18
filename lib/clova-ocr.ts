import "server-only";
import { randomUUID } from "node:crypto";

// 네이버 클라우드 CLOVA OCR — 영수증(Receipt) 특화 도메인 클라이언트.
//
// 설정: NCP 콘솔에서 CLOVA OCR 도메인(영수증)을 만들고 API Gateway 연동을 하면
//   외부용 Invoke URL(...apigw.ntruss.com/.../document/receipt)과 Secret Key가 나온다.
//   CLOVA_OCR_INVOKE_URL / CLOVA_OCR_SECRET 에 넣는다.
// 키가 없으면 isOcrConfigured()가 false를 반환하고, 호출부는 "미설정"으로 안내한다.

export type ReceiptItem = {
  name: string;
  count?: string; // 수량 (원문 그대로, 예: "2")
  unitPrice?: number; // 단가
  price?: number; // 금액
};

export type AmountLine = {
  label: string; // 예: 총액, 공급가액, 부가세
  value: number;
};

export type ReceiptFields = {
  occurredAt?: string; // "YYYY-MM-DD"
  paidTime?: string; // "HH:MM"
  vendor?: string; // 상호명
  method?: string; // 결제수단 (카드사명 등, 감지되면)
  amount?: number; // 총 결제 금액(원)
  items?: ReceiptItem[]; // 품목 상세
  amountDetail?: AmountLine[]; // 금액 상세(총액·공급가액·부가세 등)
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

type Node = Record<string, unknown>;

function asNode(v: unknown): Node | undefined {
  return v && typeof v === "object" ? (v as Node) : undefined;
}

/** CLOVA 필드에서 값을 안전하게 꺼낸다. formatted.value 우선, 없으면 text. */
function pickText(node: unknown): string | undefined {
  const n = asNode(node);
  if (!n) return undefined;
  const formatted = asNode(n.formatted);
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

/** paymentInfo.date → YYYY-MM-DD. */
function toDate(dateNode: unknown): string | undefined {
  const n = asNode(dateNode);
  if (!n) return undefined;
  const formatted = asNode(n.formatted);
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
  const text = pickText(dateNode);
  if (!text) return undefined;
  const sep = text.match(/(\d{4})[-.\/]\s?(\d{1,2})[-.\/]\s?(\d{1,2})/);
  if (sep) return `${sep[1]}-${sep[2].padStart(2, "0")}-${sep[3].padStart(2, "0")}`;
  const plain = text.match(/(\d{4})(\d{2})(\d{2})/);
  if (plain) return `${plain[1]}-${plain[2]}-${plain[3]}`;
  return undefined;
}

/** paymentInfo.time → HH:MM. */
function toTime(timeNode: unknown): string | undefined {
  const n = asNode(timeNode);
  if (!n) return undefined;
  const formatted = asNode(n.formatted);
  const hour = formatted?.hour;
  const minute = formatted?.minute;
  if (typeof hour === "string" && typeof minute === "string") {
    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  }
  const text = pickText(timeNode);
  const m = text?.match(/(\d{1,2}):(\d{2})/);
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : undefined;
}

/** 품목 상세: subResults[].items[] 에서 이름·수량·단가·금액을 뽑는다. */
function parseItems(result: Node): ReceiptItem[] {
  const items: ReceiptItem[] = [];
  const subResults = Array.isArray(result.subResults)
    ? (result.subResults as unknown[])
    : [];
  for (const sub of subResults) {
    const list = asNode(sub)?.items;
    if (!Array.isArray(list)) continue;
    for (const raw of list) {
      const it = asNode(raw);
      if (!it) continue;
      const name = pickText(it.name);
      if (!name) continue;
      const priceNode = asNode(it.price);
      items.push({
        name,
        count: pickText(it.count),
        unitPrice: toAmount(pickText(priceNode?.unitPrice)),
        price: toAmount(pickText(priceNode?.price)),
      });
    }
  }
  return items;
}

/** 금액 상세: 총액 + 인식된 공급가액·부가세·면세 등 라벨 있는 금액들. */
function parseAmountDetail(result: Node, total?: number): AmountLine[] {
  const lines: AmountLine[] = [];
  const seen = new Set<string>();
  const push = (label: string, value: number | undefined) => {
    if (value === undefined) return;
    const key = `${label}:${value}`;
    if (seen.has(key)) return;
    seen.add(key);
    lines.push({ label, value });
  };

  if (total !== undefined) push("총액", total);

  // subTotal: 문서상 공급가액/부가세 등 라벨 있는 금액 목록(영수증마다 유무 다름).
  const subTotal = result.subTotal;
  if (Array.isArray(subTotal)) {
    for (const raw of subTotal) {
      const n = asNode(raw);
      if (!n) continue;
      // 라벨 후보: keyText → title → "금액"
      const priceNode = asNode(n.price) ?? n;
      const label =
        pickText(n.title) ||
        (typeof (asNode(n.price)?.keyText ?? n.keyText) === "string"
          ? String(asNode(n.price)?.keyText ?? n.keyText).replace(/[:：]\s*$/, "")
          : "") ||
        "금액";
      push(label, toAmount(pickText(priceNode.price) ?? pickText(priceNode)));
    }
  }
  return lines;
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
    headers: { "X-OCR-SECRET": secret, "Content-Type": "application/json" },
    body: JSON.stringify({
      version: "V2",
      requestId: randomUUID(),
      timestamp: Date.now(),
      images: [{ format: toFormat(file.type), name: "receipt", data: base64 }],
    }),
  });

  if (!response.ok) {
    throw new Error(`영수증 인식 서버 오류입니다. (HTTP ${response.status})`);
  }

  const json = (await response.json()) as Node;
  const images = Array.isArray(json.images) ? (json.images as unknown[]) : [];
  const image = asNode(images[0]);
  if (!image) throw new Error("영수증을 인식하지 못했습니다.");

  if (image.inferResult && image.inferResult !== "SUCCESS") {
    throw new Error(
      "영수증을 인식하지 못했습니다. 더 선명한 사진을 올려 주세요.",
    );
  }

  const result = asNode(asNode(image.receipt)?.result);
  if (!result) throw new Error("영수증에서 정보를 찾지 못했습니다.");

  const storeInfo = asNode(result.storeInfo);
  const paymentInfo = asNode(result.paymentInfo);
  const totalPrice = asNode(result.totalPrice);

  const vendor = pickText(storeInfo?.name);
  const occurredAt = toDate(paymentInfo?.date);
  const paidTime = toTime(paymentInfo?.time);
  const amount = toAmount(pickText(totalPrice?.price));

  // 결제수단: 카드 정보가 잡히면 카드사명(있으면)과 함께 "카드"로.
  let method: string | undefined;
  const cardInfo = asNode(paymentInfo?.cardInfo);
  if (cardInfo) {
    const company = pickText(cardInfo.company);
    method = company ? `카드(${company})` : "카드";
  }

  const items = parseItems(result);
  const amountDetail = parseAmountDetail(result, amount);

  return {
    ...(occurredAt ? { occurredAt } : {}),
    ...(paidTime ? { paidTime } : {}),
    ...(vendor ? { vendor } : {}),
    ...(method ? { method } : {}),
    ...(amount !== undefined ? { amount } : {}),
    ...(items.length ? { items } : {}),
    ...(amountDetail.length ? { amountDetail } : {}),
  };
}
