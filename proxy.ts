import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Next.js 16의 proxy(구 middleware) 규약. Edge-safe 설정만으로 /admin 보호.
// JWT 쿠키만 검사하므로 Prisma 불필요.
export const { auth: proxy } = NextAuth(authConfig);

export default proxy(() => {
  // authorized 콜백(auth.config.ts)이 리다이렉트를 처리한다.
  return undefined;
});

export const config = {
  matcher: ["/admin/:path*"],
};
