import { GUARD_CONFIG, SUBJECT_ALIASES } from "@/config/guard.config";

export type GuardInput = {
  postSubject: string | null;
  imageSubject: string;
  score: number;
  confidence: number;
};

export type GuardVerdict = {
  accepted: boolean;
  status: "suggested" | "guarded" | "no_match";
  reason: string | null;
};

function canonicalSubject(value: string): string {
  const normalized = value.toLowerCase().trim();
  for (const [canonical, aliases] of Object.entries(SUBJECT_ALIASES)) {
    if ([canonical, ...aliases].some((alias) => normalized.includes(alias))) {
      return canonical;
    }
  }
  return normalized;
}

export function guardPairing(input: GuardInput): GuardVerdict {
  // An explicit identity conflict is more useful than a generic weak-score
  // explanation, especially for the forced fox/wolf production failure case.
  if (input.postSubject) {
    const post = canonicalSubject(input.postSubject);
    const image = canonicalSubject(input.imageSubject);
    if (post !== image) {
      return {
        accepted: false,
        status: "guarded",
        reason: `Subject conflict: post is ${input.postSubject}; image is ${input.imageSubject}.`,
      };
    }
  }

  if (input.score < GUARD_CONFIG.similarityThreshold) {
    return {
      accepted: false,
      status: "no_match",
      reason: `Similarity ${input.score.toFixed(2)} is below the ${GUARD_CONFIG.similarityThreshold.toFixed(2)} floor.`,
    };
  }

  if (input.confidence < GUARD_CONFIG.confidenceThreshold) {
    return {
      accepted: false,
      status: "guarded",
      reason: `Vision confidence ${input.confidence.toFixed(2)} is below the ${GUARD_CONFIG.confidenceThreshold.toFixed(2)} review floor.`,
    };
  }

  return { accepted: true, status: "suggested", reason: null };
}
