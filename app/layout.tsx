import type { Metadata } from "next";
import { Gowun_Batang, Spectral } from "next/font/google";
import "./globals.css";

// 제목용 명조. 한글 서브셋은 용량이 커 preload 하지 않고 swap 으로 렌더한다.
const gowun = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-gowun",
});

// 강조 라벨용 이탤릭 세리프 (영문 전용).
const spectral = Spectral({
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-spectral",
});

export const metadata: Metadata = {
  title: {
    default: "여섯소리 | 클래식기타 동아리",
    template: "%s | 여섯소리",
  },
  description:
    "클래식기타 동아리 여섯소리(sixsound). 연주회 영상 아카이브와 동아리 소식을 만나보세요.",
  openGraph: {
    title: "여섯소리 | 클래식기타 동아리",
    description: "클래식기타 동아리 여섯소리의 연주회 영상 아카이브",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`h-full ${gowun.variable} ${spectral.variable}`}>
      <body className="min-h-full">
        {/* 본문용 Pretendard (self-host CDN). React 19 stylesheet hoisting 으로 head 로 끌어올려진다. */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
          precedence="default"
        />
        {children}
      </body>
    </html>
  );
}
