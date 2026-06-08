import type { NextAuthConfig } from "next-auth";

/**
 * Lightweight auth config used only by the middleware (Edge runtime).
 * Must NOT import Prisma, bcryptjs, or any Node-only modules.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminPath = nextUrl.pathname.startsWith("/admin");

      if (isAdminPath) {
        return isLoggedIn;
      }

      if (nextUrl.pathname === "/login" && isLoggedIn) {
        return Response.redirect(new URL("/admin/dashboard", nextUrl));
      }

      return true;
    },
  },
};
