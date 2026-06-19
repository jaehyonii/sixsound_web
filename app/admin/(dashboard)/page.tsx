import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { card } from "@/components/admin/styles";

export default async function AdminDashboard() {
  const [concerts, videos, notices, members] = await Promise.all([
    prisma.concert.count(),
    prisma.video.count(),
    prisma.notice.count(),
    prisma.member.count(),
  ]);

  const stats = [
    { label: "연주회", value: concerts, href: "/admin/concerts" },
    { label: "영상", value: videos, href: "/admin/concerts" },
    { label: "공지·일정", value: notices, href: "/admin/notices" },
    { label: "부원", value: members, href: "/admin/members" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">대시보드</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`${card} hover:shadow-sm`}>
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-brand">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/concerts/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + 새 연주회 등록
        </Link>
        <Link
          href="/admin/notices/new"
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand"
        >
          + 새 공지 작성
        </Link>
        <Link
          href="/admin/members/new"
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand"
        >
          + 부원 추가
        </Link>
      </div>
    </div>
  );
}
