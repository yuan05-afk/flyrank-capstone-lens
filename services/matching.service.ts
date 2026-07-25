import { cosineSimilarity } from "@/lib/similarity";
import {
  imagesRepository,
  pairingsRepository,
  postsRepository,
} from "@/repositories";
import { guardPairing } from "./guard.service";

function vectorOf(value: string | null | undefined): number[] {
  if (!value) return [];
  return JSON.parse(value) as number[];
}

function assertSameEmbeddingSpace(
  postModel: string | undefined,
  imageModel: string | undefined,
  postDims: number,
  imageDims: number
) {
  if (!postModel || !imageModel) {
    throw new Error("embedding model metadata missing; re-run corpus:embed");
  }
  if (postModel !== imageModel) {
    throw new Error(
      `embedding space mismatch: post uses ${postModel}, image uses ${imageModel}`
    );
  }
  if (postDims !== imageDims) {
    throw new Error(
      `embedding dimension mismatch: post has ${postDims} dims, image has ${imageDims}`
    );
  }
}

function persistPayload(score: number, verdict: ReturnType<typeof guardPairing>) {
  return {
    score,
    status: verdict.status,
    guardReason: verdict.reason,
    policyId: verdict.policyId,
    featuresJson: JSON.stringify(verdict.features),
  };
}

export const matchingService = {
  async rank(postId: string, limit = 8, persist = false) {
    const [post, images] = await Promise.all([
      postsRepository.findById(postId),
      imagesRepository.list(),
    ]);
    if (!post?.embedding) throw new Error("post embedding not found");
    return this.rankAgainst(post, images, limit, persist ? postId : undefined);
  },

  /**
   * Rank an already-loaded post against an already-loaded corpus.
   * Used by eval to avoid N full image list round-trips.
   */
  async rankAgainst(
    post: NonNullable<Awaited<ReturnType<typeof postsRepository.findById>>>,
    images: Awaited<ReturnType<typeof imagesRepository.list>>,
    limit = 8,
    persistPostId?: string
  ) {
    if (!post.embedding) throw new Error("post embedding not found");
    const postVector = vectorOf(post.embedding.vectorJson);

    const ranked = images
      .filter((image) => image.tag && image.embedding)
      .map((image) => {
        assertSameEmbeddingSpace(
          post.embedding?.model,
          image.embedding?.model,
          post.embedding?.dims ?? 0,
          image.embedding?.dims ?? 0
        );
        const score = cosineSimilarity(
          postVector,
          vectorOf(image.embedding?.vectorJson)
        );
        const verdict = guardPairing({
          postSubject: post.subject,
          imageSubject: image.tag!.subject,
          score,
          confidence: image.tag!.confidence,
        });
        return { image, score, verdict };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    if (persistPostId) {
      await Promise.all(
        ranked.slice(0, 3).map((candidate) =>
          pairingsRepository.upsert({
            postId: persistPostId,
            imageId: candidate.image.id,
            ...persistPayload(candidate.score, candidate.verdict),
          })
        )
      );
    }

    const firstAccepted = ranked.find((candidate) => candidate.verdict.accepted);
    return {
      post,
      status: firstAccepted ? "suggested" : "no_match",
      reason: firstAccepted
        ? null
        : ranked[0]?.verdict.reason || "No embedded images are available.",
      policyId: ranked[0]?.verdict.policyId ?? null,
      candidates: ranked,
    };
  },

  async forcePair(postId: string, imageId: string) {
    const [post, image] = await Promise.all([
      postsRepository.findById(postId),
      imagesRepository.findById(imageId),
    ]);
    if (!post?.embedding) throw new Error("post embedding not found");
    if (!image?.embedding || !image.tag) throw new Error("tagged image embedding not found");
    assertSameEmbeddingSpace(
      post.embedding.model,
      image.embedding.model,
      post.embedding.dims,
      image.embedding.dims
    );
    const score = cosineSimilarity(
      vectorOf(post.embedding.vectorJson),
      vectorOf(image.embedding.vectorJson)
    );
    const verdict = guardPairing({
      postSubject: post.subject,
      imageSubject: image.tag.subject,
      score,
      confidence: image.tag.confidence,
    });
    return pairingsRepository.upsert({
      postId,
      imageId,
      ...persistPayload(score, verdict),
    });
  },
};
