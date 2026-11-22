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
