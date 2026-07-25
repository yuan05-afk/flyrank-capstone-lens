import { NextRequest } from "next/server";
import { requireDemoAuth } from "@/lib/auth";
import { workerService } from "@/services/worker.service";

export async function POST(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  try {
    const drain = request.nextUrl.searchParams.get("drain") === "1";
    return Response.json(drain ? await workerService.drain() : await workerService.tickOnce());
  } catch (error) {
    const message = error instanceof Error ? error.message : "worker tick failed";
    return Response.json({ error: message, processed: 0 }, { status: 500 });
  }
}
