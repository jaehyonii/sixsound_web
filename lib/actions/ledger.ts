"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { LedgerType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { deletePrivateUpload, optStr, str, toInt } from "./util";

// Postgres int4 상한(2,147,483,647) 아래로 묶는다. 자릿수 실수로 DB가 터지지 않게.
const MAX_AMOUNT = 2_000_000_000;

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("권한이 없습니다.");
}

function refresh() {
  revalidatePath("/admin/ledger");
  revalidatePath("/ledger");
}

// /api/ledger/ocr 가 만들어 준 파일명(uuid.확장자) 형태만 받는다.
// 폼이 보내는 문자열을 그대로 믿으면 다른 항목의 영수증을 가리키게 만들 수 있다.
const RECEIPT_NAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{2,5}$/i;

function readReceiptPath(formData: FormData): string | null {
  const value = optStr(formData.get("receiptPath"));
  if (!value) return null;
  return RECEIPT_NAME.test(value) ? value : null;
}

/**
 * 폼 값 → 장부 필드. 장부는 돈을 다루므로 클라이언트 required에 기대지 않고
 * 서버에서 다시 검증한다. 잘못된 값은 조용히 보정하지 않고 거부한다.
 */
function readFields(formData: FormData) {
  const description = str(formData.get("description"));
  if (!description) throw new Error("내역을 입력해 주세요.");

  const amount = Math.abs(toInt(formData.get("amount")));
  if (amount <= 0) throw new Error("금액은 1원 이상이어야 합니다.");
  if (amount > MAX_AMOUNT) {
    throw new Error("금액이 너무 큽니다. 자릿수를 확인해 주세요.");
  }

  // 날짜가 비었거나 형식이 틀리면 '오늘'로 조용히 대체하지 않고 거부한다.
  const dateInput = str(formData.get("occurredAt"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    throw new Error("거래일을 올바르게 입력해 주세요.");
  }
  const occurredAt = new Date(`${dateInput}T12:00:00+09:00`);
  if (Number.isNaN(occurredAt.getTime())) {
    throw new Error("거래일을 올바르게 입력해 주세요.");
  }

  return {
    occurredAt,
    type: (str(formData.get("type")) === "INCOME"
      ? "INCOME"
      : "EXPENSE") as LedgerType,
    description,
    amount,
    category: optStr(formData.get("category")),
    vendor: optStr(formData.get("vendor")),
    method: optStr(formData.get("method")),
    note: optStr(formData.get("note")),
  };
}

export async function createLedgerEntry(formData: FormData) {
  await requireAuth();
  // 사진 자체는 /api/ledger/ocr 이 이미 저장했다. 여기엔 파일명만 넘어온다.
  const receiptUrl = readReceiptPath(formData);
  await prisma.ledgerEntry.create({
    data: { ...readFields(formData), receiptUrl },
  });
  refresh();
  redirect("/admin/ledger");
}

export async function updateLedgerEntry(id: string, formData: FormData) {
  await requireAuth();
  const newReceipt = readReceiptPath(formData);
  const existing = await prisma.ledgerEntry.findUnique({
    where: { id },
    select: { receiptUrl: true },
  });

  await prisma.ledgerEntry.update({
    where: { id },
    data: {
      ...readFields(formData),
      // 새 사진을 올린 경우에만 교체
      ...(newReceipt ? { receiptUrl: newReceipt } : {}),
    },
  });

  // 교체됐으면 옛 파일을 지운다(디스크에 영영 남지 않도록).
  if (newReceipt && existing?.receiptUrl && existing.receiptUrl !== newReceipt) {
    await deletePrivateUpload(existing.receiptUrl);
  }

  refresh();
  redirect("/admin/ledger");
}

export async function deleteLedgerEntry(id: string) {
  await requireAuth();
  const entry = await prisma.ledgerEntry.delete({ where: { id } });
  await deletePrivateUpload(entry.receiptUrl);
  refresh();
  redirect("/admin/ledger");
}
