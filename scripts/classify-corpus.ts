import { classificationService } from "../services/classification.service";
import { workerService } from "../services/worker.service";

async function main() {
  const queued = await classificationService.enqueuePending();
  const drained = await workerService.drain();
  console.log(JSON.stringify({ queued: queued.enqueued, processed: drained.processed }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
