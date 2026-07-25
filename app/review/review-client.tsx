"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Coins, Play, RefreshCw, Search, ShieldX, Tags, X } from "lucide-react";
import { BrandLockup } from "@/components/BrandMark";

type Tag = {
  subject: string;
  category: string;
  attributesJson: string;
  caption: string;
  confidence: number;
  flaggedLowConfidence: boolean;
};
type ImageAsset = { id: string; name: string; path: string; status: string; tag: Tag | null };
type Post = { id: string; slug: string; title: string; body: string; subject: string | null };
type Candidate = {
  image: ImageAsset;
  score: number;
  verdict: { accepted: boolean; status: string; reason: string | null };
};
type Pairing = {
  id: string;
  score: number;
  status: string;
  guardReason: string | null;
  post: Post;
  image: ImageAsset;
};
type CostSummary = {
  totalUsd: number;
  visionCalls: number;
  embeddingCalls: number;
  budgetUsd?: number;
  remainingUsd?: number;
  costPerAcceptedPairing?: number | null;
};
type EvalSummary = {
  total: number;
  correct: number;
  top1Precision: number;
  noMatchRecall?: number;
  matrix?: { accuracy: number };
};
type Notice = { id: number; title: string; detail: string; tone: "info" | "ok" | "error" };

function badge(status: string) {
  if (["approved", "suggested", "tagged"].includes(status)) return "badge badge-ok";
  if (["guarded", "no_match", "rejected"].includes(status)) return "badge badge-danger";
  return "badge badge-warn";
}

export function ReviewClient() {
  const reduce = useReducedMotion();
  const [posts, setPosts] = useState<Post[]>([]);
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [costs, setCosts] = useState<CostSummary>({ totalUsd: 0, visionCalls: 0, embeddingCalls: 0 });
  const [evaluation, setEvaluation] = useState<EvalSummary | null>(null);
  const [activePostId, setActivePostId] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [matchStatus, setMatchStatus] = useState<string | null>(null);
  const [matchReason, setMatchReason] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>("boot");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [search, setSearch] = useState("");
  const noticeCounter = useRef(0);

  const notify = useCallback((tone: Notice["tone"], title: string, detail: string) => {
    noticeCounter.current += 1;
    const id = noticeCounter.current;
    setNotices((items) => [...items, { id, tone, title, detail }]);
    window.setTimeout(
      () => setNotices((items) => items.filter((item) => item.id !== id)),
      4800
    );
  }, []);

  const loadBase = useCallback(async () => {
    const [postData, imageData, pairingData, costData, evalData] = await Promise.all([
      fetch("/api/posts").then((r) => r.json()),
      fetch("/api/images").then((r) => r.json()),
      fetch("/api/pairings").then((r) => r.json()),
      fetch("/api/costs").then((r) => r.json()),
      fetch("/api/eval").then((r) => r.json()),
    ]);
    setPosts(postData.posts || []);
    setImages(imageData.images || []);
    setPairings(pairingData.pairings || []);
    setCosts(costData);
    setEvaluation(evalData);
    setActivePostId((current) => current || postData.posts?.[0]?.id || "");
  }, []);

  useEffect(() => {
    void loadBase().finally(() => setBusy(null));
  }, [loadBase]);

  const activePost = posts.find((post) => post.id === activePostId);
  const wolf = images.find((image) => image.tag?.subject === "gray wolf" && !image.tag.flaggedLowConfidence);
  const filteredImages = useMemo(() => {
    const term = search.toLowerCase();
    return images.filter((image) =>
      !term || image.name.includes(term) || image.tag?.subject.includes(term) || image.tag?.category.includes(term)
    );
  }, [images, search]);

  async function rank() {
    if (!activePostId) return;
    setBusy("rank");
    const response = await fetch(`/api/posts/${activePostId}/images`);
    const data = await response.json();
    setCandidates(data.candidates || []);
    setMatchStatus(data.status);
    setMatchReason(data.reason);
    await loadBase();
    notify(
      data.status === "suggested" ? "ok" : "error",
      data.status === "suggested" ? "Candidates ranked" : "No confident match",
      data.reason || `${data.candidates?.length ?? 0} images checked by similarity and subject tags.`
    );
    setBusy(null);
  }

  async function forceWolf() {
    if (!activePostId || !wolf) return;
    setBusy("force");
    const response = await fetch("/api/pairings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: activePostId, imageId: wolf.id }),
    });
    const data = await response.json();
    await loadBase();
    notify(
      data.pairing?.status === "guarded" ? "ok" : "error",
      data.pairing?.status === "guarded" ? "Mismatch guard held" : "Guard result",
      data.pairing?.guardReason || data.error || "Pairing evaluated."
    );
    setBusy(null);
  }

  async function decide(id: string, decision: "approved" | "rejected") {
    setBusy(`decision:${id}`);
    const response = await fetch(`/api/pairings/${id}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    if (response.ok) {
      await loadBase();
      notify("ok", `Pairing ${decision}`, "The human decision is stored with its timestamp.");
    }
    setBusy(null);
  }

  async function runPipeline() {
    setBusy("pipeline");
    await fetch("/api/jobs/classify", { method: "POST" });
    await fetch("/api/jobs/embed", { method: "POST" });
    const result = await fetch("/api/worker/tick?drain=1", { method: "POST" }).then((r) => r.json());
    await loadBase();
    notify("info", "Batch worker settled", `${result.processed ?? 0} due jobs processed. Existing tags remain idempotent.`);
    setBusy(null);
  }

  async function signOut() {
    await fetch("/api/auth/login", { method: "DELETE" });
    window.location.href = "/";
  }

  if (busy === "boot") {
    return <DeskSkeleton />;
  }

  return (
    <main className="hero-mesh min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-3"><BrandLockup /><span className="eyebrow"><span className="lens-dot" /> Review desk</span></div>
          <div className="flex items-center gap-3"><Link href="/" className="text-sm text-muted hover:text-lens">Marketing</Link><button onClick={signOut} className="text-sm text-muted hover:text-lens">Sign out</button></div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-5 px-5 py-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><span className="eyebrow"><Search size={13} /> Pairing review</span><h1 className="font-display mt-3 text-4xl font-bold tracking-tight">Put the suggestion in focus.</h1><p className="mt-1 text-sm text-muted">Rank the library, inspect the guard, then approve only what belongs.</p></div>
          <button onClick={runPipeline} disabled={busy !== null} className="btn-secondary"><RefreshCw size={15} className={busy === "pipeline" ? "animate-spin" : ""} /> Run batch</button>
        </div>

        <section className="grid gap-3 sm:grid-cols-4">
          {[
            [Tags, String(images.length), "images in corpus"],
            [ShieldX, String(images.filter((image) => image.tag?.flaggedLowConfidence).length), "low confidence"],
            [Coins, `$${costs.totalUsd.toFixed(4)}`, `${costs.visionCalls + costs.embeddingCalls} tracked · $${(costs.remainingUsd ?? 0).toFixed(2)} budget left`],
            [Check, evaluation ? `${(evaluation.top1Precision * 100).toFixed(0)}%` : "...", `top-1 · matrix ${evaluation?.matrix ? (evaluation.matrix.accuracy * 100).toFixed(0) : "..."}%`],
          ].map(([Icon, value, label]) => {
            const C = Icon as typeof Tags;
            return <motion.div key={String(label)} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="surface p-4"><C size={19} className="text-lens" /><b className="font-display mt-2 block text-2xl">{String(value)}</b><span className="mono text-[9px] uppercase tracking-wider text-muted">{String(label)}</span></motion.div>;
          })}
        </section>

        <section className="surface p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(260px,.75fr)_minmax(0,2fr)]">
            <div>
              <label className="text-sm font-semibold">Post to match<select className="input mt-2" value={activePostId} onChange={(e) => { setActivePostId(e.target.value); setCandidates([]); setMatchStatus(null); }}>{posts.map((post) => <option key={post.id} value={post.id}>{post.title}</option>)}</select></label>
              <div className="mt-4 rounded-xl border border-line bg-canvas/65 p-4">
                <span className="mono text-[9px] uppercase tracking-widest text-muted">subject cue</span>
                <h2 className="font-display mt-1 text-xl font-semibold">{activePost?.subject}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{activePost?.body}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={rank} disabled={busy !== null} className="btn-primary"><Play size={15} /> {busy === "rank" ? "Ranking..." : "Rank library"}</button>
                <button onClick={forceWolf} disabled={busy !== null || !wolf} className="btn-secondary"><ShieldX size={15} /> {busy === "force" ? "Testing..." : "Force wolf"}</button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Ranked candidates</h2>{matchStatus && <span className={badge(matchStatus)}>{matchStatus.replace("_", " ")}</span>}</div>
              {matchReason && <p className="mt-2 rounded-xl border border-danger/20 bg-red-50 p-3 text-sm text-danger">{matchReason}</p>}
              <div className="signal-scroll mt-3 flex gap-3 overflow-x-auto pb-2">
                {candidates.map((candidate, index) => (
                  <article key={candidate.image.id} className="w-48 shrink-0 overflow-hidden rounded-2xl border border-line bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={candidate.image.path} alt={candidate.image.tag?.caption || candidate.image.name} className="h-28 w-full object-cover" />
                    <div className="p-3"><div className="flex items-center justify-between"><b className="font-display">{candidate.image.tag?.subject}</b><span className="mono text-[10px]">#{index + 1}</span></div><div className="mt-2 flex items-center gap-2"><div className="score"><span style={{ width: `${Math.max(0, candidate.score) * 100}%` }} /></div><span className="mono text-[10px]">{candidate.score.toFixed(2)}</span></div><span className={`${badge(candidate.verdict.status)} mt-2`}>{candidate.verdict.status.replace("_", " ")}</span></div>
                  </article>
                ))}
                {candidates.length === 0 && <div className="grid min-h-48 flex-1 place-items-center rounded-2xl border border-dashed border-line bg-canvas/50 text-center text-sm text-muted">Choose a post, then rank the library.</div>}
              </div>
            </div>
          </div>
        </section>

        <section className="surface p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-xl font-semibold">Decision ledger</h2><p className="text-sm text-muted">Suggestions, guard refusals, and human review in one auditable table.</p></div><div className="relative"><Search size={14} className="absolute left-3 top-3 text-muted" /><input className="input !w-64 !pl-9 text-sm" placeholder="Filter corpus" value={search} onChange={(e) => setSearch(e.target.value)} /></div></div>
          <div className="table-wrap signal-scroll">
            <table><thead><tr><th>Post</th><th>Candidate</th><th>Tags</th><th>Score</th><th>Verdict</th><th>Decision</th></tr></thead><tbody>
              {pairings.map((pairing) => <tr key={pairing.id}><td><b>{pairing.post.title}</b><div className="mono mt-1 text-[9px] text-muted">{pairing.post.subject}</div></td><td><div className="flex items-center gap-3"><img src={pairing.image.path} alt="" className="thumb" /><div><b>{pairing.image.tag?.subject}</b><div className="mono text-[9px] text-muted">{pairing.image.name}</div></div></div></td><td><div className="flex max-w-56 flex-wrap gap-1">{JSON.parse(pairing.image.tag?.attributesJson || "[]").slice(0, 3).map((tag: string) => <span key={tag} className="tag-chip !px-2 !py-1">{tag}</span>)}</div>{pairing.guardReason && <p className="mt-1 max-w-64 text-[11px] text-danger">{pairing.guardReason}</p>}</td><td className="mono">{pairing.score.toFixed(3)}</td><td><span className={badge(pairing.status)}>{pairing.status}</span></td><td><div className="flex gap-2"><button onClick={() => decide(pairing.id, "approved")} disabled={busy !== null || pairing.status === "guarded" || pairing.status === "no_match"} className="btn-secondary !min-h-8 !px-2 !py-1 text-xs"><Check size={13} /> Approve</button><button onClick={() => decide(pairing.id, "rejected")} disabled={busy !== null} className="btn-secondary !min-h-8 !px-2 !py-1 text-xs"><X size={13} /> Reject</button></div></td></tr>)}
              {pairings.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-muted">Rank a post to create review rows.</td></tr>}
            </tbody></table>
          </div>
          <p className="mt-3 text-xs text-muted">{filteredImages.length} of {images.length} corpus items match the filter. Use it to inspect tags before ranking.</p>
        </section>
      </div>

      <div className="fixed bottom-5 right-5 z-50 flex w-[min(370px,calc(100vw-2rem))] flex-col gap-2">
        <AnimatePresence>{notices.map((notice) => <motion.div key={notice.id} initial={{ opacity: 0, x: 30, scale: .96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 24, scale: .96 }} className="surface overflow-hidden p-4"><div className="flex gap-3"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notice.tone === "ok" ? "bg-ok" : notice.tone === "error" ? "bg-danger" : "bg-lens"}`} /><div><span className="mono text-[9px] uppercase tracking-widest text-muted">Lens decision</span><b className="font-display block">{notice.title}</b><p className="mt-1 text-xs leading-relaxed text-muted">{notice.detail}</p></div></div></motion.div>)}</AnimatePresence>
      </div>
    </main>
  );
}

function DeskSkeleton() {
  return <main className="hero-mesh min-h-screen"><div className="mx-auto max-w-7xl space-y-5 px-5 py-8"><div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" /><div className="grid gap-3 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />)}</div><div className="h-[520px] animate-pulse rounded-2xl bg-white" /></div></main>;
}
