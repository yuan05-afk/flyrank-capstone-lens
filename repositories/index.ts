import { prisma } from "@/lib/db";

export const imagesRepository = {
  list() {
    return prisma.imageAsset.findMany({ include: { tag: true, embedding: true }, orderBy: { name: "asc" } });
  },
  pending() {
    return prisma.imageAsset.findMany({ where: { status: "pending" }, orderBy: { name: "asc" } });
  },
  findById(id: string) {
    return prisma.imageAsset.findUnique({ where: { id }, include: { tag: true, embedding: true } });
  },
  upsertSeed(data: { name: string; path: string }) {
    return prisma.imageAsset.upsert({
      where: { name: data.name },
      create: data,
      update: { path: data.path },
    });
  },
  markStatus(id: string, status: string) {
    return prisma.imageAsset.update({ where: { id }, data: { status } });
  },
};

export const tagsRepository = {
  upsert(data: {
    imageId: string;
    subject: string;
    category: string;
    attributesJson: string;
    caption: string;
    confidence: number;
    flaggedLowConfidence: boolean;
    provider: string;
  }) {
    return prisma.imageTag.upsert({
      where: { imageId: data.imageId },
      create: data,
      update: data,
    });
  },
};

export const postsRepository = {
  list() {
    return prisma.post.findMany({ include: { embedding: true }, orderBy: { createdAt: "asc" } });
  },
  findById(id: string) {
    return prisma.post.findUnique({ where: { id }, include: { embedding: true } });
  },
  findBySlug(slug: string) {
    return prisma.post.findUnique({ where: { slug }, include: { embedding: true } });
  },
  upsertSeed(data: { slug: string; title: string; body: string; subject: string | null; url: string | null }) {
    return prisma.post.upsert({ where: { slug: data.slug }, create: data, update: data });
  },
};

export const embeddingsRepository = {
  upsertForImage(imageId: string, model: string, vector: number[]) {
    return prisma.embedding.upsert({
      where: { ownerId: imageId },
      create: { ownerType: "image", ownerId: imageId, imageId, model, dims: vector.length, vectorJson: JSON.stringify(vector) },
      update: { model, dims: vector.length, vectorJson: JSON.stringify(vector) },
    });
  },
  upsertForPost(postId: string, model: string, vector: number[]) {
    return prisma.embedding.upsert({
      where: { ownerId: postId },
      create: { ownerType: "post", ownerId: postId, postId, model, dims: vector.length, vectorJson: JSON.stringify(vector) },
      update: { model, dims: vector.length, vectorJson: JSON.stringify(vector) },
    });
  },
};

export const jobsRepository = {
  enqueue(type: string, payload = "{}") {
    return prisma.job.create({ data: { type, payload } });
  },
  async claimDue() {
    const job = await prisma.job.findFirst({
      where: { doneAt: null, lockedAt: null, runAt: { lte: new Date() } },
      orderBy: { createdAt: "asc" },
    });
    if (!job) return null;
    return prisma.job.update({
      where: { id: job.id },
      data: { lockedAt: new Date(), attempts: { increment: 1 } },
    });
  },
  done(id: string) {
    return prisma.job.update({ where: { id }, data: { doneAt: new Date(), lockedAt: null, lastError: null } });
  },
  retry(id: string, message: string, delayMs: number, terminal: boolean) {
    return prisma.job.update({
      where: { id },
      data: {
        lockedAt: null,
        lastError: message,
        runAt: new Date(Date.now() + delayMs),
        doneAt: terminal ? new Date() : null,
      },
    });
  },
  list() {
    return prisma.job.findMany({ orderBy: { createdAt: "desc" }, take: 30 });
  },
};

export const costsRepository = {
  create(data: { kind: string; model: string; units: number; unitCostUsd: number; totalUsd: number; refType: string; refId: string }) {
    return prisma.costEvent.create({ data });
  },
  list() {
    return prisma.costEvent.findMany({ orderBy: { createdAt: "desc" } });
  },
};

export const pairingsRepository = {
  upsert(data: { postId: string; imageId: string; score: number; status: string; guardReason: string | null }) {
    return prisma.pairing.upsert({
      where: { postId_imageId: { postId: data.postId, imageId: data.imageId } },
      create: data,
      update: { score: data.score, status: data.status, guardReason: data.guardReason, decidedAt: null },
      include: { post: true, image: { include: { tag: true } } },
    });
  },
  list() {
    return prisma.pairing.findMany({
      include: { post: true, image: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
  decide(id: string, status: "approved" | "rejected") {
    return prisma.pairing.update({ where: { id }, data: { status, decidedAt: new Date() }, include: { post: true, image: { include: { tag: true } } } });
  },
};
