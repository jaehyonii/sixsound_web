import { inputClass, labelClass, btnPrimary, card } from "./styles";

type NoticeDefaults = {
  title: string;
  content: string;
  isPinned: boolean;
};

export function NoticeForm({
  action,
  defaults,
  submitLabel = "저장",
}: {
  action: (formData: FormData) => Promise<void>;
  defaults?: NoticeDefaults;
  submitLabel?: string;
}) {
  return (
    <form action={action} className={`${card} space-y-4`}>
      <div>
        <label className={labelClass}>제목 *</label>
        <input
          name="title"
          required
          defaultValue={defaults?.title}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>내용 *</label>
        <textarea
          name="content"
          required
          rows={8}
          defaultValue={defaults?.content}
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input
          name="isPinned"
          type="checkbox"
          defaultChecked={defaults?.isPinned}
          className="h-4 w-4"
        />
        상단 고정
      </label>

      <button type="submit" className={btnPrimary}>
        {submitLabel}
      </button>
    </form>
  );
}
