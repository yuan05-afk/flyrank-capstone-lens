import { NextRequest } from "next/server";
import { requireDemoAuth } from "@/lib/auth";
import { workerService } from "@/services/worker.service";

export async function GET(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  return Response.json({ jobs: await workerService.timeline() });
}
