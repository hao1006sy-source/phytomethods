import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const root = process.cwd();
const base = process.env.PHYTOMETHODS_PREVIEW_BASE ?? 'http://127.0.0.1:4323/phytomethods';
const output = path.join(root, 'outputs', 'method-v3-full-rollout');
const desktopDir = path.join(output, 'screenshots', 'desktop');
const mobileDir = path.join(output, 'screenshots', 'mobile');
const overviewDir = path.join(output, 'screenshots', 'overview');
for (const dir of [desktopDir, mobileDir, overviewDir, path.join(output, 'screenshots', 'figures')]) fs.mkdirSync(dir, { recursive: true });

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(match, 'Markdown frontmatter exists');
  const fields = Object.fromEntries([...match[1].matchAll(/^([\w-]+):\s*(.*?)\s*$/gm)].map(m => [m[1], m[2].replace(/^['"]|['"]$/g, '')]));
  const array = value => value?.startsWith('[') ? value.slice(1, -1).split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean) : [];
  return { fields, body: source.slice(match[0].length).trim(), array };
}

function sourceHeadings(source) {
  const lines = source.split(/\r?\n/);
  const headings = [];
  let fence;
  for (const line of lines) {
    const open = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (open) {
      if (!fence) fence = { marker: open[1][0], size: open[1].length };
      else if (open[1][0] === fence.marker && open[1].length >= fence.size) fence = undefined;
    }
    const h = !fence && line.match(/^ {0,3}##\s+(.+?)\s*#*\s*$/);
    if (h) headings.push(h[1].trim());
  }
  return headings;
}
function sourceSections(source) {
  const lines = source.split(/\r?\n/);
  const sections = [];
  let current;
  let fence;
  for (const line of lines) {
    const open = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (open) {
      if (!fence) fence = { marker: open[1][0], size: open[1].length };
      else if (open[1][0] === fence.marker && open[1].length >= fence.size) fence = undefined;
    }
    const heading = !fence && line.match(/^ {0,3}##\s+(.+?)\s*#*\s*$/);
    if (heading) {
      current = { heading: heading[1].trim(), markdown: '' };
      sections.push(current);
      continue;
    }
    if (!current) {
      if (!line.trim() && !sections.length) continue;
      current = { heading: '工具简介', markdown: '' };
      sections.push(current);
    }
    current.markdown += `${current.markdown ? '\n' : ''}${line}`;
  }
  return sections.map(section => ({ ...section, markdown: section.markdown.trim() }));
}
function normalizeText(text) { return text.replace(/\s+/g, ' ').trim(); }

const methodFiles = fs.readdirSync(path.join(root, 'src/content/methods')).filter(file => file.endsWith('.md')).sort();
const paperFiles = new Map(fs.readdirSync(path.join(root, 'src/content/papers')).filter(file => file.endsWith('.md')).map(file => {
  const parsed = parseFrontmatter(fs.readFileSync(path.join(root, 'src/content/papers', file), 'utf8'));
  return [file.slice(0, -3), parsed];
}));
const tutorialFiles = new Map(fs.readdirSync(path.join(root, 'src/content/tutorials')).filter(file => file.endsWith('.md')).map(file => {
  const parsed = parseFrontmatter(fs.readFileSync(path.join(root, 'src/content/tutorials', file), 'utf8'));
  return [parsed.fields.method, { id: file.slice(0, -3), ...parsed }];
}));
const metadata = JSON.parse(fs.readFileSync(path.join(root, 'src/data/topic-metadata.json'), 'utf8'));
const domainLabels = new Map([...fs.readFileSync(path.join(root, 'src/data/domains.ts'), 'utf8').matchAll(/\['(M\d+)','[^']+','([^']+)'/g)].map(match => [match[1], match[2]]));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const markdownProcessor = await createMarkdownProcessor({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(String(error)));
const records = [];

function tally(values) { return values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map()); }
function equalTallies(actual, expected, message) { assert.deepEqual([...tally(actual)].sort(), [...tally(expected)].sort(), message); }

try {
  assert.equal(methodFiles.length, 58, `expected 58 method Markdown files, found ${methodFiles.length}`);
  for (const filename of methodFiles) {
    const id = filename.slice(0, -3);
    const { fields, body, array } = parseFrontmatter(fs.readFileSync(path.join(root, 'src/content/methods', filename), 'utf8'));
    const domainIds = array(fields.domainIds);
    const expectedHeadings = sourceHeadings(body);
    await page.setViewportSize({ width: 1600, height: 900 });
    const response = await page.goto(`${base}/methods/${id}/`, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200, `${id} route`);
    assert.equal(await page.locator('.method-v3').count(), 1, `${id} V3 root`);
    if (id !== 'hifiasm') assert.equal(await page.locator('.method-v3').getAttribute('data-method-id'), id, `${id} identity`);
    assert.equal((await page.locator('h1').first().innerText()).trim(), fields.name, `${id} title`);
    const actualHeadings = await page.locator('[data-source-heading]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-source-heading')));
    equalTallies(actualHeadings, expectedHeadings, `${id} complete original H2 heading set`);
    const actualSourceBlocks = await page.locator('[data-source-heading]').evaluateAll(nodes => nodes.map(node => {
      const content = node.matches('.method-source') ? node : node.querySelector('.method-source');
      const clone = content?.cloneNode(true);
      clone?.querySelectorAll('.code-toolbar,button').forEach(button => button.remove());
      return { heading: node.getAttribute('data-source-heading'), text: clone?.textContent ?? '' };
    }));
    const expectedSourceBlocks = sourceSections(body);
    equalTallies(actualHeadings, expectedSourceBlocks.map(section => section.heading), `${id} Markdown section mapping`);
    const remaining = [...actualSourceBlocks];
    for (const block of expectedSourceBlocks) {
      const position = remaining.findIndex(actual => actual.heading === block.heading);
      assert.notEqual(position, -1, `${id} original source block ${block.heading}`);
      const [actual] = remaining.splice(position, 1);
      const expectedHtml = (await markdownProcessor.render(block.markdown)).code;
      const expectedText = await page.evaluate(html => { const node = document.createElement('div'); node.innerHTML = html; return node.textContent ?? ''; }, expectedHtml);
      assert.equal(normalizeText(actual.text), normalizeText(expectedText), `${id} source body preserved: ${block.heading}`);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${id} desktop page overflow`);
    for (const link of await page.locator('.method-sidebar nav a').all()) {
      const href = await link.getAttribute('href');
      assert.ok(href?.startsWith('#method-'), `${id} TOC target format`);
      assert.equal(await page.locator(href).count(), 1, `${id} valid TOC anchor ${href}`);
    }
    assert.equal(await page.locator('.method-tags a').count(), domainIds.length, `${id} real domain tags`);
    const expectedTopics = metadata.filter(topic => topic.status === 'published' && topic.methodIds.includes(id));
    for (const topic of expectedTopics) assert.ok(await page.locator(`.method-resources a[href="/phytomethods/topics/${topic.domainId}/${topic.id}/"]`).count(), `${id} topic relation ${topic.id}`);
    if (id !== 'hifiasm') {
      assert.equal(await page.locator('.method-principle-figure,.method-io-table,.method-command').count(), 0, `${id} has no injected Hifiasm-only content`);
    }
    const methodPaperId = fields.paper;
    if (paperFiles.has(methodPaperId) && paperFiles.get(methodPaperId).fields.status !== 'draft') {
      assert.ok(await page.locator(`a[href="/phytomethods/papers/${methodPaperId}/"]`).count(), `${id} method paper relation`);
    }
    const expectedTutorial = tutorialFiles.get(id);
    if (expectedTutorial && expectedTutorial.fields.status !== 'draft') {
      assert.ok(await page.locator(`a[href="/phytomethods/tutorials/${expectedTutorial.id}/"]`).count(), `${id} tutorial relation`);
      const tested = expectedTutorial.fields.tested;
      const expectedStatus = tested === 'verified' ? '已用示例数据运行验证' : tested === 'template' ? '命令已核对，真实数据待验证' : '尚未运行验证';
      assert.ok((await page.locator('.method-resources').innerText()).includes(expectedStatus), `${id} tutorial validation status`);
    }
    const expectedApplications = [...paperFiles].filter(([, paper]) => paper.fields.type === 'application' && paper.array(paper.fields.methodIds).includes(id) && paper.fields.status !== 'draft');
    if (id === 'hifiasm') assert.equal(await page.locator('.method-resources h2').filter({ hasText: '植物研究案例' }).count(), 1, 'Hifiasm accepted V3 sample remains unchanged');
    else assert.equal(await page.locator('.method-resources .method-application-entry').count(), expectedApplications.length, `${id} application links reflect collection relationships`);
    const localHrefs = await page.locator('.method-v3 a[href^="/phytomethods/"]').evaluateAll(nodes => [...new Set(nodes.map(node => node.getAttribute('href')))]);
    const anchorIds = await page.locator('.method-v3 [id]').evaluateAll(nodes => nodes.map(node => node.id));
    assert.equal(new Set(anchorIds).size, anchorIds.length, `${id} unique anchor IDs`);
    const desktopPath = path.join(desktopDir, `${domainIds[0] ?? 'M00'}-${id}.png`);
    await page.screenshot({ path: desktopPath });
    records.push({ id, name: fields.name, domainIds, sourceH2: expectedHeadings.length, renderedSourceH2: actualHeadings.length, markdownBlocksCompared: expectedSourceBlocks.length, sections: await page.locator('.method-original-section').count(), methodPaper: methodPaperId, applications: expectedApplications.map(([paperId]) => paperId), tutorial: expectedTutorial?.id ?? null, tutorialStatus: expectedTutorial?.fields.tested ?? null, localLinks: localHrefs.length, desktopScreenshot: path.relative(output, desktopPath), desktopOverflow: false, anchorIds: anchorIds.length, browserErrors: [] });
  }

  const viewportChecks = [];
  const representatives = ['verkko','merqury','edta','pggb','orthofinder','iqtree2','admixture','gapit','bismark','scanpy','wgcna','agront'];
  for (const id of representatives) {
    for (const [width, height] of [[1600,900],[1440,900],[1280,800],[1024,768],[768,1024],[390,844],[375,812]]) {
      await page.setViewportSize({ width, height });
      await page.goto(`${base}/methods/${id}/`, { waitUntil: 'domcontentloaded' });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${id} overflow at ${width}`);
      viewportChecks.push({ id, width, height, overflow: false });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/methods/${id}/`, { waitUntil: 'domcontentloaded' });
    const domainId = records.find(record => record.id === id).domainIds[0] ?? 'M00';
    await page.screenshot({ path: path.join(mobileDir, `${domainId}-${id}-390.png`), fullPage: true });
  }

  for (const id of ['hifiasm','verkko','merqury']) {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(`${base}/methods/${id}/`, { waitUntil: 'domcontentloaded' });
    if (id === 'hifiasm') assert.ok(await page.locator('.method-principle-figure svg').count());
    else if (id === 'verkko') assert.ok(await page.locator('.diagram svg').count());
    else assert.ok(await page.locator('.diagram svg,.scientific svg').count() >= 2);
    const figure = page.locator('figure').first();
    await figure.locator('button[aria-haspopup="dialog"]').click();
    await page.waitForSelector('dialog[open]');
    assert.ok(await page.locator('dialog[open] svg').count());
    await page.getByRole('button', { name: '关闭放大图解' }).click();
    await page.waitForFunction(() => document.querySelectorAll('dialog').length === 0);
    await page.screenshot({ path: path.join(output, 'screenshots', 'figures', `${id}-图解放大交互.png`), fullPage: false });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/methods/gapit/`, { waitUntil: 'domcontentloaded' });
  const nav = page.locator('.method-sidebar details');
  await nav.locator('summary').click();
  const firstLink = nav.locator('nav a').first();
  const firstHref = await firstLink.getAttribute('href');
  await firstLink.click();
  assert.equal(await page.locator(firstHref).count(), 1, 'mobile TOC opens valid target');
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(`${base}/methods/hifiasm/`, { waitUntil: 'domcontentloaded' });
  const copyButton = page.locator('.method-command .code-toolbar button').first();
  assert.equal(await copyButton.count(), 1, 'Hifiasm source command exposes the shared copy control');
  await page.context().grantPermissions(['clipboard-read','clipboard-write']);
  await copyButton.click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'hifiasm -o sample -t 32 reads.fq.gz', 'code copy preserves exact command text');
  assert.deepEqual(errors, [], 'no browser pageerror');

  const domainOverview = Object.groupBy(records, record => record.domainIds[0] ?? 'M00');
  const machine = {
    total: records.length,
    methods: records,
    viewportChecks,
    domains: Object.entries(domainOverview).map(([domainId, items]) => ({ domainId, label: domainLabels.get(domainId) ?? domainId, count: items.length, methods: items.map(item => item.id) })),
    markdownBlocksCompared: records.reduce((sum, record) => sum + record.markdownBlocksCompared, 0),
    interactionChecks: ['V3 applied to all 58 routes','all original Markdown section headings and rendered body text retained','all side-navigation targets resolve','mobile navigation reaches section','Hifiasm/Verkko/Merqury original figures present and zoom dialog opens','Hifiasm example command copies exactly','no Hifiasm-only panels injected in other tool pages','method paper, application paper, topic and tutorial records match collection relationships','tutorial validation labels match source data','no page-level horizontal overflow','no pageerror'],
    pageErrors: errors,
  };
  fs.writeFileSync(path.join(output, 'browser-acceptance.json'), JSON.stringify(machine, null, 2), 'utf8');
  fs.writeFileSync(path.join(output, 'method-v3-coverage.csv'), ['id,name,domainIds,sourceH2,renderedSourceH2,methodPaper,applications,tutorial,tutorialStatus,localLinks,desktopScreenshot', ...records.map(r => [r.id, JSON.stringify(r.name), JSON.stringify(r.domainIds.join(';')), r.sourceH2, r.renderedSourceH2, r.methodPaper, JSON.stringify(r.applications.join(';')), r.tutorial ?? '', r.tutorialStatus ?? '', r.localLinks, r.desktopScreenshot].join(','))].join('\n'), 'utf8');
  console.log(JSON.stringify({ total: records.length, representatives: representatives.length, viewportChecks: viewportChecks.length, pageErrors: errors.length, output }, null, 2));
} finally {
  await browser.close();
}
