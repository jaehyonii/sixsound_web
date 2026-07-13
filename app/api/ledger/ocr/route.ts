import { auth } from "@/auth";
import { isOcrConfigured, recognizeReceipt } from "@/lib/clova-ocr";
import { savePrivateUpload } from "@/lib/actions/util";

// 영수증 업로드의 **유일한 경로**.
// 사진을 비공개 보관함에 저장하고(파일명 반환), 가능하면 CLOVA OCR로 값까지 뽑아준다.
// 폼은 이후 파일이 아니라 파일명 문자열만 서버 액션에 넘기므로 본문이 작게 유지된다.
//
// 인식이 실패하거나 OCR이 미설정이어도 **사진 저장은 성공**시킨다(ok: true).
// 총무가 수기로 값을 채워 그대로 저장할 수 있어야 하기 때문이다.
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json(
      { ok: false, error: "권한이 없습니다." },
      { status: 401 },
    );
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("file");
    if (value && typeof value !== "string") file = value as File;
  } catch {
    return Response.json(
      { ok: false, error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  if (!file || !file.type.startsWith("image/") || file.size === 0) {
    return Response.json(
      { ok: false, error: "이미지 파일만 올릴 수 있습니다." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { ok: false, error: "사진이 너무 큽니다. 10MB 이하로 올려 주세요." },
      { status: 413 },
    );
  }

  const receiptPath = await savePrivateUpload(file);

  if (!isOcrConfigured()) {
    return Response.json({ ok: true, receiptPath, data: {}, configured: false });
  }

  try {
    const data = await recognizeReceipt(file);
    return Response.json({ ok: true, receiptPath, data, configured: true });
  } catch (error) {
    const ocrError =
      error instanceof Error ? error.message : "영수증 인식에 실패했습니다.";
    return Response.json({
      ok: true,
      receiptPath,
      data: {},
      configured: true,
      ocrError,
    });
  }
}
