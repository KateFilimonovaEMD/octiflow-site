import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { isPublished, postUrl, sortPosts } from "../utils/blog";

export async function GET(context) {
  const posts = sortPosts((await getCollection("blog")).filter(isPublished));

  return rss({
    title: "Octi Flow Blog",
    description:
      "Evidence-based guides to hydration, exercise, sleep, everyday health and habit building from Octi Flow.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: postUrl(post),
    })),
  });
}
