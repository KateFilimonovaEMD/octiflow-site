# CSS structure

`src/styles/site.css` is the only stylesheet imported by `BaseLayout.astro`. It loads the files below in cascade order.

- `core/tokens.css` - colors, system font stack, type scale, spacing, radii, shadows, and motion tokens.
- `content/blog.css` - blog listing, article layout, and article content.
- `core/foundation.css` - reset, document defaults, focus treatment, and container.
- `components/ui.css` - shared eyebrows, buttons, text links, action links, cards, type roles, and line icons.
- `components/header.css` - desktop header.
- `components/store-badges.css` - App Store and Google Play badge primitives.
- `content/content-layout.css` - legal, contact, and support page shell.
- `content/contact-base.css` - shared contact blocks.
- `components/footer.css` - footer and social links.
- `core/responsive.css` - shared header, content, footer, and accessibility breakpoints.
- `pages/contact-support.css` - contact and support page geometry.
- `pages/about.css` - About page geometry and art direction.
- `pages/home.css` - homepage geometry and art direction.

## Shared UI classes

Use these before creating a page-specific copy:

- `eyebrow`, `eyebrow--light`, and `eyebrow--section`.
- `button` with `button--primary`, `button--secondary`, `button--light`, `button--inverse`, and `button--large`.
- `text-link` and `text-link--inverse` for underlined inline links.
- `action-link` and `action-link--inverse` for directional links.
- `card`, `card--brand`, `page-title`, `page-lead`, and `card-title`.
- `icon-stroke-centered` for a centered 17 px outline SVG inside a positioned control.
- `StoreBadges.astro` for every App Store and Google Play badge row.

Page-specific classes should own only layout, spacing, color overrides, responsive behavior, or unique visual art direction.

## Audit

Run:

```bash
npm run audit:styles
```

The audit checks the complete imported CSS graph for:

- stylesheets that exist but are not imported;
- CSS classes that are unused or referenced without a definition;
- duplicate selectors in the same cascade context;
- repeated declaration blocks of four or more properties;
- unused custom properties;
- inline styles in Astro files;
- duplicated raw store-badge markup;
- retired compatibility class names.

The audit never rewrites or deletes files automatically.
