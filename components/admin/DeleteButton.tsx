"use client";

import { btnDanger } from "./styles";

export function DeleteButton({
  action,
  label = "삭제",
  confirmText = "정말 삭제할까요? 되돌릴 수 없습니다.",
}: {
  action: () => Promise<void>;
  label?: string;
  confirmText?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <button type="submit" className={btnDanger}>
        {label}
      </button>
    </form>
  );
}
