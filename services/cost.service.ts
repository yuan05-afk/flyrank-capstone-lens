import { BUDGET_CONFIG } from "@/config/budget.config";
import { costsRepository, pairingsRepository } from "@/repositories";

export const costService = {
  async summary() {
    const [events, pairings, spentUsd] = await Promise.all([
      costsRepository.list(),
      pairingsRepository.list(),
      costsRepository.totalUsd(),
    ]);
    const visionCalls = events.filter((event) => event.kind === "vision").length;
    const embeddingCalls = events.filter((event) => event.kind === "embedding").length;
    const accepted = pairings.filter((row) =>
      ["suggested", "approved"].includes(row.status)
    ).length;
    const guarded = pairings.filter((row) => row.status === "guarded").length;
    const budgetUsd = BUDGET_CONFIG.maxBatchUsd;
    const remainingUsd = Math.max(0, budgetUsd - spentUsd);

    return {
      events,
      totalUsd: spentUsd,
      visionCalls,
      embeddingCalls,
      budgetUsd,
      remainingUsd,
      budgetExhausted: spentUsd >= budgetUsd,
      costPerVisionCall: visionCalls ? spentUsd / Math.max(visionCalls, 1) : 0,
      costPerAcceptedPairing: accepted ? spentUsd / accepted : null,
      outcomes: {
        accepted,
        guarded,
        rejected: pairings.filter((row) => row.status === "rejected").length,
        totalPairings: pairings.length,
      },
    };
  },

  async assertWithinBudget() {
    const spentUsd = await costsRepository.totalUsd();
    if (spentUsd >= BUDGET_CONFIG.maxBatchUsd) {
      const error = new Error(
        `Batch budget exhausted: spent $${spentUsd.toFixed(4)} of $${BUDGET_CONFIG.maxBatchUsd.toFixed(2)}`
      );
      (error as Error & { code?: string }).code = "BUDGET_EXHAUSTED";
      throw error;
    }
    return { spentUsd, remainingUsd: BUDGET_CONFIG.maxBatchUsd - spentUsd };
  },
};
