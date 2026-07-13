import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { privateUploadPath } from "@/lib/actions/util";

// 영수증 사진은 public/ 밖에 저장되므로 이 라우트로만 볼 수 있다. 운영진 인증 필수.
const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return new Response("권한이 없습니다.", { status: 401 });
  }

  const { id } = await params;
  const entry = await prisma.ledgerEntry.findUnique({
    where: { id },
    select: { receiptUrl: true },
  });
  if (!entry?.receiptUrl) {
    return new Response("영수증이 없습니다.", { status: 404 });
  }

  try {
    const buffer = await readFile(privateUploadPath(entry.receiptUrl));
    const ext = path.extname(entry.receiptUrl).toLowerCase();
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        // 공유 캐시에 남지 않도록 (영수증은 개인정보를 포함할 수 있다)
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("영수증 파일을 찾을 수 없습니다.", { status: 404 });
  }
}
