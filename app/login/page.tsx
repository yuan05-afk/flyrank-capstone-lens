"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLockup } from "@/components/BrandMark";

export default function LoginPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("lens_demo_key_001");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    if (!response.ok) {
      setError("That demo key does not open Lens.");
      setBusy(false);
      return;
    }
    router.push("/review");
    router.refresh();
  }

  return (
    <main className="hero-mesh min-h-screen">
      <header className="mx-auto flex h-16 max-w-6xl items-center px-5"><BrandLockup /></header>
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl place-items-center px-5 pb-16">
        <form onSubmit={submit} className="surface w-full max-w-md p-7">
          <span className="eyebrow"><span className="lens-dot" /> Review access</span>
          <h1 className="font-display mt-4 text-3xl font-bold">Open the Lens desk</h1>
          <p className="mt-2 text-sm text-muted">The seeded key is ready. No cloud account or provider key is required.</p>
          <label className="mt-6 block text-sm font-semibold">
            Demo API key
            <input className="input mono mt-2 text-xs" value={apiKey} onChange={(e) => setApiKey(e.target.value)} disabled={busy} />
          </label>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          <button className="btn-primary mt-5 w-full" disabled={busy}>{busy ? "Opening desk..." : "Continue"}</button>
          <Link href="/" className="focus-ring mt-4 inline-block text-sm text-muted hover:text-lens">← Back to marketing</Link>
        </form>
      </div>
    </main>
  );
}
