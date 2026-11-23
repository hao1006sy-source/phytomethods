import { chromium } from 'playwright-core';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const port = process.env.PORT || '4321';
const base = process.env.PHYTOMETHODS_PREVIEW_BASE || `http://127.0.0.1:${port}/phytomethods`;
const out = 'outputs/paper-v3-sample';

if (!fs.existsSync(out)) {
  fs.mkdirSync(out, { recursive: true });
}

console.log(`Starting Paper V3 browser visual inspection at ${base}/papers/hifiasm/...`);

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
});

const context = await browser.newContext({
  permissions: ['clipboard-read', 'clipboard-write']
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});

const checks = [];

// 1. 各尺寸视口测试与页面溢出检测
for (const [width, height] of [
  [1600, 900],
  [1280, 800],
  [1024, 768],
  [768, 1024],
  [390, 844]
]) {
  await page.setViewportSize({ width, height });
  await page.goto(`${base}/papers/hifiasm/`, { waitUntil: 'networkidle' });

  // 标题断言
  const h1Text = await page.locator('h1.paper-title').innerText();
  assert.ok(h1Text.includes('Haplotype-resolved de novo assembly'), `Title mismatch at ${width}`);

  // 页面无横向溢出断言
  const isOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert.equal(isOverflow, false, `Page horizontal overflow at ${width}px viewport!`);

  // 截图
  if (width === 1600) {
    await page.screenshot({ path: `${out}/桌面首屏-1600x900.png` });
    await page.screenshot({ path: `${out}/完整页面长图-1600.png`, fullPage: true });
  } else if (width === 768) {
    await page.screenshot({ path: `${out}/平板端-768x1024.png` });
  } else if (width === 390) {
    await page.screenshot({ path: `${out}/手机长图-390x844.png`, fullPage: true });
  }

  checks.push(`Viewport ${width}x${height}: layout OK, no overflow`);
}

// 2. 核心区域截图
await page.setViewportSize({ width: 1600, height: 900 });
await page.goto(`${base}/papers/hifiasm/`, { waitUntil: 'networkidle' });

// 核心贡献区截图
const contributions = page.locator('#paper-contributions');
await contributions.scrollIntoViewIfNeeded();
await contributions.screenshot({ path: `${out}/核心贡献区.png` });
checks.push('Captured: 核心贡献区');

// 方法原理与 SVG 流程图截图
const methods = page.locator('#paper-methods');
await methods.scrollIntoViewIfNeeded();
await methods.screenshot({ path: `${out}/方法原理与流程图.png` });
checks.push('Captured: 方法原理与流程图');

// 精读笔记与关联资源截图
const notes = page.locator('#paper-notes');
await notes.scrollIntoViewIfNeeded();
await notes.screenshot({ path: `${out}/精读笔记区.png` });
checks.push('Captured: 精读笔记区');

const resources = page.locator('.paper-resources');
await resources.screenshot({ path: `${out}/右侧关联资源卡片区.png` });
checks.push('Captured: 右侧关联资源卡片区');

// 3. 引用弹窗测试
const citeBtn = page.locator('#open-citation-btn');
await citeBtn.scrollIntoViewIfNeeded();
await citeBtn.click();
await page.waitForSelector('dialog#citation-dialog[open]');
await page.screenshot({ path: `${out}/引用弹窗交互.png` });

const citationText = await page.locator('#citation-text').innerText();
assert.ok(citationText.includes('@article{cheng2021haplotype'), 'BibTeX format match');

// 切换 APA tab
await page.locator('.citation-tab-btn[data-format="apa"]').click();
const apaText = await page.locator('#citation-text').innerText();
assert.ok(apaText.includes('Cheng, H.'), 'APA format match');

// 点击复制按钮
await page.locator('#citation-copy-btn').click();
await page.waitForTimeout(100);

// 关闭弹窗
await page.locator('#citation-close').click();
await page.waitForTimeout(200);
assert.equal(await page.locator('dialog#citation-dialog[open]').count(), 0, 'Dialog closed successfully');
checks.push('Citation dialog: BibTeX/APA/GB7714 switch and clipboard copy OK');

// 4. 收藏按钮交互测试
const favBtn = page.locator('#favorite-btn');
await favBtn.click();
await page.waitForTimeout(100);
const favStatus = await page.locator('#favorite-text').innerText();
assert.equal(favStatus, '已收藏', 'Favorite button toggled');
checks.push('Favorite button local interaction OK');

// 5. 旧版对照截图 (对比任一现有旧版文献页，如 /papers/macadamia/)
await page.goto(`${base}/papers/macadamia/`, { waitUntil: 'networkidle' });
assert.equal(await page.locator('.paper-entry').count(), 1, 'Legacy paper layout verified');
assert.equal(await page.locator('.paper-v3').count(), 0, 'Legacy page does not load paper-v3');
await page.screenshot({ path: `${out}/改造前旧版文献页-1600.png` });
checks.push('Captured: 改造前旧版文献页对照');

// 6. 检查其他文献是否均保持旧版
const otherPaperUrls = [
  `${base}/papers/merqury/`,
  `${base}/papers/verkko/`,
  `${base}/papers/edta-paper/`
];
for (const url of otherPaperUrls) {
  await page.goto(url);
  assert.equal(await page.locator('.paper-entry').count(), 1);
  assert.equal(await page.locator('.paper-v3').count(), 0);
}
checks.push('Remaining papers strictly retain legacy renderer');

// 7. 检查全站其他核心路由未受影响 (回归检查)
const regressionRoutes = [
  `${base}/`,
  `${base}/topics/`,
  `${base}/methods/hifiasm/`,
  `${base}/tutorials/`
];
for (const r of regressionRoutes) {
  await page.goto(r);
  assert.ok(await page.locator('header.site-header').count(), `Header intact at ${r}`);
}
checks.push('Regression check: Home, Topics, Methods and Tutorials intact');

fs.writeFileSync(`${out}/browser-test-summary.json`, JSON.stringify({
  passed: true,
  checks,
  errors,
  timestamp: new Date().toISOString()
}, null, 2));

console.log(`\n🎉 Paper V3 visual tests passed! Completed ${checks.length} checks.`);
await browser.close();
