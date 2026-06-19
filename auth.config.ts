import type { NextAuthConfig } from "next-auth";

// Edge(미들웨어)에서도 안전하게 쓰이는 설정. Prisma/bcrypt 같은 Node 전용 코드는 넣지 않는다.
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    // 미들웨어에서 /admin 보호에 사용된다.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnLogin = nextUrl.pathname.startsWith("/admin/login");

      if (isOnLogin) {
        // 이미 로그인한 상태로 로그인 페이지에 오면 대시보드로 보낸다.
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }
      if (isOnAdmin) {
        return isLoggedIn; // 미인증이면 signIn 페이지로 리다이렉트됨
      }
      return true;
    },
  },
  providers: [], // 실제 provider는 auth.ts 에서 주입 (Node 런타임)
} satisfies NextAuthConfig;
