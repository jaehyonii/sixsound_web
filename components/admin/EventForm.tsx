import { inputClass, labelClass, btnPrimary, card } from "./styles";
import { toDateInput } from "@/lib/format";

type EventDefaults = {
  title: string;
  startAt: Date | string;
  endAt: Date | string | null;
  location: string | null;
  description: string | null;
};

export function EventForm({
  action,
  defaults,
  submitLabel = "저장",
}: {
  action: (formData: FormData) => Promise<void>;
  defaults?: EventDefaults;
  submitLabel?: string;
}) {
  return (
    <form action={action} className={`${card} space-y-4`}>
      <div>
        <label className={labelClass}>일정 제목 *</label>
        <input
          name="title"
          required
          defaultValue={defaults?.title}
          placeholder="예) 정기연주회, 정기 합주"
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>날짜 *</label>
          <input
            name="startAt"
            type="date"
            required
            defaultValue={defaults ? toDateInput(defaults.startAt) : ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>종료일 (여러 날일 때, 선택)</label>
          <input
            name="endAt"
            type="date"
            defaultValue={toDateInput(defaults?.endAt)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>장소 (선택)</label>
        <input
          name="location"
          defaultValue={defaults?.location ?? ""}
          placeholder="예) 광운대학교 대강당, 동아리방"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>설명 (선택)</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={defaults?.description ?? ""}
          placeholder="예) 저녁 7시 합주, 참가 신청 필수"
          className={inputClass}
        />
      </div>

      <button type="submit" className={btnPrimary}>
        {submitLabel}
      </button>
    </form>
  );
}
