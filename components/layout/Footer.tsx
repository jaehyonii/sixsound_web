import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-semibold text-brand">여섯소리</span> · 클래식기타
          동아리
        </div>
        <div className="flex gap-4">
          <Link href="/archive" className="hover:text-brand">
            아카이브
          </Link>
          <Link href="/notices" className="hover:text-brand">
            공지·일정
          </Link>
          <Link href="/admin" className="hover:text-brand">
            운영진
          </Link>
        </div>
      </div>
    </footer>
  );
}
