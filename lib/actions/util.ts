import "server-only";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/** 폼 문자열 값 (트림). */
export function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

/** 빈 문자열이면 null. */
export function optStr(value: FormDataEntryValue | null): string | null {
  const s = str(value);
  return s ? s : null;
}

/** date input("YYYY-MM-DD") → Date. KST 정오로 고정해 표시 타임존에서 날짜가 밀리지 않게 한다. */
export function optDate(value: FormDataEntryValue | null): Date | null {
  const s = str(value);
  if (!s) return null;
  return new Date(`${s}T12:00:00+09:00`);
}

export function reqDate(value: FormDataEntryValue | null): Date {
  return optDate(value) ?? new Date();
}

export function toInt(value: FormDataEntryValue | null, fallback = 0): number {
  const n = Number(str(value));
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export function bool(value: FormDataEntryValue | null): boolean {
  const s = str(value);
  return s === "on" || s === "true" || s === "1";
}

/** 업로드 파일을 public/uploads 에 저장하고 공개 경로를 반환. 파일 없으면 null. */
export async function saveUpload(
  value: FormDataEntryValue | null,
): Promise<string | null> {
  if (!value || typeof value === "string") return null;
  const file = value as File;
  if (!file.size) return null;

  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const name = `${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${name}`;
}
