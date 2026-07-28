import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://evamariadreams.com",
  build: {
    format: "file",
  },
  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        const url = new URL(item.url);

        if (url.pathname !== "/" && !url.pathname.endsWith(".html")) {
          url.pathname = `${url.pathname}.html`;
        }

        return { ...item, url: url.href };
      },
    }),
  ],
});
