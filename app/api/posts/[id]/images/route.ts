import { NextRequest } from "next/server";
import { requireDemoAuth } from "@/lib/auth";
import { matchingService } from "@/services/matching.service";

type Ctx = { params: { id: string } };

export async function GET(request: NextRequest, { params }: Ctx) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  try {
    const result = await matchingService.rank(params.id, 10, true);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 404 });
  }
}
