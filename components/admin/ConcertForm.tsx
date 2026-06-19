import { inputClass, labelClass, btnPrimary, card } from "./styles";
import { toDateInput } from "@/lib/format";

type ConcertDefaults = {
  title: string;
  performedAt: Date | string;
  venue: string | null;
  description: string | null;
  posterUrl: string | null;
};

export function ConcertForm({
  action,
  defaults,
  submitLabel = "저장",
}: {
  action: (formData: FormData) => Promise<void>;
  defaults?: ConcertDefaults;
  submitLabel?: string;
}) {
  return (
    <form action={action} className={`${card} space-y-4`}>
      <div>
        <label className={labelClass}>연주회 제목 *</label>
        <input
          name="title"
          required
          defaultValue={defaults?.title}
          placeholder="예) 2024 정기연주회"
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>연주 일자 *</label>
          <input
            name="performedAt"
            type="date"
            required
            defaultValue={toDateInput(defaults?.performedAt)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>장소</label>
          <input
            name="venue"
            defaultValue={defaults?.venue ?? ""}
            placeholder="예) 학생회관 소극장"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>소개</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={defaults?.description ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>포스터 이미지</label>
        {defaults?.posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={defaults.posterUrl}
            alt="현재 포스터"
            className="mb-2 h-28 w-auto rounded border border-line"
          />
        )}
        <input name="poster" type="file" accept="image/*" className="text-sm" />
        <p className="mt-1 text-xs text-muted">
          비우면 기존 이미지가 유지됩니다. 없으면 첫 영상 썸네일이 표지로
          쓰입니다.
        </p>
      </div>

      <button type="submit" className={btnPrimary}>
        {submitLabel}
      </button>
    </form>
  );
}
