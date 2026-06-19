"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/about", label: "소개" },
  { href: "/archive", label: "연주회 아카이브" },
  { href: "/notices", label: "공지 / 일정" },
  { href: "/members", label: "부원 소개" },
];

function Mark({ className }: { className?: string }) {
  // 여섯소리 심볼 — 울림통의 동심원.
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <circle cx="20" cy="20" r="18.5" stroke="#8a5a2b" strokeWidth="1.4" />
      <circle cx="20" cy="20" r="12.5" stroke="#c08a45" strokeWidth="1.1" />
      <circle cx="20" cy="20" r="6.5" stroke="#8a5a2b" strokeWidth="1.1" />
      <circle cx="20" cy="20" r="2.2" fill="#6d451f" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Mark className="h-[26px] w-[26px]" />
          <span className="font-serif text-[19px] font-bold tracking-tight text-ink">
            여섯소리
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap text-[15px] transition-colors hover:text-brand ${
                isActive(item.href)
                  ? "font-bold text-brand"
                  : "font-medium text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden"
          aria-label="메뉴 열기"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2b2622"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-line bg-surface px-5 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-2 py-2.5 text-[15px] font-medium ${
                isActive(item.href)
                  ? "bg-bg text-brand"
                  : "text-ink hover:text-brand"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
