import NextAuth from "next-auth";
import { authConfig } from "./src/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
