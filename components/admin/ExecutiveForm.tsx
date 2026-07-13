import { inputClass, labelClass, btnPrimary, card } from "./styles";

type MemberOption = { id: string; name: string; generation: number };

type ExecutiveDefaults = {
  generation: number;
  title: string;
  memberId: string;
  sortOrder: number;
};

export function ExecutiveForm({
  action,
  members,
  defaults,
  submitLabel = "저장",
}: {
  action: (formData: FormData) => Promise<void>;
  members: MemberOption[];
  defaults?: ExecutiveDefaults;
  submitLabel?: string;
}) {
  return (
    <form action={action} className={`${card} space-y-4`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>집행부 기수 *</label>
          <input
            name="generation"
            type="number"
            required
            defaultValue={defaults?.generation ?? ""}
            placeholder="예) 37"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>직책 *</label>
          <input
            name="title"
            required
            defaultValue={defaults?.title ?? ""}
            placeholder="예) 회장, 부회장, 총무"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>부원 *</label>
          <select
            name="memberId"
            required
            defaultValue={defaults?.memberId ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              부원을 선택하세요
            </option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.generation}기)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>정렬 순서</label>
          <input
            name="sortOrder"
            type="number"
            defaultValue={defaults?.sortOrder ?? 0}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted">
            작을수록 위. 회장=0, 부회장=1 …
          </p>
        </div>
      </div>

      <button type="submit" className={btnPrimary}>
        {submitLabel}
      </button>
    </form>
  );
}
