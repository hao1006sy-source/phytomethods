import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const configPath = join(root, 'src/data/home-curation.json');
const methodsPath = join(root, 'src/content/methods');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const errors = [];

if (!Array.isArray(config.featuredMethodIds) || config.featuredMethodIds.length < 3 || config.featuredMethodIds.length > 5) {
  errors.push('featuredMethodIds must contain 3–5 method IDs.');
}

if (!Array.isArray(config.popularQueries) || config.popularQueries.length !== 6 || config.popularQueries.some((term) => typeof term !== 'string' || !term.trim())) {
  errors.push('popularQueries must contain six non-empty search terms.');
}

const ids = config.featuredMethodIds ?? [];
if (new Set(ids).size !== ids.length) errors.push('featuredMethodIds contains duplicate IDs.');

for (const id of ids) {
  if (typeof id !== 'string' || !/^[a-z0-9-]+$/.test(id)) {
    errors.push(`Invalid featured method ID: ${String(id)}`);
    continue;
  }

  const path = join(methodsPath, `${id}.md`);
  if (!existsSync(path)) {
    errors.push(`Featured method "${id}" has no content file (${path}).`);
    continue;
  }

  const source = readFileSync(path, 'utf8');
  const frontmatter = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) {
    errors.push(`Featured method "${id}" has no valid frontmatter.`);
    continue;
  }

  const status = frontmatter[1].match(/^status:\s*["']?([a-z]+)["']?\s*$/m)?.[1] ?? 'published';
  if (status !== 'published') errors.push(`Featured method "${id}" is "${status}", expected published.`);
}

if (errors.length) {
  console.error('Home curation validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Home curation validated: ${ids.length} published method IDs, ${config.popularQueries.length} search terms.`);
}

// Domain order in Frontmatter is authoritative; never select by global domain order.
const domainSource = readFileSync(join(root, 'src/data/domains.ts'), 'utf8');
const domainMap = new Map([...domainSource.matchAll(/\['(M\d+)','([^']+)'/g)].map(m => [m[2], m[1]]));
for (const id of ids) {
  const text = readFileSync(join(methodsPath, `${id}.md`), 'utf8');
  const primary = text.match(/^domainIds:\s*\[\s*["']?([^,"'\]\s]+)/m)?.[1];
  if (!domainMap.has(primary)) throw new Error(`${id}: invalid primary domain ${primary}`);
  if (id === 'orthofinder' && domainMap.get(primary) !== 'M04') throw new Error('OrthoFinder must display M04');
}
const home = readFileSync(join(root, 'src/pages/index.astro'), 'utf8');
if (!home.includes('item[1] === method.data.domainIds[0]')) throw new Error('Homepage must use the first domain');
// YAML date-only values are UTC midnight. Keep their calendar date, independent of runner TZ.
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
for (const collection of ['methods','papers','tutorials','topics']) {
  for (const file of (await import('node:fs')).readdirSync(join(root,'src/content',collection)).filter(f=>f.endsWith('.md'))) {
    const text=readFileSync(join(root,'src/content',collection,file),'utf8');
    if (/^status: draft$/m.test(text)) continue;
    const raw=text.match(/^updatedAt:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
    if (!raw || !Number.isFinite(Date.parse(raw)) || new Date(raw).toISOString().slice(0,10)!==raw) throw new Error(`${collection}/${file}: invalid updatedAt`);
    if (raw>today) throw new Error(`${collection}/${file}: future date in Asia/Shanghai`);
  }
}
console.log(`Homepage primary domains and calendar dates validated; today=${today}, timezone=Asia/Shanghai`);
