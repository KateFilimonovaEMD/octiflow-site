# CSS structure

The original `src/styles/site.css` has been split into smaller files. Shared component families are then consolidated one at a time while preserving their existing visual variants.

`site.css` is the only stylesheet imported by `BaseLayout.astro`. It imports the files below in the same order in which their rules appeared in the original stylesheet.

- `core/tokens.css` - design tokens and CSS variables
- `content/blog.css` - blog listing, article cards, article pages, and article responsive rules
- `core/foundation.css` - reset, document defaults, links, shared primitives, and containers
- `components/header.css` - desktop header, navigation, and mobile menu base rules
- `components/store-badges.css` - shared App Store and Google Play badge component rules
- `content/content-layout.css` - generic hero, legal/document layout, table of contents, and policy content
- `content/contact-base.css` - base contact card rules
- `components/footer.css` - footer and social links
- `core/responsive.css` - shared responsive, fallback, and reduced-motion rules
- `pages/contact-support.css` - contact and support page-specific layout
- `pages/product.css` - legacy product-page rules still referenced by the current markup
- `pages/about.css` - About page
- `pages/home.css` - homepage

Do not reorder these imports until visual regression testing is available. Page-specific files may still contain similar patterns; consolidating them is a separate, later step and should be done one component family at a time.
