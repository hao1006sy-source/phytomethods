import fs from 'node:fs';
import path from 'node:path';
import topics from '../src/data/topic-metadata.json' with { type: 'json' };

const root = process.cwd();
const failures = [];
const rows = [];
const groups = new Map();
const decodeHtml = (text) => text.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
for (const topic of topics) {
  if (topic.status === 'published') {
    const group = groups.get(topic.domainId) ?? [];
    group.push(topic);
    groups.set(topic.domainId, group);
  }
}

for (const topic of topics.filter((item) => item.status === 'published')) {
  const relativePath = path.join('dist', 'topics', topic.domainId, topic.id, 'index.html');
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) {
    failures.push(`${topic.id}: missing ${relativePath}`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const markdown = fs.readFileSync(path.join(root, 'src', 'content', 'topics', `${topic.id}.md`), 'utf8');
  const markdownTitle = markdown.match(/^title:\s*(.+?)\s*$/m)?.[1] ?? '';
  const heading = decodeHtml(html.match(/class="article-heading"[\s\S]*?<h1>([^<]*)<\/h1>/)?.[1] ?? '');
  const english = decodeHtml(html.match(/class="article-heading"[\s\S]*?<span>([^<]*)<\/span>/)?.[1] ?? '');
  const left = html.match(/class="article-left"[\s\S]*?<nav[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
  const leftHrefs = [...left.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  const currentCount = (left.match(/aria-current="page"/g) ?? []).length;
  const toc = html.match(/class="article-toc"[\s\S]*?<h2>本页内容<\/h2>([\s\S]*?)<\/nav>/)?.[1] ?? '';
  const tocHrefs = [...toc.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
  const content = html.match(/<article class="article-content prose">([\s\S]*?)<\/article>/)?.[1] ?? '';
  const headingIds = [...content.matchAll(/<h[23][^>]*id="([^"]+)"/g)].map((match) => match[1]);
  const navTargets = [...new Set(leftHrefs.map((href) => href.split('/').filter(Boolean).at(-1)))];
  const expectedNav = [...(groups.get(topic.domainId) ?? [])].sort((a, b) => a.order - b.order).map((item) => item.id);
  const expectedPrefix = `topics/${topic.domainId}/`;
  const navValid = leftHrefs.length === 7 && leftHrefs.every((href) => href.includes(expectedPrefix)) && JSON.stringify(navTargets) === JSON.stringify(expectedNav);
  const tocValid = tocHrefs.length > 0 && tocHrefs.every((id) => headingIds.includes(id));
  const sequenceFigure = html.includes('class="read-length-figure"');
  const sequenceFigureValid = sequenceFigure === (topic.id === 'sequencing-data');
  const row = {
    id: topic.id,
    route: `/phytomethods/topics/${topic.domainId}/${topic.id}/`,
    title: markdownTitle,
    englishTitle: topic.englishTitle,
    domainId: topic.domainId,
    order: topic.order,
    layout: html.includes('class="topic-v2"'),
    h1Matches: heading === markdownTitle,
    englishMatches: english === topic.englishTitle,
    sidebarCount: leftHrefs.length,
    currentTopicCount: currentCount,
    topicNavigationValid: navValid,
    tocCount: tocHrefs.length,
    tocTargetsValid: tocValid,
    markdownHeadingCount: headingIds.length,
    sequencingFigureOnlyOnSequencingTopic: sequenceFigureValid,
    figureComponents: ['data-assembly-graph-demo','data-single-cell','data-trajectory','data-coexpression','data-gwas','data-sample','data-read'].filter((selector) => html.includes(selector))
  };
  rows.push(row);
  const visibleSidebarTitles = [...left.matchAll(/<span>\d{2}<\/span>([^<]*)<\/a>/g)].map((match) => decodeHtml(match[1]));
  row.sidebarTitlesMatchMarkdown = expectedNav.every((id,index) => {
    const source=fs.readFileSync(path.join(root,'src','content','topics',`${id}.md`),'utf8');
    return visibleSidebarTitles[index] === (source.match(/^title:\s*(.+?)\s*$/m)?.[1] ?? '');
  });
  for (const [key, valid] of Object.entries({ layout: row.layout, title: row.h1Matches, english: row.englishMatches, currentTopic: currentCount === 1, topicNavigation: navValid && row.sidebarTitlesMatchMarkdown, toc: tocValid, sequencingFigure: sequenceFigureValid })) {
    if (!valid) failures.push(`${topic.id}: ${key} failed`);
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  totalPublishedTopics: rows.length,
  domainCounts: Object.fromEntries([...groups.entries()].map(([domain, items]) => [domain, items.length])),
  pass: failures.length === 0,
  failures,
  topics: rows
};
const outputDir = path.join(root, 'outputs', 'topic-v2-full-rollout');
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'topic-acceptance.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Checked ${rows.length}/${topics.filter((topic) => topic.status === 'published').length} published topic pages.`);
console.log(`Failures: ${failures.length}`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
