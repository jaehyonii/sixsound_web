import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ko" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
