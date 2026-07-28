import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { isPublished, postUrl, sortPosts } from "../utils/blog";

export async function GET(context) {
  const posts = sortPosts((await getCollection("blog")).filter(isPublished));

  return rss({
    title: "Octi Flow Blog",
    description:
      "Practical guides to hydration habits, water tracking, reminders, and Octi Flow.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: postUrl(post),
    })),
  });
}
