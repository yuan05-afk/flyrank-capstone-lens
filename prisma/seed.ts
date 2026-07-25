import "../scripts/generate-corpus";
import { CORPUS, POST_FIXTURES } from "../fixtures/catalog";
import { prisma } from "../lib/db";
import { imagesRepository, postsRepository } from "../repositories";

async function main() {
  // A seed is a reproducible demo reset, not an append. Child tables first.
  await prisma.pairing.deleteMany();
  await prisma.costEvent.deleteMany();
  await prisma.job.deleteMany();
  await prisma.embedding.deleteMany();
  await prisma.imageTag.deleteMany();
  await prisma.imageAsset.deleteMany();
  await prisma.post.deleteMany();

  for (const item of CORPUS) {
    await imagesRepository.upsertSeed({ name: item.name, path: item.path });
  }
  for (const post of POST_FIXTURES) {
    await postsRepository.upsertSeed({
      ...post,
      subject: post.subject ?? null,
      url: post.url ?? null,
    });
  }

  console.log(`seeded ${CORPUS.length} images and ${POST_FIXTURES.length} posts`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
