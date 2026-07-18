-- 영수증 OCR 확장: 결제 시각, 품목 상세, 금액 상세
ALTER TABLE "LedgerEntry" ADD COLUMN "paidTime" TEXT;
ALTER TABLE "LedgerEntry" ADD COLUMN "items" JSONB;
ALTER TABLE "LedgerEntry" ADD COLUMN "amountDetail" JSONB;
