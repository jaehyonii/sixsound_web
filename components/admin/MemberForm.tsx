import { inputClass, labelClass, btnPrimary, card } from "./styles";

type MemberDefaults = {
  name: string;
  generation: number;
  bio: string | null;
  photoUrl: string | null;
};

export function MemberForm({
  action,
  defaults,
  submitLabel = "저장",
}: {
  action: (formData: FormData) => Promise<void>;
  defaults?: MemberDefaults;
  submitLabel?: string;
}) {
  return (
    <form action={action} className={`${card} space-y-4`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>이름 *</label>
          <input
            name="name"
            required
            defaultValue={defaults?.name}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>기수 *</label>
          <input
            name="generation"
            type="number"
            required
            defaultValue={defaults?.generation ?? 1}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>한 줄 소개</label>
        <input
          name="bio"
          defaultValue={defaults?.bio ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>사진</label>
        {defaults?.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={defaults.photoUrl}
            alt="현재 사진"
            className="mb-2 h-20 w-20 rounded-full border border-line object-cover"
          />
        )}
        <input name="photo" type="file" accept="image/*" className="text-sm" />
        <p className="mt-1 text-xs text-muted">비우면 기존 사진이 유지됩니다.</p>
      </div>

      <button type="submit" className={btnPrimary}>
        {submitLabel}
      </button>
    </form>
  );
}
