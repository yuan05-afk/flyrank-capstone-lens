import fs from "fs";
import path from "path";
import { imagesRepository, postsRepository } from "@/repositories";

/**
 * Bring-your-own library helpers. Teams can register images already on disk
 * under public/ and CMS posts without rewriting the wildlife fixtures.
 */
export const libraryService = {
  async registerImage(input: { name: string; relativePath: string }) {
    const publicPath = input.relativePath.startsWith("/")
      ? input.relativePath
      : `/${input.relativePath}`;
    const absolute = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
    if (!fs.existsSync(absolute)) {
      throw new Error(`image file not found at public${publicPath}`);
    }
    const image = await imagesRepository.upsertSeed({
      name: input.name,
      path: publicPath,
    });
    return image;
  },

  async registerPost(input: {
    slug: string;
    title: string;
    body: string;
    subject?: string | null;
    url?: string | null;
  }) {
    return postsRepository.upsertSeed({
      slug: input.slug,
      title: input.title,
      body: input.body,
      subject: input.subject ?? null,
      url: input.url ?? null,
    });
  },

  async snapshot() {
    const [images, posts] = await Promise.all([
      imagesRepository.list(),
      postsRepository.list(),
    ]);
    return {
      images: images.length,
      posts: posts.length,
      tagged: images.filter((image) => image.tag).length,
      embeddedImages: images.filter((image) => image.embedding).length,
      embeddedPosts: posts.filter((post) => post.embedding).length,
    };
  },
};
