import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const srcDir = join(root, "src");
const stylesDir = join(srcDir, "styles");
const entryFile = join(stylesDir, "site.css");

const walk = (directory) =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const normalize = (value) => value.replace(/\s+/g, " ").trim();
const stripComments = (value) => value.replace(/\/\*[\s\S]*?\*\//g, "");

const findClosingBrace = (css, openingIndex) => {
  let depth = 1;
  let quote = "";

  for (let index = openingIndex + 1; index < css.length; index += 1) {
    const character = css[index];

    if (quote) {
      if (character === "\\") index += 1;
      else if (character === quote) quote = "";
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth === 0) return index;
  }

  return -1;
};

const splitDeclarations = (body) => {
  const declarations = [];
  let start = 0;
  let quote = "";
  let parentheses = 0;

  const push = (end) => {
    const declaration = body.slice(start, end).trim();
    start = end + 1;
    if (!declaration || declaration.startsWith("@")) return;

    const colon = declaration.indexOf(":");
    if (colon < 1) return;

    const property = declaration.slice(0, colon).trim();
    const value = normalize(declaration.slice(colon + 1));
    declarations.push(`${property}:${value}`);
  };

  for (let index = 0; index < body.length; index += 1) {
    const character = body[index];

    if (quote) {
      if (character === "\\") index += 1;
      else if (character === quote) quote = "";
      continue;
    }

    if (character === '"' || character === "'") quote = character;
    else if (character === "(") parentheses += 1;
    else if (character === ")") parentheses = Math.max(0, parentheses - 1);
    else if (character === ";" && parentheses === 0) push(index);
  }

  push(body.length);
  return declarations;
};

const parseRules = (css, file, context = [], output = []) => {
  let cursor = 0;

  while (cursor < css.length) {
    const opening = css.indexOf("{", cursor);
    if (opening === -1) break;

    const rawHeader = css.slice(cursor, opening);
    const header = normalize(rawHeader.slice(rawHeader.lastIndexOf(";") + 1));
    const closing = findClosingBrace(css, opening);

    if (closing === -1) {
      throw new Error(`${relative(root, file)} has an unclosed CSS block.`);
    }

    const body = css.slice(opening + 1, closing);

    if (header.startsWith("@")) {
      const atRule = header.split(/\s+/, 1)[0].toLowerCase();
      const nestedRules = new Set([
        "@media",
        "@supports",
        "@container",
        "@layer",
        "@document",
      ]);

      if (nestedRules.has(atRule)) {
        parseRules(body, file, [...context, header], output);
      }
    } else if (header) {
      output.push({
        file,
        context: context.join(" > "),
        selector: header,
        declarations: splitDeclarations(body),
      });
    }

    cursor = closing + 1;
  }

  return output;
};

const importedStylesheets = [];
const importedSet = new Set();

const collectImports = (file) => {
  const absolute = resolve(file);
  if (importedSet.has(absolute)) return;

  importedSet.add(absolute);
  importedStylesheets.push(absolute);

  const css = readFileSync(absolute, "utf8");
  for (const match of css.matchAll(/@import\s+["'](.+?)["']\s*;/g)) {
    collectImports(resolve(dirname(absolute), match[1]));
  }
};

collectImports(entryFile);

const allStylesheets = walk(stylesDir).filter((path) => extname(path) === ".css");
const unimportedStylesheets = allStylesheets.filter(
  (file) => !importedSet.has(resolve(file)),
);

const rules = importedStylesheets.flatMap((file) =>
  parseRules(stripComments(readFileSync(file, "utf8")), file),
);

const definedClasses = new Map();
for (const rule of rules) {
  for (const match of rule.selector.matchAll(/\.([A-Za-z_][\w-]*)/g)) {
    const locations = definedClasses.get(match[1]) ?? new Set();
    locations.add(relative(root, rule.file));
    definedClasses.set(match[1], locations);
  }
}

const sourceFiles = walk(srcDir).filter((path) =>
  [".astro", ".js", ".ts", ".md"].includes(extname(path)),
);
const sourceByFile = new Map(
  sourceFiles.map((file) => [file, readFileSync(file, "utf8")]),
);
const combinedSource = [...sourceByFile.values()].join("\n");
const referencedClasses = new Set();
const explicitClassReferences = new Set();

for (const match of combinedSource.matchAll(
  /class(?:Name)?\s*=\s*["']([^"']+)["']/g,
)) {
  for (const token of match[1].split(/\s+/)) {
    if (/^[A-Za-z_][\w-]*$/.test(token)) {
      referencedClasses.add(token);
      explicitClassReferences.add(token);
    }
  }
}

for (const match of combinedSource.matchAll(/class:list\s*=\s*\{([\s\S]*?)\}/g)) {
  for (const tokenMatch of match[1].matchAll(/["']([A-Za-z_][\w-]*)["']/g)) {
    explicitClassReferences.add(tokenMatch[1]);
    referencedClasses.add(tokenMatch[1]);
  }
}

for (const match of combinedSource.matchAll(/["']([^"'\n]+)["']/g)) {
  for (const token of match[1].split(/\s+/)) {
    if (definedClasses.has(token)) referencedClasses.add(token);
  }
}

const unusedClasses = [...definedClasses.keys()]
  .filter((name) => !referencedClasses.has(name))
  .sort();
const undefinedExplicitClasses = [...explicitClassReferences]
  .filter((name) => !definedClasses.has(name))
  .sort();

const selectorLocations = new Map();
for (const rule of rules) {
  const key = `${rule.context}::${normalize(rule.selector)}`;
  const locations = selectorLocations.get(key) ?? [];
  locations.push(relative(root, rule.file));
  selectorLocations.set(key, locations);
}
const duplicateSelectors = [...selectorLocations.entries()].filter(
  ([, locations]) => locations.length > 1,
);

const declarationBlocks = new Map();
for (const rule of rules) {
  if (rule.declarations.length < 4) continue;
  const key = `${rule.context}::${[...rule.declarations].sort().join(";")}`;
  const occurrences = declarationBlocks.get(key) ?? [];
  occurrences.push(`${relative(root, rule.file)} → ${normalize(rule.selector)}`);
  declarationBlocks.set(key, occurrences);
}
const duplicateDeclarationBlocks = [...declarationBlocks.values()].filter(
  (occurrences) => occurrences.length > 1,
);

const customPropertyDefinitions = new Set();
const customPropertyUses = new Set();
for (const rule of rules) {
  for (const declaration of rule.declarations) {
    const colon = declaration.indexOf(":");
    const property = declaration.slice(0, colon);
    const value = declaration.slice(colon + 1);

    if (property.startsWith("--")) customPropertyDefinitions.add(property);
    for (const match of value.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)) {
      customPropertyUses.add(match[1]);
    }
  }
}
const unusedCustomProperties = [...customPropertyDefinitions]
  .filter((name) => !customPropertyUses.has(name))
  .sort();

const inlineStyles = [];
for (const [file, source] of sourceByFile) {
  if (extname(file) !== ".astro") continue;
  if (/<style\b|\sstyle\s*=/.test(source)) {
    inlineStyles.push(relative(root, file));
  }
}

const rawBadgeMarkup = [];
for (const [file, source] of sourceByFile) {
  if (file.endsWith("StoreBadges.astro")) continue;
  if (/app-store-badge|google-play-badge/.test(source)) {
    rawBadgeMarkup.push(relative(root, file));
  }
}

const forbiddenLegacyClasses = ["product-kicker", "product-button"];
const legacyReferences = forbiddenLegacyClasses.filter((name) =>
  referencedClasses.has(name) || definedClasses.has(name),
);

const errors = [];
if (unimportedStylesheets.length) {
  errors.push(
    `Unimported stylesheets:\n${unimportedStylesheets
      .map((file) => `  - ${relative(root, file)}`)
      .join("\n")}`,
  );
}
if (unusedClasses.length) {
  errors.push(`Unused classes: ${unusedClasses.join(", ")}`);
}
if (undefinedExplicitClasses.length) {
  errors.push(`Classes used without CSS definitions: ${undefinedExplicitClasses.join(", ")}`);
}
if (duplicateSelectors.length) {
  errors.push(
    `Duplicate selectors:\n${duplicateSelectors
      .map(([selector, locations]) => `  - ${selector}: ${locations.join(", ")}`)
      .join("\n")}`,
  );
}
if (duplicateDeclarationBlocks.length) {
  errors.push(
    `Repeated declaration blocks:\n${duplicateDeclarationBlocks
      .map((occurrences) => `  - ${occurrences.join(" | ")}`)
      .join("\n")}`,
  );
}
if (unusedCustomProperties.length) {
  errors.push(`Unused custom properties: ${unusedCustomProperties.join(", ")}`);
}
if (inlineStyles.length) {
  errors.push(`Inline styles found in: ${inlineStyles.join(", ")}`);
}
if (rawBadgeMarkup.length) {
  errors.push(`Raw store badge markup found in: ${rawBadgeMarkup.join(", ")}`);
}
if (legacyReferences.length) {
  errors.push(`Legacy class names remain: ${legacyReferences.join(", ")}`);
}

console.log(`Imported CSS files: ${importedStylesheets.length}`);
console.log(`CSS rules: ${rules.length}`);
console.log(`Classes defined: ${definedClasses.size}`);
console.log(`Classes referenced: ${referencedClasses.size}`);
console.log(`Unused classes: ${unusedClasses.length}`);
console.log(`Undefined explicit classes: ${undefinedExplicitClasses.length}`);
console.log(`Duplicate selectors: ${duplicateSelectors.length}`);
console.log(`Repeated declaration blocks: ${duplicateDeclarationBlocks.length}`);
console.log(`Unused custom properties: ${unusedCustomProperties.length}`);
console.log(`Inline style sources: ${inlineStyles.length}`);
console.log(`Unimported stylesheets: ${unimportedStylesheets.length}`);

if (errors.length) {
  console.error("\nStyle audit failed:\n");
  for (const error of errors) console.error(`${error}\n`);
  process.exitCode = 1;
} else {
  console.log("\nStyle audit passed.");
}
