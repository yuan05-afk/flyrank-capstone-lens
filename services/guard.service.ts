import { GUARD_CONFIG, GUARD_POLICY_ID, SUBJECT_ALIASES } from "@/config/guard.config";

export type GuardInput = {
  postSubject: string | null;
  imageSubject: string;
  score: number;
  confidence: number;
};

export type GuardFeatures = {
  cosine: number;
  confidence: number;
  postSubjectCanonical: string | null;
  imageSubjectCanonical: string;
  subjectAgreement: boolean;
  aliasOverlap: boolean;
  belowSimilarityFloor: boolean;
  belowConfidenceFloor: boolean;
};

export type GuardVerdict = {
  accepted: boolean;
  status: "suggested" | "guarded" | "no_match";
  reason: string | null;
  policyId: string;
  features: GuardFeatures;
};

export function canonicalSubject(value: string): string {
  const normalized = value.toLowerCase().trim();
  for (const [canonical, aliases] of Object.entries(SUBJECT_ALIASES)) {
    if ([canonical, ...aliases].some((alias) => normalized.includes(alias))) {
      return canonical;
    }
  }
  return normalized;
}

function aliasOverlap(postSubject: string | null, imageSubject: string): boolean {
  if (!postSubject) return false;
  const post = postSubject.toLowerCase();
  const image = imageSubject.toLowerCase();
  const aliases = Object.values(SUBJECT_ALIASES).flat();
  return aliases.some((alias) => post.includes(alias) && image.includes(alias));
}

export function buildFeatures(input: GuardInput): GuardFeatures {
  const postCanonical = input.postSubject ? canonicalSubject(input.postSubject) : null;
  const imageCanonical = canonicalSubject(input.imageSubject);
  return {
    cosine: Number(input.score.toFixed(4)),
    confidence: Number(input.confidence.toFixed(4)),
    postSubjectCanonical: postCanonical,
    imageSubjectCanonical: imageCanonical,
    subjectAgreement: postCanonical === null ? true : postCanonical === imageCanonical,
    aliasOverlap: aliasOverlap(input.postSubject, input.imageSubject),
    belowSimilarityFloor: input.score < GUARD_CONFIG.similarityThreshold,
    belowConfidenceFloor: input.confidence < GUARD_CONFIG.confidenceThreshold,
  };
}

/**
 * Versioned pairing policy. Order matters:
 * 1) identity conflict (guarded)
 * 2) similarity floor (no_match)
 * 3) confidence floor (guarded for review)
 */
export function guardPairing(input: GuardInput): GuardVerdict {
  const features = buildFeatures(input);

  if (input.postSubject && !features.subjectAgreement) {
    return {
      accepted: false,
      status: "guarded",
      reason: `Subject conflict: post is ${input.postSubject}; image is ${input.imageSubject}.`,
      policyId: GUARD_POLICY_ID,
      features,
    };
  }

  if (features.belowSimilarityFloor) {
    return {
      accepted: false,
      status: "no_match",
      reason: `Similarity ${input.score.toFixed(2)} is below the ${GUARD_CONFIG.similarityThreshold.toFixed(2)} floor.`,
      policyId: GUARD_POLICY_ID,
      features,
    };
  }

  if (features.belowConfidenceFloor) {
    return {
      accepted: false,
      status: "guarded",
      reason: `Vision confidence ${input.confidence.toFixed(2)} is below the ${GUARD_CONFIG.confidenceThreshold.toFixed(2)} review floor.`,
      policyId: GUARD_POLICY_ID,
      features,
    };
  }

  return {
    accepted: true,
    status: "suggested",
    reason: null,
    policyId: GUARD_POLICY_ID,
    features,
  };
}

/** Sweep helper for threshold reports. Does not mutate runtime config. */
export function guardPairingWithThresholds(
  input: GuardInput,
  similarityThreshold: number,
  confidenceThreshold: number
): GuardVerdict {
  const features = buildFeatures(input);
  features.belowSimilarityFloor = input.score < similarityThreshold;
  features.belowConfidenceFloor = input.confidence < confidenceThreshold;

  if (input.postSubject && !features.subjectAgreement) {
    return {
      accepted: false,
      status: "guarded",
      reason: `Subject conflict: post is ${input.postSubject}; image is ${input.imageSubject}.`,
      policyId: GUARD_POLICY_ID,
      features,
    };
  }
  if (features.belowSimilarityFloor) {
    return {
      accepted: false,
      status: "no_match",
      reason: `Similarity ${input.score.toFixed(2)} is below the ${similarityThreshold.toFixed(2)} floor.`,
      policyId: GUARD_POLICY_ID,
      features,
    };
  }
  if (features.belowConfidenceFloor) {
    return {
      accepted: false,
      status: "guarded",
      reason: `Vision confidence ${input.confidence.toFixed(2)} is below the ${confidenceThreshold.toFixed(2)} review floor.`,
      policyId: GUARD_POLICY_ID,
      features,
    };
  }
  return {
    accepted: true,
    status: "suggested",
    reason: null,
    policyId: GUARD_POLICY_ID,
    features,
  };
}
