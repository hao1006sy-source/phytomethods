import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const configs = JSON.parse(fs.readFileSync(path.join(root, 'src/data/domain-v2-m02-m09.json'), 'utf8'));
const domainSource = fs.readFileSync(path.join(root, 'src/data/domains.ts'), 'utf8');
const domains = [...domainSource.matchAll(/\['(M\d{2})','([^']+)'/g)].map(([, id, slug]) => ({ id, slug }));
const metadata = JSON.parse(fs.readFileSync(path.join(root, 'src/data/topic-metadata.json'), 'utf8'));
const topicFiles = new Set(fs.readdirSync(path.join(root, 'src/content/topics'), { recursive: true }).filter((file) => String(file).endsWith('.md')).map((file) => path.basename(String(file), '.md')));
const methodFiles = new Set(fs.readdirSync(path.join(root, 'src/content/methods'), { recursive: true }).filter((file) => String(file).endsWith('.md')).map((file) => path.basename(String(file), '.md')));
const svgFiles = new Set(fs.readdirSync(path.join(root, 'public/images/domain-v2')).filter((file) => file.endsWith('.svg')));
const errors = [];
const seen = new Set();

if (configs.length !== 8) errors.push(`Expected eight M02–M09 configurations, found ${configs.length}.`);
for (const config of configs) {
  if (seen.has(config.id)) errors.push(`Duplicate domain config: ${config.id}`);
  seen.add(config.id);
  const domain = domains.find((item) => item.id === config.id);
  if (!domain) { errors.push(`Unknown domain ID: ${config.id}`); continue; }
  const topicSet = metadata.filter((item) => item.domainId === domain.slug && item.status === 'published');
  if (topicSet.length !== 7) errors.push(`${config.id}: expected seven published topic records, found ${topicSet.length}.`);
  for (const topic of topicSet) if (!topicFiles.has(topic.id)) errors.push(`${config.id}: missing published topic content ${topic.id}.`);
  if (config.methodIds.length !== 3) errors.push(`${config.id}: expected three curated method IDs.`);
  for (const methodId of config.methodIds) if (!methodFiles.has(methodId)) errors.push(`${config.id}: unknown method ID ${methodId}.`);
  for (const relatedId of config.relatedIds) if (!domains.some((item) => item.id === relatedId)) errors.push(`${config.id}: unknown related domain ${relatedId}.`);
  if (!svgFiles.has(`${config.id}.svg`)) errors.push(`${config.id}: missing domain SVG.`);
  else {
    const svg = fs.readFileSync(path.join(root, 'public/images/domain-v2', `${config.id}.svg`), 'utf8');
    if (!svg.includes('role="img"') || !svg.includes('<title') || !svg.includes('<desc')) errors.push(`${config.id}: SVG is missing accessible title/description metadata.`);
  }
}

const pageSource = fs.readFileSync(path.join(root, 'src/components/domain-v2/DomainPageV2.astro'), 'utf8');
for (const component of ['AnnotationOverview', 'AnnotationFigure', 'PangenomeOverview', 'PangenomeFigure']) {
  if (!pageSource.includes(component)) errors.push(`Legacy M02/M03 component not integrated: ${component}.`);
}

if (errors.length) {
  console.error(`Domain V2 validation failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('Domain V2 validated: 8 unique configs, 56 published topic records, 24 method references, related-domain IDs and eight accessible SVGs. M02/M03 legacy overviews and figures remain integrated.');
