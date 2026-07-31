# Blog scaffold changes

## Final layout and resilience audit — July 30, 2026

- Verified every route at 320, 360, 390, 430, 768, 821, 921, 1024, and
  1440 px without horizontal overflow, hidden content, console errors, or
  failed local asset requests.
- Removed the remaining reveal-on-scroll dependency so essential page content
  is visible immediately, including when JavaScript is unavailable or the user
  scrolls quickly.
- Fixed narrow-screen overflow in the Contact and Support cards and added
  deliberate break opportunities to long email addresses without changing
  their visible wording or targets.
- Scoped article paragraph and list spacing to direct children so nested author
  and call-to-action components keep their intended internal rhythm.
- Confirmed equal 40 px margins above and below every article `h2` at mobile
  width.
- Reduced the header logo asset from 241 KB to 58 KB while retaining sufficient
  high-density display resolution and corrected intrinsic dimensions.
- Expanded short page titles and descriptions for clearer search snippets.
- Rechecked HTML, CSS, JSON-LD, anchors, local assets, manifest, robots, sitemap,
  dependency integrity, and common client-side security hazards.

## Article heading rhythm — July 30, 2026

- Replaced the uneven article `h2` spacing of 64 px above and 20 px below
  with an equal responsive 40–42 px on both sides.
- Made article `h3` spacing equal at a responsive 28–32 px on both sides.

## Mobile article spacing — July 30, 2026

- Reduced only the article hero's mobile top padding from a fixed minimum of
  72 px to a responsive 36–56 px, bringing the breadcrumbs closer to the
  header without changing desktop spacing.

## Header and security audit — July 30, 2026

- Rebuilt the mobile header as a three-column grid so the App Store badge is
  mathematically centered in the viewport from 320 px through 820 px.
- Added a narrower 320–352 px header variant to prevent the centered badge from
  overlapping the logo.
- Replaced the decorative hamburger icon with an accessible menu button and a
  working mobile navigation menu.
- Corrected the intrinsic dimensions of the Octi Flow logo and App Store badge.
- Updated Astro from 5 to 7 and pinned the supported Node.js runtime.
- Removed the unused MDX integration; blog content currently uses Markdown.
- Updated the content schema to Astro 7's supported Zod import.
- Escaped JSON-LD before inline output to prevent a future article title or
  metadata value from closing the script element.
- Removed unused CSS selectors, variables, and a duplicate mobile rule.
- Updated article heading slugs so every generated HTML ID starts with a letter.
- Corrected disabled pagination semantics and one raw ampersand in visible copy.

## Initial blog scaffold

## Added

- `astro.config.mjs`
- `package.json`
- `tsconfig.json`
- `BLOG-GUIDE.md`
- `CHANGES.md`
- `src/content.config.ts`
- `src/content/blog/article-template.md`
- `src/utils/blog.ts`
- `src/layouts/BaseLayout.astro`
- `src/layouts/ArticleLayout.astro`
- `src/components/blog/ArticleCard.astro`
- `src/components/blog/ArticleCta.astro`
- `src/components/blog/RelatedArticles.astro`
- `src/pages/blog.astro`
- `src/pages/blog/[id].astro`
- `src/pages/rss.xml.js`

## Changed

- `src/layouts/ContentLayout.astro`: now uses the shared HTML/SEO shell in
  `BaseLayout.astro`; page markup and legal content are unchanged.
- `src/components/SiteFooter.astro`: added the Blog link.
- `src/styles/site.css`: added isolated blog and article styles.
- `src/pages/contact.astro`: added an explicit empty TOC type for strict
  TypeScript validation; rendered content is unchanged.
- `src/pages/support.astro`: added an explicit empty TOC type for strict
  TypeScript validation; rendered content is unchanged.

## Delete

- Nothing.

## Dependency changes

- Added `@astrojs/rss`
- Added `@astrojs/sitemap`
- Added `@astrojs/check` and TypeScript for validation
- Removed `@astrojs/mdx` because the site does not use MDX.
