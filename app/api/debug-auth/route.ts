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

  // Check env vars
  diagnostics.AUTH_SECRET = process.env.AUTH_SECRET ? `set (${process.env.AUTH_SECRET.length} chars)` : "MISSING";
  diagnostics.AUTH_GOOGLE_ID = process.env.AUTH_GOOGLE_ID ? `set (${process.env.AUTH_GOOGLE_ID.substring(0, 20)}...)` : "MISSING";
  diagnostics.AUTH_GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET ? `set (${process.env.AUTH_GOOGLE_SECRET.length} chars)` : "MISSING";
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
    const { auth } = await import("@/auth");
    diagnostics.auth_import = "OK";
  } catch (e: unknown) {
    diagnostics.auth_import = "FAILED";
    diagnostics.auth_error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
