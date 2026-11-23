import fs from 'node:fs';
import path from 'node:path';

const dir = 'src/content/papers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
console.log('Total paper files:', files.length);

const papers = [];
const typeCounts = { method: 0, application: 0, review: 0 };
const domainCounts = {};
const allHeadings = new Map();

for (const f of files) {
  const content = fs.readFileSync(path.join(dir, f), 'utf-8');
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) {
    console.error('No frontmatter in', f);
    continue;
  }
  const fmStr = fmMatch[1];
  const paper = { id: f.replace('.md', '') };
  for (const line of fmStr.split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (m) {
      const key = m[1].trim();
      let val = m[2].trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      } else if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      paper[key] = val;
    }
  }
  papers.push(paper);
  const type = paper.type || 'unknown';
  typeCounts[type] = (typeCounts[type] || 0) + 1;

  const domains = Array.isArray(paper.domainIds) ? paper.domainIds : (paper.domainIds ? [paper.domainIds] : []);
  for (const d of domains) {
    domainCounts[d] = (domainCounts[d] || 0) + 1;
  }

  // extract markdown ## headings
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---/, '');
  const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map(m => m[1].trim());
  paper.headings = headings;
  for (const h of headings) {
    allHeadings.set(h, (allHeadings.get(h) || 0) + 1);
  }
}

console.log('Type counts:', JSON.stringify(typeCounts, null, 2));
console.log('Domain counts:', JSON.stringify(domainCounts, null, 2));
console.log('Top headings:');
for (const [h, c] of [...allHeadings.entries()].sort((a,b)=>b[1]-a[1]).slice(0, 20)) {
  console.log(`  ${h}: ${c}`);
}

fs.writeFileSync('outputs/papers-scan.json', JSON.stringify(papers, null, 2));
console.log('Wrote outputs/papers-scan.json');
