import { libraryService } from "@/services/library.service";

/**
 * Example:
 * pnpm library:import -- --image demo.jpg --name demo.jpg --slug my-post --title "My post" --body "..." --subject "red fox"
 */
async function main() {
  const args = process.argv.slice(2);
  const read = (flag: string) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };

  const image = read("--image");
  const name = read("--name") || image;
  const slug = read("--slug");
  const title = read("--title");
  const body = read("--body");
  const subject = read("--subject");
  const url = read("--url");

  if (image && name) {
    const relativePath = image.startsWith("corpus/") || image.startsWith("/corpus/")
      ? image.startsWith("/")
        ? image
        : `/${image}`
      : `/uploads/${image.replace(/^uploads\//, "")}`;
    const registered = await libraryService.registerImage({
      name,
      relativePath,
    });
    console.log("image", registered.id, registered.path);
  }

  if (slug && title && body) {
    const post = await libraryService.registerPost({
      slug,
      title,
      body,
      subject: subject ?? null,
      url: url ?? null,
    });
    console.log("post", post.id, post.slug);
  }

  console.log(JSON.stringify(await libraryService.snapshot(), null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
