import { describe, expect, it } from "vitest";
import { imageTagsSchema } from "@/lib/validation";
import { guardPairing } from "@/services/guard.service";
import { SeedEmbeddingProvider, SeedVisionProvider } from "@/providers/seed";
import { cosineSimilarity } from "@/lib/similarity";
import { evalService } from "@/services/eval.service";
import { matchingService } from "@/services/matching.service";
import { imagesRepository, jobsRepository, postsRepository } from "@/repositories";
import { GUARD_POLICY_ID } from "@/config/guard.config";

describe("structured vision output", () => {
  it("validates complete structured tags", async () => {
    const tags = await new SeedVisionProvider().classify({
      imagePath: "/corpus/red-fox-1.svg",
    });
    expect(imageTagsSchema.parse(tags)).toEqual(tags);
    expect(tags.subject).toBe("red fox");
    expect(tags.confidence).toBeGreaterThan(0.9);
  });

  it("rejects malformed provider output", () => {
    expect(() =>
      imageTagsSchema.parse({
        subject: "",
        category: "wildlife",
        attributes: [],
        caption: "",
        confidence: 2,
      })
    ).toThrow();
  });
});

describe("mismatch guard policy", () => {
  it("refuses wolf for a red fox post even at high similarity", () => {
    const verdict = guardPairing({
      postSubject: "red fox",
      imageSubject: "gray wolf",
      score: 0.94,
      confidence: 0.98,
    });
    expect(verdict.accepted).toBe(false);
    expect(verdict.status).toBe("guarded");
    expect(verdict.policyId).toBe(GUARD_POLICY_ID);
    expect(verdict.features.subjectAgreement).toBe(false);
    expect(verdict.reason).toContain("Subject conflict");
  });

  it("refuses weak and low-confidence candidates with reasons", () => {
    expect(
      guardPairing({
        postSubject: "red fox",
        imageSubject: "red fox",
        score: 0.1,
        confidence: 0.99,
      }).status
    ).toBe("no_match");
    expect(
      guardPairing({
        postSubject: "red fox",
        imageSubject: "red fox",
        score: 0.9,
        confidence: 0.3,
      }).reason
    ).toContain("confidence");
  });
});

describe("semantic matching", () => {
  it("puts paraphrases in the same semantic neighborhood", async () => {
    const provider = new SeedEmbeddingProvider();
    const a = await provider.embed("red fox with rust coat");
    const b = await provider.embed("vulpes vulpes woodland habitat");
    const wolf = await provider.embed("gray wolf canis lupus pack");
    expect(cosineSimilarity(a, b)).toBeGreaterThan(cosineSimilarity(a, wolf));
  });

  it("ranks fox first and persists a guarded forced wolf pairing", async () => {
    const post = await postsRepository.findBySlug("red-fox-field-guide");
    if (!post) throw new Error("seed post missing; run pnpm db:seed");
    const ranked = await matchingService.rank(post.id, 10);
    expect(ranked.status).toBe("suggested");
    expect(ranked.candidates[0].image.tag?.subject).toBe("red fox");
    expect(ranked.policyId).toBe(GUARD_POLICY_ID);

    const wolf = (await imagesRepository.list()).find(
      (image) => image.tag?.subject === "gray wolf" && !image.tag.flaggedLowConfidence
    );
    if (!wolf) throw new Error("seed wolf missing; run corpus pipeline");
    const pairing = await matchingService.forcePair(post.id, wolf.id);
    expect(pairing.status).toBe("guarded");
    expect(pairing.policyId).toBe(GUARD_POLICY_ID);
    expect(pairing.featuresJson).toContain("subjectAgreement");
    expect(pairing.guardReason).toContain("Subject conflict");
  });
});

describe("job idempotency", () => {
  it("does not create duplicate classify jobs for the same image key", async () => {
    const images = await imagesRepository.list();
    const image = images[0];
    if (!image) throw new Error("no images; run pnpm db:seed");
    const first = await jobsRepository.enqueue(
      "classify",
      JSON.stringify({ imageId: image.id }),
      `test-classify:${image.id}`
    );
    const second = await jobsRepository.enqueue(
      "classify",
      JSON.stringify({ imageId: image.id }),
      `test-classify:${image.id}`
    );
    expect(second.id).toBe(first.id);
  });
});

describe("labeled evaluation", () => {
  it("meets precision, no-match, and hard-negative floors", async () => {
    const result = await evalService.run();
    expect(result.top1Precision).toBeGreaterThanOrEqual(0.8);
    expect(result.noMatchRecall).toBe(1);
    expect(result.guardFalseAcceptRate).toBe(0);
    expect(result.matrix.accuracy).toBeGreaterThanOrEqual(0.9);
    expect(result.results.find((row) => row.postSlug === "urban-rooftop-gardens")?.status).toBe(
      "no_match"
    );
  });
});
