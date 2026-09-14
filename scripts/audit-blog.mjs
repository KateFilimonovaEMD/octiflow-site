import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blogDir = path.join(root, 'src/content/blog');
const publicDir = path.join(root, 'public');
const files = fs.readdirSync(blogDir).filter((name) => name.endsWith('.md')).sort();

const allowedTopics = new Set([
  'Hydration Basics',
  'Habits & Tracking',
  'Health & Safety',
  'Exercise & Environment',
  'Sleep & Wellness',
]);

const firstPartyDomains = new Set(['octiflow.app', 'apps.apple.com']);
const evidenceDomains = new Set([
  'pubmed.ncbi.nlm.nih.gov',
  'pmc.ncbi.nlm.nih.gov',
  'nhs.uk',
  'www.nhs.uk',
  'medlineplus.gov',
  'www.medlineplus.gov',
  'www.mayoclinic.org',
  'mayoclinic.org',
  'www.niddk.nih.gov',
  'niddk.nih.gov',
  'www.who.int',
  'who.int',
  'iris.who.int',
  'www.cdc.gov',
  'cdc.gov',
  'stacks.cdc.gov',
  'nap.nationalacademies.org',
  'www.nationalacademies.org',
  'nationalacademies.org',
  'www.efsa.europa.eu',
  'efsa.europa.eu',
  'efsa.onlinelibrary.wiley.com',
  'health.clevelandclinic.org',
  'www.aad.org',
  'aad.org',
  'doi.org',
  'www.fda.gov',
  'fda.gov',
  'ods.od.nih.gov',
  'www.acog.org',
  'acog.org',
]);

const failures = [];
const warnings = [];
const posts = [];

function fail(file, message) {
  failures.push(`${file}: ${message}`);
}
function warn(file, message) {
  warnings.push(`${file}: ${message}`);
}
function stripQuotes(value) {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}
function scalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  return match ? stripQuotes(match[1]) : undefined;
}
function list(frontmatter, key) {
  const lines = frontmatter.split(/\r?\n/);
  const index = lines.findIndex((line) => new RegExp(`^${key}:\\s*$`).test(line));
  if (index === -1) return [];
  const values = [];
  for (let i = index + 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^\s+-\s+(.*)$/);
    if (!match) break;
    values.push(stripQuotes(match[1]));
  }
  return values;
}
function dateValue(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

for (const name of files) {
  const full = path.join(blogDir, name);
  const raw = fs.readFileSync(full, 'utf8');
  const parts = raw.split(/^---\s*$/m);
  if (parts.length < 3) {
    fail(name, 'missing valid YAML frontmatter block');
    continue;
  }
  const frontmatter = parts[1];
  const body = parts.slice(2).join('---').trim();
  const slug = name.replace(/\.md$/, '');
  const draft = scalar(frontmatter, 'draft') === 'true';
  const title = scalar(frontmatter, 'title');
  const seoTitle = scalar(frontmatter, 'seoTitle');
  const description = scalar(frontmatter, 'description');
  const category = scalar(frontmatter, 'category');
  const publishDate = scalar(frontmatter, 'publishDate');
  const updatedDate = scalar(frontmatter, 'updatedDate');
  const featured = scalar(frontmatter, 'featured') === 'true';
  const tags = list(frontmatter, 'tags');
  const related = list(frontmatter, 'related');
  const imageFields = ['image', 'imageAvif', 'imageWebp', 'socialImage'];

  posts.push({ name, slug, draft, title, category, featured, related });

  if (draft) continue;

  if (!title) fail(name, 'missing title');
  if (!description) fail(name, 'missing description');
  if (!category || !allowedTopics.has(category)) fail(name, `category must be one of the five editorial topics; got "${category ?? ''}"`);
  if (!publishDate || !dateValue(publishDate)) fail(name, 'missing or invalid publishDate');
  if (updatedDate && !dateValue(updatedDate)) fail(name, 'invalid updatedDate');
  if (updatedDate && dateValue(updatedDate) < dateValue(publishDate)) fail(name, 'updatedDate is earlier than publishDate');
  if ((seoTitle ?? title ?? '').length > 70) warn(name, `SEO title is ${String(seoTitle ?? title).length} characters`);
  if (description && (description.length < 50 || description.length > 160)) warn(name, `description is ${description.length} characters (target 50-160)`);
  if (tags.length !== new Set(tags).size) fail(name, 'duplicate tags in frontmatter');
  if (related.length !== new Set(related).size) fail(name, 'duplicate related article IDs');
  if (related.includes(slug)) fail(name, 'related list contains itself');
  if (/^#\s+/m.test(body)) fail(name, 'article body contains an H1; the layout already renders the H1');
  if (!/^## Sources and further reading\s*$/m.test(body)) fail(name, 'missing "## Sources and further reading" section');
  if (/[—–]/.test(body) || /[—–]/.test(frontmatter)) fail(name, 'contains an em dash or en dash');

  for (const field of imageFields) {
    const value = scalar(frontmatter, field);
    if (!value) continue;
    const rel = value.replace(/^\//, '');
    const asset = path.join(publicDir, rel);
    if (!fs.existsSync(asset)) fail(name, `${field} points to missing asset ${value}`);
  }

  const sourceSection = body.match(/## Sources and further reading\s*([\s\S]*)$/m)?.[1] ?? '';
  const urls = [...sourceSection.matchAll(/https?:\/\/[^)\s>]+/g)].map((m) => m[0].replace(/[.,;:]$/, ''));
  const evidenceUrls = urls.filter((url) => {
    try { return !firstPartyDomains.has(new URL(url).hostname); } catch { return false; }
  });
  if (evidenceUrls.length < 3) warn(name, `only ${evidenceUrls.length} external references in Sources section`);
  for (const url of evidenceUrls) {
    try {
      const hostname = new URL(url).hostname;
      if (!evidenceDomains.has(hostname)) warn(name, `review unrecognized evidence domain: ${hostname}`);
    } catch {
      fail(name, `invalid source URL: ${url}`);
    }
  }
}

const published = posts.filter((post) => !post.draft);
const bySlug = new Map(published.map((post) => [post.slug, post]));
const featuredPosts = published.filter((post) => post.featured);
if (featuredPosts.length !== 1) fail('blog', `expected exactly one featured article, found ${featuredPosts.length}`);

for (const post of published) {
  for (const target of post.related) {
    if (!bySlug.has(target)) fail(post.name, `related article does not exist or is draft: ${target}`);
  }

  const raw = fs.readFileSync(path.join(blogDir, post.name), 'utf8');
  for (const match of raw.matchAll(/\]\(\/blog\/([^/#?)]+)\/?(?:#[^)]+)?\)/g)) {
    const target = match[1];
    if (!bySlug.has(target)) fail(post.name, `internal blog link points to missing article: ${target}`);
  }
}

const categoryCounts = new Map();
for (const post of published) categoryCounts.set(post.category, (categoryCounts.get(post.category) ?? 0) + 1);
for (const topic of allowedTopics) {
  if (!categoryCounts.get(topic)) fail('blog', `editorial topic has no published articles: ${topic}`);
}

console.log(`Blog audit: ${published.length} published articles, ${posts.length - published.length} draft file(s).`);
console.log('Topic counts:');
for (const topic of allowedTopics) console.log(`  ${topic}: ${categoryCounts.get(topic) ?? 0}`);

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const item of warnings) console.log(`  - ${item}`);
}

if (failures.length) {
  console.error(`\nFailures (${failures.length}):`);
  for (const item of failures) console.error(`  - ${item}`);
  process.exit(1);
}

console.log('\nBlog audit passed.');
