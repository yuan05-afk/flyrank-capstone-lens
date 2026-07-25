import { NextRequest } from "next/server";
import { requireDemoAuth } from "@/lib/auth";
import { workerService } from "@/services/worker.service";

export async function POST(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  const drain = request.nextUrl.searchParams.get("drain") === "1";
  return Response.json(drain ? await workerService.drain() : await workerService.tickOnce());
}
