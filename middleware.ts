export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/diary/:path*",
    "/exam/:path*",
    "/vocabulary/:path*",
  ],
};
