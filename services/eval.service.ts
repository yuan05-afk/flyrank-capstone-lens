import { EVAL_CASES, EVAL_MATRIX } from "@/fixtures/catalog";
import { cosineSimilarity } from "@/lib/similarity";
import { imagesRepository, postsRepository } from "@/repositories";
import { guardPairing, guardPairingWithThresholds } from "./guard.service";
import { matchingService } from "./matching.service";

function vectorOf(value: string | null | undefined): number[] {
  if (!value) return [];
  return JSON.parse(value) as number[];
}

export const evalService = {
  async run() {
    // Load the corpus once. Previously each EVAL_CASE called matchingService.rank
    // which re-listed all 50 images + embeddings (~7 full corpus reads per boot).
    const [images, posts] = await Promise.all([
      imagesRepository.list(),
      postsRepository.list(),
    ]);
    const postBySlug = new Map(posts.map((post) => [post.slug, post]));

    const results = [];
    let correct = 0;
    let noMatchExpected = 0;
    let noMatchCorrect = 0;

    for (const testCase of EVAL_CASES) {
      const post = postBySlug.get(testCase.postSlug);
      if (!post) throw new Error(`missing eval post ${testCase.postSlug}`);
      const ranked = await matchingService.rankAgainst(post, images, 8);
      const accepted = ranked.candidates.find((candidate) => candidate.verdict.accepted);
      const predicted = accepted?.image.tag?.subject ?? null;
      const pass =
        testCase.expectedSubject === null
          ? ranked.status === "no_match"
          : predicted === testCase.expectedSubject && ranked.status === "suggested";
      if (pass) correct += 1;
      if (testCase.expectedStatus === "no_match") {
        noMatchExpected += 1;
        if (ranked.status === "no_match") noMatchCorrect += 1;
      }
      results.push({
        postSlug: testCase.postSlug,
        expected: testCase.expectedSubject,
        expectedStatus: testCase.expectedStatus,
        predicted,
        status: ranked.status,
        pass,
      });
    }

    const matrix = this.runMatrixWith(images, postBySlug);
    const falseRefuse = matrix.rows.filter(
      (row) => row.expectedStatus === "suggested" && row.actualStatus !== "suggested"
    ).length;
    const falseAccept = matrix.rows.filter(
      (row) =>
        row.expectedStatus !== "suggested" && row.actualStatus === "suggested"
    ).length;

    return {
      total: results.length,
      correct,
      top1Precision: results.length ? correct / results.length : 0,
      noMatchRecall: noMatchExpected ? noMatchCorrect / noMatchExpected : 1,
      guardFalseRefuseRate: matrix.rows.length ? falseRefuse / matrix.rows.length : 0,
      guardFalseAcceptRate: matrix.rows.length ? falseAccept / matrix.rows.length : 0,
      matrix,
      results,
    };
  },

  runMatrixWith(
    images: Awaited<ReturnType<typeof imagesRepository.list>>,
    postBySlug: Map<string, Awaited<ReturnType<typeof postsRepository.list>>[number]>
  ) {
    const rows = [];
    let pass = 0;

    for (const caseRow of EVAL_MATRIX) {
      const post = postBySlug.get(caseRow.postSlug);
      const image = images.find((item) => item.name === caseRow.imageName);
      if (!post?.embedding || !image?.embedding || !image.tag) {
        throw new Error(`matrix fixture missing ${caseRow.postSlug} / ${caseRow.imageName}`);
      }
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
      const ok = verdict.status === caseRow.expectedStatus;
      if (ok) pass += 1;
      rows.push({
        ...caseRow,
        score: Number(score.toFixed(4)),
        actualStatus: verdict.status,
        reason: verdict.reason,
        policyId: verdict.policyId,
        features: verdict.features,
        pass: ok,
      });
    }

    return {
      total: rows.length,
      correct: pass,
      accuracy: rows.length ? pass / rows.length : 0,
      rows,
    };
  },

  async runMatrix() {
    const [images, posts] = await Promise.all([
      imagesRepository.list(),
      postsRepository.list(),
    ]);
    return this.runMatrixWith(
      images,
      new Map(posts.map((post) => [post.slug, post]))
    );
  },

  async thresholdSweep() {
    const images = await imagesRepository.list();
    const posts = await postsRepository.list();
    const postBySlug = new Map(posts.map((post) => [post.slug, post]));
    const simValues = [0.3, 0.36, 0.42, 0.48, 0.54, 0.6];
    const confValues = [0.6, 0.66, 0.72, 0.78, 0.84];
    const points = [];

    for (const similarityThreshold of simValues) {
      for (const confidenceThreshold of confValues) {
        let correct = 0;
        for (const caseRow of EVAL_MATRIX) {
          const post = postBySlug.get(caseRow.postSlug);
          const image = images.find((item) => item.name === caseRow.imageName);
          if (!post?.embedding || !image?.embedding || !image.tag) continue;
          const score = cosineSimilarity(
            vectorOf(post.embedding.vectorJson),
            vectorOf(image.embedding.vectorJson)
          );
          const verdict = guardPairingWithThresholds(
            {
              postSubject: post.subject,
              imageSubject: image.tag.subject,
              score,
              confidence: image.tag.confidence,
            },
            similarityThreshold,
            confidenceThreshold
          );
          if (verdict.status === caseRow.expectedStatus) correct += 1;
        }
        points.push({
          similarityThreshold,
          confidenceThreshold,
          accuracy: correct / EVAL_MATRIX.length,
          correct,
          total: EVAL_MATRIX.length,
        });
      }
    }

    const best = [...points].sort((a, b) => b.accuracy - a.accuracy)[0];
    return { points, best };
  },
};
