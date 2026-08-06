# Octi Flow style system

The site uses two CSS files with distinct responsibilities:

- `src/styles/design-system.css`: tokens and reusable roles.
- `src/styles/site.css`: component-specific geometry and visual treatment.

Both files use cascade layers. `site.css` must not redefine typography owned by the design system.

## Typography

The entire site uses one font stack through `--font-sans`:

```css
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
```

Use these semantic roles instead of creating page-specific heading or paragraph typography:

| Role | Class |
| --- | --- |
| Main page title | `.page-title` |
| Large storytelling title | `.display-title` |
| Article title | `.article-title` |
| Article card title | `.article-card-title` |
| Main section title | `.section-title` |
| Content/legal section title | `.content-title` |
| Card title | `.card-title` |
| Main page introduction | `.page-lead` |
| Article introduction | `.article-lead` |
| Section introduction | `.section-lead` |
| Card description | `.card-copy` |
| Uppercase section label | `.eyebrow` |
| Small uppercase metadata | `.meta-label` |
| Metadata line | `.meta-copy` |
| Fine print | `.fine-print` |

Do not set `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, or `text-transform` for these roles in `site.css`.

## Heading spacing

Wrap a kicker, title, and optional lead in `.heading-group`:

```astro
<div class="heading-group">
  <p class="eyebrow">Progress without pressure</p>
  <h2 class="section-title">See the habit taking shape.</h2>
  <p class="section-lead">...</p>
</div>
```

The design system owns the spacing:

- eyebrow to title: `16px`
- title to lead: `28px` on desktop, `24px` on small screens
- lead to a button group, store badges, or arrow link: `32px` on desktop, `28px` on small screens

Do not recreate these gaps in component selectors.

## Layout primitives

Use these classes before creating a new grid or spacing class:

- `.container`
- `.section-block`
- `.section-block--bottom`
- `.section-heading` with `.section-heading--center` or `.section-heading--compact`
- `.content-stack`
- `.card-grid`
- `.card-grid--2`
- `.card-grid--3`
- `.card-grid--stack-tablet`
- `.cluster`
- `.action-stack`

Component classes may set custom properties such as `--card-grid-gap` or `--cluster-gap`.

## Shared components and visuals

- App-store badges: `src/components/StoreBadges.astro`
- Buttons: `.button` with `.button--primary`, `.button--secondary`, or `.button--inverse`
- Text links: `.text-link`; arrow links: `.arrow-link`
- Cards: `.card`, optionally `.card--brand`
- Media: `.media-fluid`, `.media-fill`, `.media-cover`
- SVG lines: `.icon-stroke`, with size/placement helpers as needed
- Gradient sections: `.gradient-section` and its modifiers
- Shared decorative orbit: `.decorative-orb-section`
- Responsive store-badge alignment: `.store-badges--responsive-center`

## Component classes

BEM-style classes such as `.home-progress__icon` or `.about-person-card__portrait` are appropriate only for geometry, positioning, component colors, and unique effects.

Do not create a new component class merely to duplicate an existing font size, heading gap, button, badge, grid, image reset, or card-copy style.

## Automated check

Run:

```bash
npm run audit:styles
```

The audit fails when it finds:

- an unused CSS class;
- a duplicate selector in the same cascade context;
- a repeated declaration block that should be shared;
- an old/forbidden class name;
- page CSS overriding a semantic typography role;
- element-based heading typography outside article prose;
- a second font family in component CSS.

## When a component class is justified

A new page-specific class is acceptable only when it owns unique geometry, positioning, or visual art direction. Before adding one, check whether the need is already covered by a semantic role, layout primitive, component modifier, or token.

Do not introduce a new class for a different font size, heading gap, card radius, store badge row, image reset, button treatment, section spacing, or repeated decorative orbit.
