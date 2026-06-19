import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl">🎸</p>
      <h1 className="text-2xl font-bold text-ink">페이지를 찾을 수 없습니다</h1>
      <p className="text-muted">요청하신 페이지가 없거나 이동되었습니다.</p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        홈으로
      </Link>
    </div>
  );
}
