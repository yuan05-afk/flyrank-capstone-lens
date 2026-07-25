import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReviewClient } from "./review-client";

export default function ReviewPage() {
  const actual = cookies().get("lens_session")?.value;
  const expected = process.env.DEMO_API_KEY || "lens_demo_key_001";
  if (actual !== expected) redirect("/login");
  return <ReviewClient />;
}
