import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-ink text-[#cabfae]">
      <div className="mx-auto max-w-6xl px-5 pt-14 pb-9 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div className="max-w-[34ch]">
            <div className="mb-4 flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-mascot.svg"
                alt="여섯소리 마스코트"
                className="h-10 w-auto"
              />
              <span className="font-serif text-lg font-bold text-bg">여섯소리</span>
            </div>
            <p className="text-sm leading-relaxed text-[#a99a86]">
              여섯 줄이 만드는 여섯 가지 울림. 광운대학교 클래식기타 동아리
              여섯소리의 연주 아카이브입니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-16">
            <div>
              <div className="mb-3.5 text-xs uppercase tracking-[0.14em] text-[#7d6f5d]">
                Contact
              </div>
              <div className="text-sm leading-loose text-[#cabfae]">
                광운대학교 클래식기타반
                <br />
                서울 노원구 광운로 20
                <br />
                sixsounds@kw.ac.kr
              </div>
            </div>
            <div>
              <div className="mb-3.5 text-xs uppercase tracking-[0.14em] text-[#7d6f5d]">
                Follow
              </div>
              <a
                href="https://www.instagram.com/kwu_sixsounds"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#cabfae] transition-colors hover:text-accent"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
                @kwu_sixsounds
              </a>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap justify-between gap-3 border-t border-[#443c34] pt-6 text-[13px] text-[#7d6f5d]">
          <span>© 2025 sixsound · Kwangwoon University Classical Guitar Club</span>
          <Link href="/admin" className="transition-colors hover:text-accent">
            운영진
          </Link>
        </div>
      </div>
    </footer>
  );
}
