import { handlers } from "@/auth";
import { NextRequest } from "next/server";

// Wrap handlers to catch and log errors
async function wrappedGET(req: NextRequest) {
  try {
    return await handlers.GET(req);
  } catch (error) {
    console.error("[AUTH ERROR GET]", error);
    // Return a JSON error for debugging
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return new Response(
      JSON.stringify({ authError: message, stack: stack?.split("\n").slice(0, 10) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

async function wrappedPOST(req: NextRequest) {
  try {
    return await handlers.POST(req);
  } catch (error) {
    console.error("[AUTH ERROR POST]", error);
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return new Response(
      JSON.stringify({ authError: message, stack: stack?.split("\n").slice(0, 10) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

export { wrappedGET as GET, wrappedPOST as POST };
