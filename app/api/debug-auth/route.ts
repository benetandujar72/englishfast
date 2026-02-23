import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const diagnostics: Record<string, unknown> = {};
  const resolvedAuthSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const resolvedGoogleId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
  const resolvedGoogleSecret =
    process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;

  // Check env vars
  diagnostics.AUTH_SECRET = process.env.AUTH_SECRET
    ? `set (${process.env.AUTH_SECRET.length} chars)`
    : "MISSING";
  diagnostics.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET
    ? `set (${process.env.NEXTAUTH_SECRET.length} chars)`
    : "MISSING";
  diagnostics.RESOLVED_AUTH_SECRET = resolvedAuthSecret
    ? `set (${resolvedAuthSecret.length} chars)`
    : "MISSING";
  diagnostics.AUTH_GOOGLE_ID = process.env.AUTH_GOOGLE_ID
    ? `set (${process.env.AUTH_GOOGLE_ID.substring(0, 20)}...)`
    : "MISSING";
  diagnostics.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    ? `set (${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...)`
    : "MISSING";
  diagnostics.RESOLVED_GOOGLE_ID = resolvedGoogleId
    ? `set (${resolvedGoogleId.substring(0, 20)}...)`
    : "MISSING";
  diagnostics.AUTH_GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET
    ? `set (${process.env.AUTH_GOOGLE_SECRET.length} chars)`
    : "MISSING";
  diagnostics.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
    ? `set (${process.env.GOOGLE_CLIENT_SECRET.length} chars)`
    : "MISSING";
  diagnostics.RESOLVED_GOOGLE_SECRET = resolvedGoogleSecret
    ? `set (${resolvedGoogleSecret.length} chars)`
    : "MISSING";
  diagnostics.AUTH_URL = process.env.AUTH_URL || "NOT SET";
  diagnostics.AUTH_TRUST_HOST = process.env.AUTH_TRUST_HOST || "NOT SET";
  diagnostics.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "NOT SET";
  diagnostics.DATABASE_URL = process.env.DATABASE_URL ? `set (${process.env.DATABASE_URL.substring(0, 40)}...)` : "MISSING";
  diagnostics.DIRECT_URL = process.env.DIRECT_URL ? `set (${process.env.DIRECT_URL.substring(0, 40)}...)` : "MISSING";

  // Test DB
  try {
    const result = await db.$queryRaw`SELECT 1 as ok`;
    diagnostics.db_connection = "OK";
    diagnostics.db_result = result;
  } catch (e: unknown) {
    diagnostics.db_connection = "FAILED";
    diagnostics.db_error = e instanceof Error ? e.message : String(e);
  }

  // Check tables
  try {
    const tables = await db.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`;
    diagnostics.tables = tables;
  } catch (e: unknown) {
    diagnostics.tables_error = e instanceof Error ? e.message : String(e);
  }

  // Try to import and test auth
  try {
    const authModule = await import("@/auth");
    diagnostics.auth_import = "OK";
    diagnostics.auth_keys = Object.keys(authModule);
  } catch (e: unknown) {
    diagnostics.auth_import = "FAILED";
    diagnostics.auth_error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
