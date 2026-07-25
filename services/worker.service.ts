import { classificationService } from "@/services/classification.service";
import { jobsRepository } from "@/repositories";

export const workerService = {
  async tickOnce() {
    const job = await jobsRepository.claimDue();
    if (!job) return { processed: false };

    try {
      const payload = JSON.parse(job.payload) as { imageId?: string };
      if (job.type === "classify" && payload.imageId) {
        const result = await classificationService.classifyOne(payload.imageId);
        await jobsRepository.done(job.id);
        return { processed: true, jobId: job.id, type: job.type, result };
      }
      throw new Error(`unsupported job type ${job.type}`);
    } catch (error) {
      const message = (error as Error).message;
      const terminal = job.attempts >= 3;
      await jobsRepository.retry(job.id, message, 500 * 2 ** job.attempts, terminal);
      return { processed: true, jobId: job.id, error: message, terminal };
    }
  },

  async drain(max = 200) {
    const results = [];
    for (let i = 0; i < max; i += 1) {
      const result = await this.tickOnce();
      if (!result.processed) break;
      results.push(result);
    }
    return { processed: results.length, results };
  },
};
