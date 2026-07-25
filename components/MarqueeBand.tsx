"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Full-bleed two-row marquee under the Lens hero (Broadcast pattern, Lens voice).
 * Opposite drift + soft L/R fade + pause on hover. Vocabulary is Focus Match:
 * structured tags, focus lock, semantic scores, mismatch guard - not crop ratios
 * (Broadcast) and not Capstone name chips (Muni).
 */

type Token =
  | { kind: "tag"; key: string; value: string }
  | { kind: "status"; label: string; tone: "matched" | "guarded" | "review" | "no_match" }
  | { kind: "score"; value: string }
  | { kind: "focus" }
  | { kind: "word"; label: string };

const ROW_A: Token[] = [
  { kind: "focus" },
  { kind: "tag", key: "subject", value: "red fox" },
  { kind: "score", value: "0.96" },
  { kind: "status", label: "matched", tone: "matched" },
  { kind: "word", label: "Semantic rank" },
  { kind: "tag", key: "category", value: "wildlife" },
  { kind: "status", label: "guarded", tone: "guarded" },
  { kind: "word", label: "Refuse the near-miss" },
  { kind: "tag", key: "mismatch", value: "wolf" },
  { kind: "score", value: "0.74" },
];

const ROW_B: Token[] = [
  { kind: "word", label: "Mismatch guard" },
  { kind: "status", label: "no_match", tone: "no_match" },
  { kind: "tag", key: "attribute", value: "rust coat" },
  { kind: "focus" },
  { kind: "word", label: "Focus lock" },
  { kind: "status", label: "review", tone: "review" },
  { kind: "tag", key: "species", value: "vulpes vulpes" },
  { kind: "word", label: "Low confidence flagged" },
  { kind: "score", value: "0.97" },
  { kind: "word", label: "One library, right image" },
];

function FocusRing() {
  return (
    <span className="lens-marquee-chip lens-marquee-chip--focus" aria-hidden="true">
      <svg className="lens-marquee-ring" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 2.5v2.2M10 15.3v2.2M2.5 10h2.2M15.3 10h2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14.2 4.2h1.8v1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      focus lock
    </span>
  );
}

function Chip({ token }: { token: Token }) {
  if (token.kind === "focus") return <FocusRing />;
  if (token.kind === "tag") {
    return (
      <span className="lens-marquee-chip lens-marquee-chip--tag">
        <span className="lens-marquee-key">{token.key}</span>
        <span className="lens-marquee-val">{token.value}</span>
      </span>
    );
  }
  if (token.kind === "score") {
    return (
      <span className="lens-marquee-chip lens-marquee-chip--score">
        <span className="lens-marquee-meter" aria-hidden="true">
          <span style={{ width: `${Math.round(Number(token.value) * 100)}%` }} />
        </span>
        {token.value}
      </span>
    );
  }
  if (token.kind === "status") {
    return (
      <span className={`lens-marquee-chip lens-marquee-status lens-marquee-status--${token.tone}`}>
        <span className="lens-marquee-dot" aria-hidden="true" />
        {token.label}
      </span>
    );
  }
  return <span className="lens-marquee-word">{token.label}</span>;
}

function Track({ tokens, dir }: { tokens: Token[]; dir: "left" | "right" }) {
  return (
    <div className={`lens-marquee-track lens-marquee-track--${dir}`}>
      {[0, 1].map((copy) => (
        <div className="lens-marquee-group" key={copy} aria-hidden={copy === 1}>
          {tokens.map((token, i) => (
            <div className="lens-marquee-item" key={`${copy}-${i}`}>
              <Chip token={token} />
              <span className="lens-marquee-sep" aria-hidden="true">
                /
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function MarqueeBand() {
  const shouldReduce = useReducedMotion();

  return (
    <div
      className={`lens-marquee ${shouldReduce ? "lens-marquee--static" : ""}`}
      role="img"
      aria-label="Lens tags subjects, ranks by meaning, and refuses mismatches like a wolf for a fox post."
    >
      <Track tokens={ROW_A} dir="left" />
      <Track tokens={ROW_B} dir="right" />
    </div>
  );
}
