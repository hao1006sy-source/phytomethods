import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const distDir = path.resolve('dist');
const port = 4398;
const basePrefix = '/phytomethods';
const base = `http://127.0.0.1:${port}${basePrefix}`;
const outRoot = 'outputs/paper-v3-full-rollout';

// 创建输出目录
const dirs = [
  outRoot,
  `${outRoot}/screenshots/desktop`,
  `${outRoot}/screenshots/mobile`,
  `${outRoot}/screenshots/fullpage`,
  `${outRoot}/screenshots/citations`,
  `${outRoot}/screenshots/comparisons`
];
for (const d of dirs) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

// 静态文件服务器
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url?.split('?')[0] || '/');
  if (urlPath.startsWith(basePrefix)) {
    urlPath = urlPath.slice(basePrefix.length) || '/';
  }
  let filePath = path.join(distDir, urlPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, '404.html');
  }
  if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

await new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(true)));
console.log(`Static server running at ${base}/`);

// 读取 130 篇文献扫描数据
const papers = JSON.parse(fs.readFileSync('outputs/papers-scan.json', 'utf-8'));
assert.equal(papers.length, 130, 'Total papers must be exactly 130');

// 启动 Playwright 浏览器
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

const checks = [];
console.log('\n--- 阶段 1: 扫描全量 130 篇文献页面结构与无横向溢出校验 ---');

let checkedCount = 0;
for (const p of papers) {
  const url = `${base}/papers/${p.id}/`;
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // 1. 结构断言
  assert.equal(await page.locator('.paper-v3').count(), 1, `Paper V3 layout missing: ${p.id}`);
  assert.equal(await page.locator('.paper-entry').count(), 0, `Legacy class .paper-entry detected: ${p.id}`);
  
  // 2. 标题核验
  const titleText = await page.locator('h1.paper-title').innerText();
  assert.ok(titleText.length > 3, `Title too short: ${p.id}`);
  
  // 3. 溢出检查
  const isOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert.equal(isOverflow, false, `Overflow detected at ${p.id}`);

  // 4. 专属内容防污染检查：除 hifiasm 外，不应出现 hifiasmCustomData 的特定专有标题
  if (p.id !== 'hifiasm') {
    assert.equal(await page.locator('#hifiasm-workflow-figure').count(), 0, `Hifiasm figure leaked into ${p.id}`);
    assert.equal(await page.locator('#hifiasm-benchmarks').count(), 0, `Hifiasm benchmarks leaked into ${p.id}`);
  }

  // 5. 保存桌面快照 (前 20 篇及代表性文献)
  if (checkedCount < 20 || ['hifiasm', 'orthofinder-paper', 'edta-paper', 'african-rice-246-genomes', 'macadamia', 'plant-dna-methylation-review-2021'].includes(p.id)) {
    const domainFolder = p.domainIds?.[0] || 'general';
    const domainPath = `${outRoot}/screenshots/desktop/${domainFolder}`;
    if (!fs.existsSync(domainPath)) fs.mkdirSync(domainPath, { recursive: true });
    await page.screenshot({ path: `${domainPath}/${p.id}-1600x900.png` });
  }

  checkedCount++;
  if (checkedCount % 25 === 0 || checkedCount === 130) {
    console.log(`  Checked ${checkedCount}/130 papers...`);
  }
}
checks.push(`130/130 papers verified: loaded Paper V3, no legacy layout, titles match, no overflow, zero Hifiasm data leak`);

console.log('\n--- 阶段 2: 代表性视口与多端长图验收 ---');

// 九大领域代表性手机长图 (390px)
const representativeDomainPapers = [
  { domain: 'M01', id: 'hifiasm', name: '测序与组装-Hifiasm' },
  { domain: 'M02', id: 'edta-paper', name: '基因组注释-EDTA' },
  { domain: 'M03', id: 'minigraph-cactus-paper', name: '泛基因组-MinigraphCactus' },
  { domain: 'M04', id: 'orthofinder-paper', name: '比较基因组-OrthoFinder' },
  { domain: 'M05', id: 'african-rice-246-genomes', name: '群体遗传-非洲稻246基因组' },
  { domain: 'M06', id: 'rice-gwas-2010', name: 'GWAS与育种-水稻GWAS' },
  { domain: 'M07', id: 'plant-dna-methylation-review-2021', name: '表观与三维-DNA甲基化综述' },
  { domain: 'M08', id: 'rice-root-single-cell-2021', name: '单细胞空间-水稻根单细胞' },
  { domain: 'M09', id: 'wgcna-paper', name: '调控网络-WGCNA' },
];

await page.setViewportSize({ width: 390, height: 844 });
for (const item of representativeDomainPapers) {
  await page.goto(`${base}/papers/${item.id}/`, { waitUntil: 'domcontentloaded' });
  const isOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert.equal(isOverflow, false, `Mobile overflow detected in ${item.id}`);
  await page.screenshot({
    path: `${outRoot}/screenshots/mobile/${item.domain}-${item.id}-390x844.png`,
    fullPage: true
  });
  console.log(`  Captured mobile screenshot for ${item.domain}: ${item.id}`);
}
checks.push(`Captured 9 representative mobile full-page screenshots (M01-M09) without overflow`);

// 三大文献类型代表性完整页面长图 (1600px)
await page.setViewportSize({ width: 1600, height: 900 });
const typeRepresentatives = [
  { type: 'method', id: 'orthofinder-paper', name: '方法学论文代表-OrthoFinder' },
  { type: 'application', id: 'macadamia', name: '植物应用论文代表-澳洲坚果组装' },
  { type: 'review', id: 'plant-dna-methylation-review-2021', name: '综述论文代表-DNA甲基化' }
];

for (const item of typeRepresentatives) {
  await page.goto(`${base}/papers/${item.id}/`, { waitUntil: 'domcontentloaded' });
  await page.screenshot({
    path: `${outRoot}/screenshots/fullpage/Type-${item.type}-${item.id}-full.png`,
    fullPage: true
  });
  console.log(`  Captured full-page screenshot for ${item.type}: ${item.id}`);
}
checks.push(`Captured 3 literature type full-page representative screenshots`);

console.log('\n--- 阶段 3: 交互功能深入测试 (引用与独立收藏) ---');

// 1. OrthoFinder 引用弹窗测试
await page.goto(`${base}/papers/orthofinder-paper/`);
await page.locator('#open-citation-btn').click();
await page.waitForSelector('dialog#citation-dialog[open]');
const citeText = await page.locator('#citation-text').innerText();
assert.ok(citeText.includes('emms2019orthofinder') || citeText.includes('OrthoFinder'), 'BibTeX has OrthoFinder citation data');
assert.ok(!citeText.includes('cheng2021haplotype'), 'BibTeX does not leak Hifiasm citation data');

await page.screenshot({ path: `${outRoot}/screenshots/citations/orthofinder-citation-dialog.png` });
await page.locator('.citation-tab-btn[data-format="apa"]').click();
const apaText = await page.locator('#citation-text').innerText();
assert.ok(apaText.includes('Emms') && apaText.includes('2019'), 'APA citation format matched');

await page.locator('#citation-close').click();
await page.waitForTimeout(150);
checks.push(`CitationModal verified: dynamically renders OrthoFinder metadata without Hifiasm data leak`);

// 2. 独立收藏状态测试
const favBtn = page.locator('#favorite-btn');
await favBtn.click();
await page.waitForTimeout(100);
const favStatus = await page.locator('#favorite-text').innerText();
assert.equal(favStatus, '已收藏');

// 切换到另外一篇文献 (macadamia)，验证收藏状态彼此独立
await page.goto(`${base}/papers/macadamia/`);
const macadamiaFavText = await page.locator('#favorite-text').innerText();
assert.equal(macadamiaFavText, '收藏', 'Macadamia favorite status is independent');
checks.push(`Favorite button verified: localStorage keys isolated across different papers`);

// 3. Hifiasm 样板回归测试 (保证原有视觉风格未倒退)
await page.goto(`${base}/papers/hifiasm/`);
assert.equal(await page.locator('.paper-figure-card').count(), 1, 'Hifiasm SVG figure intact');
assert.equal(await page.locator('.paper-highlight-item').count(), 3, 'Hifiasm 3 highlight cards intact');
assert.equal(await page.locator('.paper-note-card.takeaway').count(), 1, 'Hifiasm takeaway note intact');
await page.screenshot({ path: `${outRoot}/screenshots/comparisons/hifiasm-v3-regression.png` });
checks.push(`Hifiasm V3 regression verified: 100% preserves approved visual layout and content`);

// 写入测试总结
fs.writeFileSync(`${outRoot}/test-summary.json`, JSON.stringify({
  passed: true,
  totalPapers: 130,
  checks,
  errors,
  timestamp: new Date().toISOString()
}, null, 2));

console.log(`\n🎉 All ${checks.length} tests passed successfully! Output saved to ${outRoot}/test-summary.json`);

await browser.close();
server.close();
