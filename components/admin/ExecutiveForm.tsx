import { inputClass, labelClass, btnPrimary, card } from "./styles";

type MemberOption = { id: string; name: string; generation: number };

type ExecutiveDefaults = {
  generation: number;
  title: string;
  memberId: string;
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
      </div>

      <p className="text-xs text-muted">
        표시 순서는 집행부 목록에서 드래그로 바꿉니다. 새로 등록하면 해당 기수의 맨
        아래에 추가됩니다.
      </p>

      <button type="submit" className={btnPrimary}>
        {submitLabel}
      </button>
    </form>
  );
}
