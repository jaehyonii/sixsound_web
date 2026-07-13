import "server-only";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// 비공개 업로드 보관함. public/ 바깥이라 정적 서빙되지 않는다.
// 영수증처럼 로그인한 운영진만 봐야 하는 파일을 여기에 둔다.
const PRIVATE_DIR = path.join(process.cwd(), "private-uploads");

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

/**
 * 비공개 파일로 저장하고 **파일명만** 반환한다(경로 아님).
 * public/ 밖이라 URL로 직접 접근할 수 없고, 인증된 라우트를 통해서만 읽힌다.
 */
export async function savePrivateUpload(file: File): Promise<string | null> {
  if (!file.size) return null;
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const name = `${randomUUID()}${ext}`;
  await mkdir(PRIVATE_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(PRIVATE_DIR, name), buffer);
  return name;
}

/** 비공개 파일의 절대 경로. basename만 취해 경로 조작(../)을 막는다. */
export function privateUploadPath(name: string): string {
  return path.join(PRIVATE_DIR, path.basename(name));
}

/** 비공개 파일 삭제. 이미 없으면 조용히 넘어간다. */
export async function deletePrivateUpload(
  name: string | null | undefined,
): Promise<void> {
  if (!name) return;
  try {
    await unlink(privateUploadPath(name));
  } catch {
    // 파일이 이미 없거나 접근 불가 — 삭제 흐름을 막지 않는다.
  }
}
