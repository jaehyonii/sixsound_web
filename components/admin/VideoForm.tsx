import type { VideoSourceType } from "@prisma/client";
import { inputClass, labelClass, btnPrimary } from "./styles";

type VideoDefaults = {
  title: string;
  sourceType: VideoSourceType;
  sourceRef: string;
  pieceTitle: string | null;
  composer: string | null;
  performers: string | null;
  sortOrder: number;
};

export function VideoForm({
  action,
  defaults,
  submitLabel = "추가",
  compact,
}: {
  action: (formData: FormData) => Promise<void>;
  defaults?: VideoDefaults;
  submitLabel?: string;
  compact?: boolean;
}) {
  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>영상 제목 *</label>
          <input
            name="title"
            required
            defaultValue={defaults?.title}
            placeholder="예) Asturias - Leyenda"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>소스 종류</label>
          <select
            name="sourceType"
            defaultValue={defaults?.sourceType ?? "YOUTUBE"}
            className={inputClass}
          >
            <option value="YOUTUBE">YouTube</option>
            <option value="FILE">자체 호스팅 파일</option>
            <option value="EXTERNAL">외부 링크</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>
            소스 (YouTube 링크/ID · 파일경로 · URL) *
          </label>
          <input
            name="sourceRef"
            required
            defaultValue={defaults?.sourceRef}
            placeholder="https://youtu.be/xxxxxxxxxxx"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>곡명</label>
          <input
            name="pieceTitle"
            defaultValue={defaults?.pieceTitle ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>작곡가</label>
          <input
            name="composer"
            defaultValue={defaults?.composer ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>연주자</label>
          <input
            name="performers"
            defaultValue={defaults?.performers ?? ""}
            className={inputClass}
          />
        </div>
        {!compact && (
          <div>
            <label className={labelClass}>정렬 순서</label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={defaults?.sortOrder ?? 0}
              className={inputClass}
            />
          </div>
        )}
      </div>

      <button type="submit" className={btnPrimary}>
        {submitLabel}
      </button>
    </form>
  );
}
