import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export async function middleware(request: NextRequest) {
  const isHttps = request.nextUrl.protocol === "https:";
  const candidateCookieNames = isHttps
    ? [
        "__Secure-authjs.session-token",
        "__Secure-next-auth.session-token",
        "authjs.session-token",
        "next-auth.session-token",
      ]
    : [
        "authjs.session-token",
        "next-auth.session-token",
        "__Secure-authjs.session-token",
        "__Secure-next-auth.session-token",
      ];

  let token = null;
  for (const cookieName of candidateCookieNames) {
    token = await getToken({
      req: request,
      secret: authSecret,
      secureCookie: isHttps,
      cookieName,
    });
    if (token) break;
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/diary/:path*",
    "/exam/:path*",
    "/speaking/:path*",
    "/entreno/:path*",
    "/vocabulary/:path*",
  ],
};
