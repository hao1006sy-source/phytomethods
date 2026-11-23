import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const output = process.env.TUTORIAL_V3_OUTPUT ?? 'outputs/tutorial-v3-rollout';
const base = (process.env.PHYTOMETHODS_PREVIEW_BASE ?? 'http://127.0.0.1:4323/phytomethods').replace(/\/$/, '');
const edge = process.env.EDGE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const gitRoot = process.env.TUTORIAL_GIT_ROOT;
const ids = [
  'hifiasm-intro', 'orthofinder-intro', 'syri-intro', 'bismark-synthetic', 'plink-synthetic',
  'gwas-synthetic', 'scanpy-synthetic', 'wgcna-synthetic', 'edta-tutorial', 'cafe5-intro'
];
const viewports = [[1600, 900], [1440, 900], [1280, 800], [1024, 768], [768, 1024], [390, 844], [375, 812]];
const browser = await chromium.launch({ executablePath: edge, headless: true });
const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
await page.setViewportSize({ width: 1600, height: 900 });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const processor = await createMarkdownProcessor({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] });
const normalize = value => value.replace(/\s+/g, '').trim();
const results = { base, tutorials: {}, viewports, internalLinks: [], pageErrors: errors };
fs.mkdirSync(output, { recursive: true });

for (const id of ids) {
  const sourcePath = path.join('src', 'content', 'tutorials', `${id}.md`);
  const source = fs.readFileSync(sourcePath, 'utf8').replaceAll('\r\n', '\n');
  if (gitRoot) {
    const mainSource = execFileSync('git', ['show', `origin/main:${sourcePath.replaceAll('\\', '/')}`], { cwd: gitRoot, encoding: 'utf8' }).replaceAll('\r\n', '\n');
    assert.equal(source, mainSource, `${id}: source Markdown is unchanged from origin/main`);
  }
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(frontmatter, `${id}: frontmatter exists`);
  const status = frontmatter[1].match(/^tested:\s*(.+)$/m)?.[1].trim();
  assert.ok(['verified', 'template', 'not-tested'].includes(status), `${id}: validation status exists`);
  const body = source.slice(frontmatter[0].length).trim();
  const sourceCode = [...body.matchAll(/```([^\n]*)\n([\s\S]*?)\n```/g)].map(match => ({ lang: match[1].trim() || 'text', code: match[2] }));
  const sourceHeadings = [...body.matchAll(/^##\s+(.+?)\s*#*\s*$/gm)].map(match => match[1].trim());
  const tutorialResult = { status, originalHeadings: sourceHeadings, originalCodeBlocks: sourceCode.length, testedWidths: [], codeCopied: 0, navigationLinks: 0, internalLinks: [] };
  const route = `${base}/tutorials/${id}/`;
  const response = await page.goto(route, { waitUntil: 'networkidle' });
  assert.equal(response?.status(), 200, `${id}: HTTP 200`);
  assert.equal(await page.locator('.tutorial-v3').count(), 1, `${id}: V3 layout`);
  assert.equal(await page.locator('.reading-layout').count(), 0, `${id}: no legacy layout`);
  assert.equal(await page.locator('.tv3-code .code-toolbar').count(), 0, `${id}: no duplicate code toolbar`);
  if (id !== 'hifiasm-intro') {
    assert.equal(await page.locator('.tv3-sidebar a').count(), sourceHeadings.length + 2, `${id}: overview, original chapters, resources navigation`);
    assert.equal(await page.locator('.tv3-code').count(), sourceCode.length, `${id}: all original fenced code blocks rendered`);
  }
  const faqCount = await page.locator('.tv3-faq').count();
  assert.equal(faqCount > 0, sourceHeadings.some(heading => /常见问题|常见错误|FAQ/i.test(heading)), `${id}: source FAQ sections are rendered as accordions`);
  assert.equal(await page.locator('.tv3-workflow svg').count(), 1, `${id}: method-specific workflow exists`);
  const statusElement = page.locator(id === 'hifiasm-intro' ? '.tv3-status' : '.tv3-section-status').first();
  assert.match(await statusElement.textContent(), status === 'verified' ? /已验证|已运行验证/ : /命令模板|尚未/);

  const headings = await page.locator('.tv3-step>h2').allTextContents();
  if (id !== 'hifiasm-intro') for (const heading of sourceHeadings) assert.ok(headings.some(text => text.includes(heading)), `${id}: source heading retained (${heading})`);
  const codeNodes = page.locator('.tv3-code code');
  if (id !== 'hifiasm-intro') for (let index = 0; index < sourceCode.length; index += 1) {
    const rendered = await codeNodes.nth(index).textContent();
    assert.equal(rendered?.replaceAll('\r\n', '\n'), sourceCode[index].code, `${id}: code block ${index + 1} is byte-identical`);
    await page.locator('.tv3-code').nth(index).locator('.tv3-copy').click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    assert.equal(copied.replaceAll('\r\n', '\n'), sourceCode[index].code, `${id}: clipboard ${index + 1}`);
    tutorialResult.codeCopied += 1;
  }

  if (id !== 'hifiasm-intro') for (let index = 0; index < sourceHeadings.length; index += 1) {
    const sectionId = `tutorial-source-${String(index + 1).padStart(2, '0')}`;
    const heading = sourceHeadings[index];
    const sourceSectionMatch = body.match(new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*#*\\s*$([\\s\\S]*?)(?=^##\\s+|$)`, 'm'));
    assert.ok(sourceSectionMatch, `${id}: source section found (${heading})`);
    const expectedHtml = (await processor.render(sourceSectionMatch[1].trim())).code;
    const expectedText = await page.evaluate(html => {
      const container = document.createElement('div');
      container.innerHTML = html;
      container.querySelectorAll('pre').forEach(node => node.remove());
      return container.textContent ?? '';
    }, expectedHtml);
    const renderedText = (await page.locator(`#${sectionId} .tv3-prose`).allTextContents()).join(' ');
    assert.ok(normalize(renderedText).includes(normalize(expectedText)), `${id}: prose of original section retained (${heading})`);
  }

  const workflowSvg = await page.locator('.tv3-workflow svg').evaluate(element => element.outerHTML);
  fs.writeFileSync(path.join(output, `${id}-workflow.svg`), workflowSvg);
  await page.locator('.tv3-zoom').click();
  assert.equal(await page.locator('.tv3-figure-dialog').evaluate(dialog => dialog.open), true, `${id}: workflow dialog opened`);
  assert.equal(await page.locator('.tv3-figure-dialog svg').count(), 1, `${id}: workflow copy shown in dialog`);
  if (['orthofinder-intro', 'scanpy-synthetic', 'wgcna-synthetic'].includes(id)) {
    const folder = path.join(output, id);
    fs.mkdirSync(folder, { recursive: true });
    await page.screenshot({ path: path.join(folder, 'workflow-zoom.png') });
  }
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.tv3-figure-dialog').evaluate(dialog => dialog.open), false, `${id}: Escape closes dialog`);
  assert.equal(await page.locator('.tv3-zoom').evaluate(element => element === document.activeElement), true, `${id}: focus returns to zoom control`);
  if (faqCount) {
    const faq = page.locator('.tv3-faq').first();
    await faq.locator('summary').click();
    assert.notEqual(await faq.getAttribute('open'), null, `${id}: FAQ opens`);
    await faq.locator('summary').click();
    assert.equal(await faq.getAttribute('open'), null, `${id}: FAQ closes`);
  }

  const navLinks = page.locator('.tv3-sidebar a');
  for (let index = 0; index < await navLinks.count(); index += 1) {
    const link = navLinks.nth(index);
    const href = await link.getAttribute('href');
    assert.ok(href && await page.locator(href).count() === 1, `${id}: navigation target ${href}`);
    await link.evaluate(element => element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window })));
    await page.waitForTimeout(50);
    assert.equal(new URL(page.url()).hash, href, `${id}: navigation moves to ${href}`);
    tutorialResult.navigationLinks += 1;
  }
  await page.evaluate(() => document.querySelector('.tv3-step:nth-of-type(3)')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(100);
  assert.ok(await page.locator('.tv3-sidebar a[aria-current="location"]').count() >= 1, `${id}: active chapter indicator`);

  const internalHrefs = await page.locator('.tutorial-v3 a[href]').evaluateAll(elements => [...new Set(elements.map(element => element.href))].filter(url => url.includes(location.host) && !url.includes('#tutorial-')));
  for (const href of internalHrefs) {
    const linkResponse = await page.request.get(href);
    assert.equal(linkResponse.status(), 200, `${id}: internal link ${href}`);
    tutorialResult.internalLinks.push(href);
    results.internalLinks.push({ tutorial: id, href, status: linkResponse.status() });
  }

  for (const [width, height] of viewports) {
    await page.setViewportSize({ width, height });
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    const dimensions = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    assert.ok(dimensions.scrollWidth <= dimensions.width + 1, `${id}: no page overflow at ${width}px (${dimensions.scrollWidth})`);
    assert.equal(await page.locator('.tv3-workflow svg').count(), 1, `${id}: SVG stays mounted at ${width}px`);
    if (width === 1600) {
      const folder = path.join(output, id);
      fs.mkdirSync(folder, { recursive: true });
      await page.screenshot({ path: path.join(folder, 'desktop-1600.png') });
      await page.screenshot({ path: path.join(folder, 'desktop-full-1600.png'), fullPage: true });
      await page.locator('.tv3-workflow').screenshot({ path: path.join(folder, 'workflow.png') });
      for (const language of ['bash', 'python', 'r']) {
        const block = page.locator(`.tv3-code:has(pre[data-language="${language}"])`).first();
        if (await block.count()) await block.screenshot({ path: path.join(folder, `code-${language}.png`) });
      }
    }
    if (width === 390) {
      const folder = path.join(output, id);
      fs.mkdirSync(folder, { recursive: true });
      await page.screenshot({ path: path.join(folder, 'mobile-390.png'), fullPage: true });
      const details = page.locator('.tv3-sidebar details');
      assert.equal(await details.getAttribute('open'), null, `${id}: mobile chapter list starts collapsed`);
      await details.locator('summary').click();
      await details.locator('a').nth(1).click();
      assert.equal(await page.evaluate(() => location.hash), await details.locator('a').nth(1).getAttribute('href'), `${id}: mobile chapter navigation`);
    }
    tutorialResult.testedWidths.push({ width, height, pageWidth: dimensions.width, scrollWidth: dimensions.scrollWidth });
  }
  results.tutorials[id] = tutorialResult;
}

for (const route of ['', 'tutorials/', 'topics/', 'methods/hifiasm/', 'papers/hifiasm/', 'knowledge/']) {
  const response = await page.request.get(`${base}/${route}`);
  assert.equal(response.status(), 200, `Regression route ${route || 'home'}`);
}
const stateCounts = Object.values(results.tutorials).reduce((counts, tutorial) => {
  counts[tutorial.status] = (counts[tutorial.status] ?? 0) + 1;
  return counts;
}, {});
assert.deepEqual(stateCounts, { template: 2, verified: 8 }, 'Validation state is 8 verified / 2 template after CAFE5 execution');
await page.goto(`${base}/tutorials/`, { waitUntil: 'domcontentloaded' });
assert.equal(await page.locator('.ti-card').count(), 10, 'Tutorial index V4 remains complete');
for (const id of ids) assert.equal(await page.locator(`.ti-card[href*="${id}"]`).count(), 1, `Index links to ${id}`);
assert.deepEqual(errors, [], 'No browser page errors');
results.summary = {
  tutorials: Object.keys(results.tutorials).length,
  verified: Object.values(results.tutorials).filter(item => item.status === 'verified').length,
  template: Object.values(results.tutorials).filter(item => item.status === 'template').length,
  pageLoads: Object.values(results.tutorials).length * viewports.length,
  responsiveChecks: Object.values(results.tutorials).reduce((sum, item) => sum + item.testedWidths.length, 0),
  codeBlocksCopied: Object.values(results.tutorials).reduce((sum, item) => sum + item.codeCopied, 0),
  navigationJumps: Object.values(results.tutorials).reduce((sum, item) => sum + item.navigationLinks, 0),
  internalLinkChecks: results.internalLinks.length,
  pageErrors: errors.length
};
fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify(results, null, 2));
await browser.close();
console.log(`Tutorial V3 full rollout browser acceptance passed: ${JSON.stringify(results.summary)}`);
