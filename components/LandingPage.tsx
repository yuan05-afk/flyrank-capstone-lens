"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ScanSearch, Tags, ShieldX, Coins, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { BrandLockup, BrandMark } from "@/components/BrandMark";
import { MarqueeBand } from "@/components/MarqueeBand";
import { useLenis } from "@/hooks/useLenis";

function Specimen({ side }: { side: "left" | "right" }) {
  return (
    <div className={`specimen ${side}`} aria-hidden="true">
      <div className="specimen-art">
        <img
          src={side === "left" ? "/corpus/red-fox-1.svg" : "/corpus/gray-wolf-1.svg"}
          alt=""
          className="h-full w-full object-cover"
        />
        <span className="focus-box" />
      </div>
      <div className="specimen-meta">
        <div className="meta-line" />
        <div className="meta-line short" />
        <span className={`badge ${side === "left" ? "badge-ok" : "badge-danger"}`}>
          {side === "left" ? "focus locked" : "guard refused"}
        </span>
      </div>
    </div>
  );
}

export function LandingPage() {
  useLenis();
  const reduce = useReducedMotion();
  const enter = reduce ? {} : { opacity: 0, y: 20, filter: "blur(8px)" };

  return (
    <main className="hero-mesh">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <BrandLockup />
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary !min-h-9 !py-1.5">Sign in</Link>
            <Link href="/review" className="btn-primary !min-h-9 !py-1.5">Open review desk</Link>
          </div>
        </div>
      </header>

      <section className="hero-stage">
        <Specimen side="left" />
        <Specimen side="right" />
        <div className="hero-wash" />
        <div className="hero-safe">
          <motion.div initial={enter} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: .7 }} className="eyebrow mx-auto">
            <span className="lens-dot" /> Image relevance engine
          </motion.div>
          <motion.h1 initial={enter} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: .75, delay: .08 }} className="font-display mt-5 text-balance text-5xl font-bold leading-[.98] tracking-[-.05em] sm:text-7xl">
            One library. <span className="text-lens">The right image.</span> Never the wrong one.
          </motion.h1>
          <motion.p initial={enter} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: .75, delay: .16 }} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Built for CMS, catalog, and brand teams that cannot ship the wrong hero image. Lens tags what is actually in the frame, matches by meaning, and refuses a near-miss before publish.
          </motion.p>
          <motion.div initial={enter} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: .75, delay: .22 }} className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="btn-primary">Review matches <ArrowRight size={16} /></Link>
            <a href="#guard" className="btn-secondary">See the guard</a>
          </motion.div>
          <div className="match-strip" aria-label="Example match decision">
            <span className="match-token">post: red fox</span><ArrowRight size={14} className="text-muted" />
            <span className="match-token good">🦊 0.96 match</span>
            <span className="match-token bad">🐺 refused</span>
          </div>
        </div>
      </section>

      <MarqueeBand />

      <section className="chapter">
        <div className="chapter-head">
          <span className="eyebrow"><ScanSearch size={13} /> Perception to decision</span>
          <h2>Understand, rank, then know when to stop.</h2>
          <p className="text-muted">The difficult part is not finding the highest score. It is refusing the highest score when every candidate is wrong. Wildlife is the demo spine; the same policy works for product and brand libraries.</p>
        </div>
        <div className="grid-3">
          {[
            [Tags, "Structured tags", "Validated subject, category, attributes, caption, and confidence. Low confidence is flagged, never guessed."],
            [ScanSearch, "Semantic rank", "Image captions and post text share one vector space, so vulpes vulpes still finds red fox."],
            [ShieldX, "Mismatch guard", "Tag disagreement or weak similarity returns no match with an explanation."],
          ].map(([Icon, title, copy]) => {
            const C = Icon as typeof Tags;
            return <motion.article key={String(title)} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 18 }} viewport={{ once: true }} tabIndex={0} className="surface feature-card">
              <C size={25} className="text-lens" />
              <strong>{String(title)}</strong><p className="text-sm leading-relaxed text-muted">{String(copy)}</p>
            </motion.article>;
          })}
        </div>
      </section>

      <section id="guard" className="chapter">
        <div className="chapter-head">
          <span className="eyebrow"><ShieldX size={13} /> Mismatch guard</span>
          <h2>The best candidate can still be wrong.</h2>
          <p className="text-muted">Lens checks meaning and identity. A wolf does not become a fox because its embedding is nearby.</p>
        </div>
        <div className="guard-demo">
          <motion.article whileHover={{ y: -4 }} className="surface guard-card">
            <div className="flex items-center justify-between"><div><span className="mono text-[10px] uppercase tracking-widest text-muted">candidate 01</span><h3 className="font-display text-2xl font-semibold">Red fox</h3></div><CheckCircle2 className="text-ok" /></div>
            <div className="guard-row"><span>Semantic score</span><div className="score"><span style={{ width: "96%" }} /></div><b className="mono text-xs">0.96</b></div>
            <div className="guard-row"><span>Subject agreement</span><span className="badge badge-ok">exact</span></div>
            <p className="mt-4 text-sm text-muted">Suggested: rust-red Vulpes vulpes in woodland habitat.</p>
          </motion.article>
          <motion.article whileHover={{ y: -4 }} className="surface guard-card">
            <div className="flex items-center justify-between"><div><span className="mono text-[10px] uppercase tracking-widest text-muted">forced candidate</span><h3 className="font-display text-2xl font-semibold">Gray wolf</h3></div><XCircle className="text-danger" /></div>
            <div className="guard-row"><span>Semantic score</span><div className="score"><span style={{ width: "74%" }} /></div><b className="mono text-xs">0.74</b></div>
            <div className="guard-row"><span>Subject agreement</span><span className="badge badge-danger">conflict</span></div>
            <p className="mt-4 text-sm text-muted">Refused: post subject is red fox; image subject is gray wolf.</p>
          </motion.article>
        </div>
      </section>

      <section className="chapter">
        <div className="grid-3">
          {[["50", "fixture images"], ["0.90+", "seed eval precision"], ["BYO", "library path"]].map(([v, l]) => (
            <div key={l} tabIndex={0} className="surface feature-card text-center"><b className="font-display text-4xl text-lens">{v}</b><p className="mono mt-2 text-[10px] uppercase tracking-widest text-muted">{l}</p></div>
          ))}
        </div>
      </section>

      <section className="chapter">
        <div className="surface flex flex-col items-center p-10 text-center sm:p-16">
          <BrandMark className="h-12 w-12" />
          <h2 className="!mb-2">Put every pairing in focus.</h2>
          <p className="max-w-xl text-muted">Classify the library, inspect the ranked candidates, force the wolf case, and see the guard refuse it.</p>
          <Link href="/login" className="btn-primary mt-6">Open Lens <ArrowRight size={16} /></Link>
        </div>
      </section>
      <footer className="border-t border-line py-8"><div className="mx-auto flex max-w-6xl items-center justify-between px-5"><BrandLockup /><span className="mono text-[10px] text-muted">Backend AI Engineering · Week 10</span></div></footer>
    </main>
  );
}
