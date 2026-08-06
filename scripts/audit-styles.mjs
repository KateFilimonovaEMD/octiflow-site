import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const stylesDir = path.join(root, "src", "styles");
const sourceDir = path.join(root, "src");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = openIndex; i < text.length; i += 1) {
    const char = text[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error(`Unmatched CSS brace at ${openIndex}`);
}

function parseDeclarations(body) {
  const declarations = [];
  let current = "";
  let parenDepth = 0;
  let quote = null;
  let escaped = false;
  const flush = () => {
    const item = current.trim();
    current = "";
    if (!item) return;
    const colon = item.indexOf(":");
    if (colon < 1) return;
    const name = item.slice(0, colon).trim().toLowerCase();
    const value = item.slice(colon + 1).trim().replace(/\s+/g, " ");
    declarations.push([name, value]);
  };
  for (const char of body) {
    if (quote) {
      current += char;
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }
    if (char === "(") parenDepth += 1;
    if (char === ")") parenDepth = Math.max(0, parenDepth - 1);
    if (char === ";" && parenDepth === 0) flush();
    else current += char;
  }
  flush();
  return declarations;
}

function parseRules(css, fileName, context = []) {
  const rules = [];
  let index = 0;
  while (index < css.length) {
    while (index < css.length && /\s/.test(css[index])) index += 1;
    if (index >= css.length) break;
    const brace = css.indexOf("{", index);
    const semicolon = css.indexOf(";", index);
    if (semicolon !== -1 && (brace === -1 || semicolon < brace)) {
      index = semicolon + 1;
      continue;
    }
    if (brace === -1) break;
    const prelude = css.slice(index, brace).trim().replace(/\s+/g, " ");
    const close = findMatchingBrace(css, brace);
    const body = css.slice(brace + 1, close);
    if (prelude.startsWith("@")) {
      const [name, ...rest] = prelude.slice(1).split(/\s+/);
      const atContext = [...context, `@${name} ${rest.join(" ")}`.trim()];
      if (["media", "supports", "layer", "container", "keyframes", "-webkit-keyframes"].includes(name)) {
        rules.push(...parseRules(body, fileName, atContext));
      }
    } else {
      rules.push({
        fileName,
        context,
        selector: prelude,
        declarations: parseDeclarations(body),
      });
    }
    index = close + 1;
  }
  return rules;
}

const styleFiles = (await walk(stylesDir)).filter((file) => file.endsWith(".css"));
const sourceFiles = (await walk(sourceDir)).filter((file) => !file.endsWith(".css"));
const sourceText = (await Promise.all(sourceFiles.map((file) => readFile(file, "utf8")))).join("\n");
const rules = [];
for (const file of styleFiles) {
  const css = stripComments(await readFile(file, "utf8"));
  rules.push(...parseRules(css, path.relative(root, file)));
}

const errors = [];
const warnings = [];

const selectorMap = new Map();
for (const rule of rules) {
  const key = JSON.stringify([rule.fileName, rule.context, rule.selector]);
  const previous = selectorMap.get(key) ?? [];
  previous.push(rule);
  selectorMap.set(key, previous);
}
for (const [key, duplicates] of selectorMap) {
  if (duplicates.length > 1) errors.push(`Duplicate selector in the same cascade context: ${key}`);
}

const declarationMap = new Map();
for (const rule of rules) {
  if (rule.declarations.length < 3) continue;
  const normalized = [...rule.declarations]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${name}:${value}`)
    .join(";");
  const key = JSON.stringify([rule.fileName, rule.context, normalized]);
  const selectors = declarationMap.get(key) ?? [];
  selectors.push(rule.selector);
  declarationMap.set(key, selectors);
}
for (const [key, selectors] of declarationMap) {
  const unique = [...new Set(selectors)];
  if (unique.length > 1) errors.push(`Repeated declaration block should be shared: ${unique.join(" | ")} (${key})`);
}

const globalDeclarationMap = new Map();
for (const rule of rules) {
  if (rule.declarations.length < 4) continue;
  const normalized = [...rule.declarations]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${name}:${value}`)
    .join(";");
  const matches = globalDeclarationMap.get(normalized) ?? [];
  matches.push(`${rule.fileName} ${rule.context.join(" ")} ${rule.selector}`.trim());
  globalDeclarationMap.set(normalized, matches);
}
for (const [declarations, matches] of globalDeclarationMap) {
  const unique = [...new Set(matches)];
  if (unique.length > 1) {
    errors.push(`Repeated global declaration block should use a shared primitive: ${unique.join(" | ")} (${declarations})`);
  }
}

const cssClasses = new Set();
for (const rule of rules) {
  for (const match of rule.selector.matchAll(/\.([A-Za-z_][\w-]*)/g)) cssClasses.add(match[1]);
}
const dynamicClassAllowlist = new Set([
  "store-badges--header",
  "store-badges--article",
  "store-badges--cta",
  "toc-depth-3",
]);
for (const className of [...cssClasses].sort()) {
  if (dynamicClassAllowlist.has(className)) continue;
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(`(^|[^\\w-])${escaped}([^\\w-]|$)`);
  if (!expression.test(sourceText)) errors.push(`Unused CSS class: .${className}`);
}

const forbiddenClassPrefixes = ["product-", "flow-"];
for (const className of cssClasses) {
  if (forbiddenClassPrefixes.some((prefix) => className.startsWith(prefix))) {
    errors.push(`Legacy CSS class prefix remains: .${className}`);
  }
}
for (const legacyName of ["home-kicker", "section-eyebrow", "app-store-link", "button-link"]) {
  if (cssClasses.has(legacyName) || sourceText.includes(legacyName)) errors.push(`Legacy class remains: ${legacyName}`);
}

const semanticRoles = [
  ".page-title",
  ".display-title",
  ".article-title",
  ".article-card-title",
  ".section-title",
  ".content-title",
  ".card-title",
  ".page-lead",
  ".article-lead",
  ".section-lead",
  ".card-copy",
  ".eyebrow",
  ".meta-label",
  ".meta-copy",
  ".fine-print",
  ".step-index",
];
const typographyProperties = new Set([
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "text-transform",
]);
const semanticSpacingProperties = new Set([
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "margin-block",
  "margin-block-start",
  "margin-block-end",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "padding-block",
  "padding-block-start",
  "padding-block-end",
]);
function selectorTargetsRole(selector, role) {
  return selector
    .split(",")
    .map((part) => part.trim())
    .some((part) => {
      const withoutNot = part.replace(/:not\([^)]*\)/g, "");
      return new RegExp(`${role.replace(".", "\\.")}(?:[:\[].*)?$`).test(withoutNot);
    });
}

for (const rule of rules.filter((item) => item.fileName.endsWith("site.css"))) {
  const targetedRoles = semanticRoles.filter((role) => selectorTargetsRole(rule.selector, role));
  if (targetedRoles.length) {
    const bad = rule.declarations.filter(([name]) => typographyProperties.has(name));
    if (bad.length) errors.push(`Component CSS overrides a semantic type role: ${rule.selector} -> ${bad.map(([name]) => name).join(", ")}`);
    const badSpacing = rule.declarations.filter(([name]) => semanticSpacingProperties.has(name));
    if (badSpacing.length) errors.push(`Component CSS overrides semantic heading spacing: ${rule.selector} -> ${badSpacing.map(([name]) => name).join(", ")}`);
  }
  if (!rule.selector.includes(".article-prose") && /(^|[\s>+~,])(h1|h2|h3)(?=[:.\s>+~,#]|$)/.test(rule.selector)) {
    const bad = rule.declarations.filter(([name]) => typographyProperties.has(name));
    if (bad.length) errors.push(`Element-based heading typography remains: ${rule.selector}`);
  }
  if (rule.declarations.some(([name]) => name === "font-family")) {
    errors.push(`Component CSS sets its own font family: ${rule.selector}`);
  }
}

if (/<style(?:\s|>)/i.test(sourceText)) errors.push("Inline <style> blocks remain in source files.");
if (/\sstyle\s*=/.test(sourceText)) errors.push("Inline style attributes remain in source files.");

for (const file of sourceFiles) {
  if (file.endsWith(path.join("components", "StoreBadges.astro"))) continue;
  const text = await readFile(file, "utf8");
  if (/app-store-badge|google-play-badge/.test(text)) {
    errors.push(`Raw store badge markup remains outside StoreBadges.astro: ${path.relative(root, file)}`);
  }
}

const designSystem = await readFile(path.join(stylesDir, "design-system.css"), "utf8");
if (!designSystem.includes("--font-sans:")) errors.push("The shared font stack token --font-sans is missing.");
if (!designSystem.includes(".heading-group")) errors.push("The shared heading-group spacing primitive is missing.");

const summary = {
  styleFiles: styleFiles.map((file) => path.relative(root, file)),
  rules: rules.length,
  classes: cssClasses.size,
  errors: errors.length,
  warnings: warnings.length,
};
console.log(JSON.stringify(summary, null, 2));
for (const warning of warnings) console.warn(`WARN: ${warning}`);
for (const error of errors) console.error(`ERROR: ${error}`);
if (errors.length) process.exit(1);
