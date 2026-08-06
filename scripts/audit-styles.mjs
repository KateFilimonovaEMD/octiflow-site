import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const srcDir = join(root, "src");
const stylesDir = join(srcDir, "styles");
const entryFile = join(stylesDir, "site.css");

const walk = (directory) =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const sourceFiles = walk(srcDir).filter((path) =>
  [".astro", ".js", ".ts", ".md"].includes(extname(path)),
);
const cssFiles = walk(stylesDir).filter((path) => extname(path) === ".css");

const source = sourceFiles.map((path) => readFileSync(path, "utf8")).join("\n");
const classReferences = new Set();

for (const match of source.matchAll(/class(?:Name)?\s*=\s*["']([^"']+)["']/g)) {
  for (const token of match[1].split(/\s+/)) {
    if (/^[A-Za-z_][\w-]*$/.test(token)) classReferences.add(token);
  }
}

for (const match of source.matchAll(/["']([A-Za-z_][\w-]*)["']/g)) {
  classReferences.add(match[1]);
}

const definedClasses = new Map();
const errors = [];

for (const file of cssFiles) {
  const css = readFileSync(file, "utf8");
  let depth = 0;
  for (const character of css) {
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth < 0) break;
  }
  if (depth !== 0) {
    errors.push(`${relative(root, file)} has unbalanced braces (${depth}).`);
  }

  for (const match of css.matchAll(/\.([A-Za-z_][\w-]*)/g)) {
    const name = match[1];
    const locations = definedClasses.get(name) ?? [];
    locations.push(relative(root, file));
    definedClasses.set(name, locations);
  }

}

const entryCss = readFileSync(entryFile, "utf8");
const importedFiles = new Set(
  [...entryCss.matchAll(/@import\s+["'](.+?)["'];/g)].map((match) =>
    resolve(stylesDir, match[1]),
  ),
);

for (const imported of importedFiles) {
  if (!cssFiles.includes(imported)) {
    errors.push(`Missing imported stylesheet: ${relative(root, imported)}`);
  }
}

const unimportedFiles = cssFiles
  .filter((file) => file !== entryFile && !importedFiles.has(file))
  .map((file) => relative(root, file));


const unusedClasses = [...definedClasses.keys()]
  .filter((name) => name !== "css" && !classReferences.has(name))
  .sort();

console.log(`CSS files: ${cssFiles.length}`);
console.log(`Classes defined: ${definedClasses.size}`);
console.log(`Classes referenced in source: ${classReferences.size}`);
console.log(`Potentially unused classes: ${unusedClasses.length}`);
console.log(`Unimported stylesheets: ${unimportedFiles.length}`);

if (unusedClasses.length) {
  console.log("\nPotentially unused (review before deleting):");
  console.log(unusedClasses.join(", "));
}

if (unimportedFiles.length) {
  console.log("\nUnimported stylesheets:");
  console.log(unimportedFiles.join("\n"));
}

if (errors.length) {
  console.error("\nStyle audit errors:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
}
