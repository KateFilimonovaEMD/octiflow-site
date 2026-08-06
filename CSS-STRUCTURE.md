# CSS structure

`src/styles/site.css` is the only stylesheet imported by the layout. It loads the files below in cascade order.

- `core/tokens.css` - colors, type scale, spacing, radii, shadows and motion tokens.
- `content/blog.css` - blog listing, article layout and article content.
- `core/foundation.css` - reset, document defaults, focus treatment and container.
- `components/ui.css` - shared eyebrows, buttons, text links, action links, cards and type roles.
- `components/header.css` - desktop and mobile header.
- `components/store-badges.css` - App Store and Google Play badge primitives.
- `content/content-layout.css` - legal and support page shell.
- `content/contact-base.css` - shared contact blocks.
- `components/footer.css` - footer and social links.
- `core/responsive.css` - shared responsive rules.
- `pages/contact-support.css` - contact and support pages.
- `pages/product.css` - small compatibility hooks still used by About and 404.
- `pages/about.css` - About page.
- `pages/home.css` - homepage.

## Shared UI classes

Use these before creating a page-specific copy:

- `eyebrow` with page-specific variables or `eyebrow--light`.
- `button` with `button--primary`, `button--secondary`, `button--light`, `button--inverse`, and `button--large`.
- `text-link` and `text-link--inverse` for underlined inline links.
- `action-link` and `action-link--inverse` for directional links.
- `card`, `card--brand`, `page-title`, `page-lead`, and `card-title`.

Page-specific classes should keep only layout, spacing, color overrides, or unique component geometry.

Run `npm run audit:styles` after structural CSS changes. It does not run during the production build and does not delete anything automatically.
