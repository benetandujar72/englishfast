import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  // Test 1: Check Google OIDC discovery
  try {
    const res = await fetch(
      "https://accounts.google.com/.well-known/openid-configuration"
    );
    results.google_oidc_discovery = res.ok
      ? "OK"
      : `FAILED (${res.status})`;
  } catch (e) {
    results.google_oidc_discovery =
      "FAILED: " + (e instanceof Error ? e.message : String(e));
  }

  // Test 2: Try to manually import and call auth
  try {
    const { auth } = await import("@/auth");
    results.auth_import = "OK";

    // Try to get session (will be null but shouldn't throw)
    try {
      const session = await auth();
      results.auth_call = "OK";
      results.session = session;
    } catch (e) {
      results.auth_call = "FAILED";
      results.auth_call_error =
        e instanceof Error ? { message: e.message, stack: e.stack?.split("\n").slice(0, 8) } : String(e);
    }
  } catch (e) {
    results.auth_import = "FAILED";
    results.auth_import_error =
      e instanceof Error ? { message: e.message, stack: e.stack?.split("\n").slice(0, 8) } : String(e);
  }

  // Test 3: Check PrismaAdapter initialization
  try {
    const { db } = await import("@/server/db");
    const { PrismaAdapter } = await import("@auth/prisma-adapter");
    const adapter = PrismaAdapter(db);
    results.prisma_adapter = "OK";
    results.adapter_methods = Object.keys(adapter);

    // Test adapter can query
    try {
      const user = await adapter.getUserByEmail?.("nonexistent@test.com");
      results.adapter_query = "OK (returned: " + JSON.stringify(user) + ")";
    } catch (e) {
      results.adapter_query = "FAILED";
      results.adapter_query_error =
        e instanceof Error ? e.message : String(e);
    }
  } catch (e) {
    results.prisma_adapter = "FAILED";
    results.prisma_adapter_error =
      e instanceof Error ? { message: e.message, stack: e.stack?.split("\n").slice(0, 8) } : String(e);
  }

  // Test 4: Check if NextAuth handler works with a mock request
  try {
    const { handlers } = await import("@/auth");
    results.handlers_import = "OK";
    results.handler_types = {
      GET: typeof handlers.GET,
      POST: typeof handlers.POST,
    };
  } catch (e) {
    results.handlers_import = "FAILED";
    results.handlers_error =
      e instanceof Error ? { message: e.message, stack: e.stack?.split("\n").slice(0, 8) } : String(e);
  }

  // Test 5: Manually simulate the signin flow using NextRequest
  try {
    const { handlers } = await import("@/auth");
    const baseUrl = process.env.AUTH_URL || "https://englishfast-seven.vercel.app";
    const testReq: NextRequest = new NextRequest(
      `${baseUrl}/api/auth/signin/google`,
      { method: "GET", headers: { host: "englishfast-seven.vercel.app" } }
    );
    const response = await handlers.GET(testReq);
    results.signin_simulation = {
      status: response.status,
      location: response.headers.get("location"),
    };
    if (response.status !== 302 || !response.headers.get("location")?.includes("accounts.google.com")) {
      // Try to read the body for error details
      try {
        const body = await response.text();
        results.signin_body = body.substring(0, 500);
      } catch {
        // ignore
      }
    }
  } catch (e) {
    results.signin_simulation = "FAILED";
    results.signin_simulation_error =
      e instanceof Error ? { message: e.message, stack: e.stack?.split("\n").slice(0, 8) } : String(e);
  }

  return NextResponse.json(results, { status: 200 });
}
