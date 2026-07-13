import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/auth-actions";

const NAV = [
  { href: "/admin", label: "대시보드", exact: true },
  { href: "/admin/concerts", label: "연주회·영상" },
  { href: "/admin/notices", label: "공지·일정" },
  { href: "/admin/members", label: "부원" },
  { href: "/admin/executives", label: "집행부" },
  { href: "/admin/about", label: "동아리 소개" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 미들웨어가 1차 보호하지만, 레이아웃에서도 세션을 확인한다.
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/admin" className="font-bold text-brand">
              여섯소리 관리자
            </Link>
            <Link
              href="/"
              target="_blank"
              className="text-xs text-muted hover:text-brand"
            >
              사이트 보기 ↗
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted">{session.user.name}</span>
            <form action={logoutAction}>
              <button className="rounded-lg border border-line px-3 py-1.5 font-medium text-ink hover:border-brand hover:text-brand">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6">
        <aside className="hidden w-48 shrink-0 md:block">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* 모바일 네비 */}
      <nav className="flex gap-1 overflow-x-auto border-t border-line bg-surface px-2 py-2 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
