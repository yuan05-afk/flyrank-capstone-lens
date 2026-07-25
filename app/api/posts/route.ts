import { NextRequest } from "next/server";
import { requireDemoAuth } from "@/lib/auth";
import { postsRepository } from "@/repositories";

export async function GET(request: NextRequest) {
  const denied = requireDemoAuth(request);
  if (denied) return denied;
  return Response.json({ posts: await postsRepository.list() });
}
