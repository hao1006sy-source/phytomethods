import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import topicMetadata from '../src/data/topic-metadata.json' with { type: 'json' };

const baseUrl = process.env.TOPIC_V2_BASE_URL ?? 'http://127.0.0.1:4322/phytomethods/';
const output = path.join(process.cwd(), 'outputs', 'topic-v2-full-rollout', 'verified-v2');
const desktopRoot = path.join(output, 'screenshots', 'desktop');
const mobileRoot = path.join(output, 'screenshots', 'mobile');
const widths = [[1600, 900], [1440, 900], [1280, 800], [1024, 768], [768, 1024], [390, 844], [375, 812]];
const published = topicMetadata.filter((topic) => topic.status === 'published').sort((a, b) => a.domainId.localeCompare(b.domainId) || a.order - b.order);
const markdownTitle = (id) => fs.readFileSync(path.join(process.cwd(), 'src', 'content', 'topics', `${id}.md`), 'utf8').match(/^title:\s*(.+?)\s*$/m)?.[1] ?? '';
const domainCodes = { 'genome-assembly': 'M01', 'genome-annotation': 'M02', 'pangenomics-structural-variation': 'M03', 'comparative-genomics': 'M04', 'population-genetics': 'M05', 'gwas-breeding': 'M06', 'epigenomics-3d-genome': 'M07', 'single-cell-spatial-omics': 'M08', 'regulatory-genomics-ai': 'M09' };
const domainCode = (id) => domainCodes[id] ?? id;
const results = { baseUrl, generatedAt: new Date().toISOString(), viewportChecks: widths.map(([width, height]) => ({ width, height })), pages: [], interactions: [], errors: [] };

const executablePath = process.env.BROWSER_EXECUTABLE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser = await chromium.launch({ headless: true, executablePath, args: ['--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.setDefaultTimeout(8000);
page.on('pageerror', (error) => results.errors.push({ type: 'pageerror', message: error.message, url: page.url() }));
page.on('console', (message) => { if (message.type() === 'error') results.errors.push({ type: 'console', message: message.text(), url: page.url() }); });
page.on('requestfailed', (request) => { if (request.url().startsWith('http://127.0.0.1')) results.errors.push({ type: 'requestfailed', message: request.failure()?.errorText, url: request.url() }); });

for (const topic of published) {
  const route = `topics/${topic.domainId}/${topic.id}/`;
  const url = new URL(route, baseUrl).href;
  const title = markdownTitle(topic.id);
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.locator('.topic-v2').waitFor();
  await page.evaluate(() => document.fonts?.ready);
  const initial = await page.evaluate(() => {
    const left = document.querySelector('.article-left');
    const current = left?.querySelector('[aria-current="page"]');
    const tocLinks = [...document.querySelectorAll('.article-toc a')];
    const targetStatus = tocLinks.map((link) => ({ href: link.getAttribute('href'), exists: !!document.getElementById(decodeURIComponent(link.hash.slice(1))) }));
    return {
      h1: document.querySelector('.article-heading h1')?.textContent?.trim(),
      english: document.querySelector('.article-heading>div>span')?.textContent?.trim(),
      domain: document.querySelector('.article-badges b')?.textContent?.trim(),
      topicOrder: document.querySelector('.article-badges span')?.textContent?.trim(),
      leftLinks: left?.querySelectorAll('nav[aria-label="所属领域专题"] a').length ?? 0,
      currentText: current?.textContent?.replace(/^\d+/, '').trim(),
      currentHref: current?.getAttribute('href'),
      headings: [...document.querySelectorAll('.article-content h2,.article-content h3')].map((heading) => ({ id: heading.id, level: heading.tagName })),
      tocLinks: targetStatus,
      methods: [...document.querySelectorAll('.article-resources a[href*="/methods/"]')].length,
      relatedLinkCount: document.querySelectorAll('.article-learning a').length,
      hasTable: !!document.querySelector('.article-content table'),
      hasKatex: !!document.querySelector('.article-content .katex'),
      hasCode: !!document.querySelector('.article-content pre'),
      figureCount: document.querySelectorAll('.article-content figure svg').length,
      hasReadLengthFigure: !!document.querySelector('.read-length-figure'),
      whiteBackground: getComputedStyle(document.body).backgroundColor === 'rgb(255, 255, 255)' || getComputedStyle(document.body).backgroundColor === 'rgba(0, 0, 0, 0)',
      updatedAt: document.querySelector('.article-hero time')?.getAttribute('datetime')
    };
  });
  const row = { id: topic.id, route: `/${route}`, responseStatus: response?.status(), expectedTitle: title, actualTitle: initial.h1, expectedEnglishTitle: topic.englishTitle, viewport: {}, ...initial };
  if (response?.status() !== 200) row.failure = 'http-status';
  if (initial.h1 !== title) row.failure = `wrong-title:${initial.h1}`;
  if (initial.english !== topic.englishTitle) row.failure = `wrong-english-title:${initial.english}`;
  if (initial.domain !== domainCode(topic.domainId)) row.failure = `wrong-domain:${initial.domain}`;
  if (initial.leftLinks !== 7 || initial.currentText !== title || !initial.currentHref?.endsWith(`${topic.id}/`)) row.failure = 'sidebar';
  if (!initial.tocLinks.length || initial.tocLinks.some((item) => !item.exists)) row.failure = 'toc-target';
  if (initial.hasReadLengthFigure !== (topic.id === 'sequencing-data')) row.failure = 'special-figure-scope';

  await page.setViewportSize({ width: 1600, height: 900 });
  const desktopScreenshot = path.join(desktopRoot, domainCode(topic.domainId), `${topic.id}.png`);
  fs.mkdirSync(path.dirname(desktopScreenshot), { recursive: true });
  await page.screenshot({ path: desktopScreenshot, animations: 'disabled' });

  for (const [width, height] of widths) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(35);
    const metrics = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, viewport: innerWidth, headingVisible: !!document.querySelector('.article-heading h1')?.getClientRects().length, mobileSidebarClosed: matchMedia('(max-width:900px)').matches ? !document.querySelector('.article-left details')?.open : true }));
    row.viewport[width] = metrics;
    if (metrics.documentWidth > width + 1 || metrics.bodyWidth > width + 1) row.failure = `horizontal-overflow-${width}`;
    if (!metrics.headingVisible || !metrics.mobileSidebarClosed) row.failure = `layout-state-${width}`;
  }
  await page.setViewportSize({ width: 1600, height: 900 });

  if (topic.order === 1) {
    const mobileScreenshot = path.join(mobileRoot, `${domainCode(topic.domainId)}-${topic.id}-390.png`);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: mobileScreenshot, fullPage: true, animations: 'disabled' });
    await page.setViewportSize({ width: 375, height: 812 });
  }

  if (initial.figureCount) {
    const zoom = page.locator('.article-content figure button').first();
    if (await zoom.count()) {
      await zoom.click();
      const dialog = page.locator('dialog.figure-dialog');
      const opened = await dialog.isVisible();
      if (opened) {
        await dialog.getByRole('button', { name: '关闭放大图解' }).click();
        await dialog.waitFor({ state: 'detached' });
      }
      row.svgZoomPassed = opened && !(await dialog.count());
      if (!row.svgZoomPassed) row.failure = 'svg-zoom';
    } else {
      row.svgZoomPassed = false;
      row.failure = 'missing-svg-zoom-button';
    }
  } else row.svgZoomPassed = 'not-applicable';

  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(40);
  row.progressAtBottom = Number(await page.locator('.article-progress').getAttribute('aria-valuenow'));
  if (row.progressAtBottom < 98) row.failure = `progress-${row.progressAtBottom}`;
  row.desktopScreenshot = path.relative(output, desktopScreenshot).replaceAll('\\', '/');
  if (row.failure) results.errors.push({ type: 'page-check', id: topic.id, message: row.failure, url });
  results.pages.push(row);
}

async function checkInteraction(id, actionSelector, expectedSelector, expectedText, resetSelector) {
  const topic = published.find((item) => item.id === id);
  const url = new URL(`topics/${topic.domainId}/${topic.id}/`, baseUrl).href;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.locator('.topic-v2').waitFor();
  const before = (await page.locator(expectedSelector).textContent())?.trim() ?? '';
  if (actionSelector === '[data-threshold]') {
    await page.locator(actionSelector).evaluate((input) => { input.value = '0.2'; input.dispatchEvent(new Event('input', { bubbles: true })); });
  } else await page.locator(actionSelector).click();
  const after = (await page.locator(expectedSelector).textContent())?.trim() ?? '';
  const passed = after !== before && (!expectedText || after.includes(expectedText));
  if (resetSelector) await page.locator(resetSelector).click();
  results.interactions.push({ id, action: actionSelector, before, after, passed });
  if (!passed) results.errors.push({ type: 'interaction', id, message: `Control ${actionSelector} did not update ${expectedSelector}`, url });
}

await checkInteraction('assembly-graphs', '[data-graph-next]', '[data-graph-explanation]', '第 2 步', '[data-graph-reset]');
await checkInteraction('haplotype-resolution', '#phase-next', '#phase-explanation', undefined, '#phase-reset');
await checkInteraction('m02-topic-03', '#hmm-next', '#hmm-text', '第 2 步', '#hmm-reset');
await checkInteraction('m03-topic-02', '#chain-next', '#chain-explanation', undefined, '#chain-reset');
await checkInteraction('m03-topic-05', '[data-sample="a"]', '#graph-explanation', '样本甲路径', '[data-sample="reset"]');
await checkInteraction('m03-topic-06', '[data-read="a"]', '#mapping-explanation', undefined, '[data-read="reset"]');
await checkInteraction('m04-topic-01', '#evolution-next', '#evolution-explanation', undefined, '#evolution-reset');
await checkInteraction('m04-topic-03', '[data-dot="reverse"]', '#dot-explanation', '反向排列', '[data-dot="reset"]');
await checkInteraction('m04-topic-04', '#tree-next', '#tree-explanation', undefined, '#tree-reset');
await checkInteraction('m04-topic-06', '#wgd-next', '#wgd-explanation', undefined, '#wgd-reset');
await checkInteraction('m05-topic-03', '#pca-next', '#pca-explanation', undefined, '#pca-reset');
await checkInteraction('m06-topic-05', '[data-gwas="qq"]', '#gwas-explanation', 'QQ 图', '[data-gwas="reset"]');
await checkInteraction('m08-topic-03', '[data-mode="group"]', '[data-legend]', '模拟组', '[data-reset]');
await checkInteraction('m08-topic-05', '[data-next]', '[data-description]', '步骤 1', '[data-reset]');
await checkInteraction('m09-topic-02', '[data-threshold]', '[data-output]', undefined, '[data-reset]');

await browser.close();
results.pass = results.errors.length === 0 && results.pages.length === 63;
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'browser-results.json'), `${JSON.stringify(results, null, 2)}\n`);
console.log(`Browser pages: ${results.pages.length}/63; viewport checks: ${results.pages.length * widths.length}; interactions: ${results.interactions.filter((item) => item.passed).length}/${results.interactions.length}; errors: ${results.errors.length}`);
if (results.errors.length) {
  console.error(JSON.stringify(results.errors.slice(0, 30), null, 2));
  process.exitCode = 1;
}
