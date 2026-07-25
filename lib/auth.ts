import { NextRequest } from "next/server";

export const SESSION_COOKIE = "lens_session";

export function requireDemoAuth(request: NextRequest): Response | null {
  const expected = process.env.DEMO_API_KEY || "lens_demo_key_001";
  const actual = request.cookies.get(SESSION_COOKIE)?.value;
  if (actual === expected) return null;
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
