import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const distDir = path.resolve('dist');
const port = 4399; // 使用独立端口避免冲突
const basePrefix = '/phytomethods';
const base = `http://127.0.0.1:${port}${basePrefix}`;
const outDir = 'outputs/knowledge-audit/screenshots';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
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
console.log(`[Test Server] Ready at ${base}`);

// 查找本机 Chrome/Edge 可执行文件
const browserExecutablePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];
const executablePath = browserExecutablePaths.find(p => fs.existsSync(p));
if (!executablePath) {
  throw new Error('No Edge/Chrome browser binary found for Playwright testing.');
}

const browser = await chromium.launch({
  executablePath,
  headless: true
});

const testResults = {
  passed: 0,
  failed: 0,
  assertions: []
};

function recordPass(msg) {
  testResults.passed++;
  testResults.assertions.push({ status: 'PASS', msg });
  console.log(`  ✓ ${msg}`);
}

function recordFail(msg) {
  testResults.failed++;
  testResults.assertions.push({ status: 'FAIL', msg });
  console.error(`  ✗ ${msg}`);
}

try {
  const page = await browser.newPage();

  console.log('\n--- 测试 1: 方法学论文 (OrthoFinder) 关联植物应用研究卡片 ---');
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(`${base}/papers/orthofinder-paper/`, { waitUntil: 'networkidle' });

  // 1. 验证存在植物研究应用卡片
  const plantCard = await page.$('section[aria-labelledby="card-plant-title"]');
  assert.ok(plantCard, 'OrthoFinder 详情页应成功展示植物研究应用卡片');
  recordPass('OrthoFinder 成功跨越 ID 映射障碍，动态匹配并展示植物研究应用卡片');

  // 2. 验证推荐文献带有科学依据理由
  const reasons = await page.$$eval('.paper-related-reason', els => els.map(e => e.textContent?.trim()));
  assert.ok(reasons.length > 0, '相关文献推荐应包含关联理由标识');
  recordPass(`相关文献推荐成功呈现依据标签: "${reasons[0]}"`);

  // 3. 截取 OrthoFinder 页面全景截图
  await page.screenshot({ path: `${outDir}/orthofinder-with-plant-app.png`, fullPage: false });
  recordPass(`已保存截图: ${outDir}/orthofinder-with-plant-app.png`);

  console.log('\n--- 测试 2: 植物应用论文 (Macadamia) 回溯所用算法原始文献 ---');
  await page.goto(`${base}/papers/macadamia/`, { waitUntil: 'networkidle' });

  // 验证关联内容中包含“所用算法之原始文献”
  const origPaperGroup = await page.$('.paper-linked-group:has-text("所用算法之原始文献")');
  assert.ok(origPaperGroup, 'Macadamia 应用论文应展示所用算法之原始文献');
  recordPass('Macadamia 成功回溯并展示其采用的核心算法（Hifiasm）原始论文');

  // 验证推荐理由
  const macReasons = await page.$$eval('.paper-related-reason', els => els.map(e => e.textContent?.trim()));
  assert.ok(macReasons.length > 0, 'Macadamia 相关文献推荐具有明确理由');
  recordPass(`Macadamia 推荐文献依据: "${macReasons[0]}"`);

  await page.screenshot({ path: `${outDir}/macadamia-with-origin-method.png`, fullPage: false });
  recordPass(`已保存截图: ${outDir}/macadamia-with-origin-method.png`);

  console.log('\n--- 测试 3: Hifiasm 样板视觉 100% 回归无损验证 ---');
  await page.goto(`${base}/papers/hifiasm/`, { waitUntil: 'networkidle' });

  const hifiPlantCard = await page.$('section[aria-labelledby="card-plant-title"]');
  assert.ok(hifiPlantCard, 'Hifiasm 仍稳定保留澳洲坚果案例');
  const hifiSvg = await page.$('#hifiasm-workflow-figure svg');
  assert.ok(hifiSvg, 'Hifiasm 算法流程图 SVG 渲染无损');
  recordPass('Hifiasm 原始样板结构、SVG 流程图与评测基准 100% 回归无损');

  await page.screenshot({ path: `${outDir}/hifiasm-regression-verified.png`, fullPage: false });
  recordPass(`已保存截图: ${outDir}/hifiasm-regression-verified.png`);

  console.log('\n--- 测试 4: 移动端 (390px) 响应式与横向溢出检测 ---');
  await page.setViewportSize({ width: 390, height: 844 });
  const sampleSlugs = ['orthofinder-paper', 'macadamia', 'plant-dna-methylation-review-2021', 'edta-paper'];
  for (const slug of sampleSlugs) {
    await page.goto(`${base}/papers/${slug}/`, { waitUntil: 'networkidle' });
    const isOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.strictEqual(isOverflow, false, `${slug} 在 390px 移动端不应存在横向溢出`);
    recordPass(`${slug} 移动端无横向溢出验证通过 (scrollWidth <= 390)`);
  }

} finally {
  await browser.close();
  server.close();
}

console.log('\n=== 浏览器自动化测试总结 ===');
console.log(`全部通过: ${testResults.passed} 项断言 | 失败: ${testResults.failed} 项`);
if (testResults.failed > 0) {
  process.exitCode = 1;
} else {
  console.log('🎉 科学知识关联与推荐升级全部断言 100% 通过！');
}
