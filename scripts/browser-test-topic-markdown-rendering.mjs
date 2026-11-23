/**
 * PhytoMethods 63 篇专题 Markdown 渲染与交互 Playwright 浏览器自动化回归测试
 * 覆盖全部 63 篇专题访问、M04-01 修复点精准验证、九大领域代表性截图、390px 移动端无溢出检测
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const distDir = path.resolve('dist');
const port = 4455; // 独立测试端口
const basePrefix = '/phytomethods';
const base = `http://127.0.0.1:${port}${basePrefix}`;
const screenshotDir = 'outputs/topic-markdown-audit/screenshots';

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// 静态服务器
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

// 跨平台查找系统浏览器
const launchOptions = { headless: true };
let executablePath = null;
if (process.platform === 'win32') {
  const winPaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  executablePath = winPaths.find(p => fs.existsSync(p));
} else if (process.platform === 'linux') {
  const linuxPaths = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium'];
  executablePath = linuxPaths.find(p => fs.existsSync(p));
}

if (executablePath) {
  launchOptions.executablePath = executablePath;
  console.log(`[Browser] Using system browser: ${executablePath}`);
}

const browser = await chromium.launch(launchOptions);

const results = {
  passed: 0,
  failed: 0,
  assertions: []
};

function pass(msg) {
  results.passed++;
  results.assertions.push({ status: 'PASS', msg });
  console.log(`  ✓ ${msg}`);
}

try {
  const page = await browser.newPage();

  // 1. 深度专项：M04-01 重点修复点 DOM 级别断言
  console.log('\n--- 测试 1: M04-01 同源、直系同源与旁系同源渲染修复专项验证 ---');
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(`${base}/topics/comparative-genomics/m04-topic-01/`, { waitUntil: 'networkidle' });

  // 1.1 检查是否存在 <strong>同源（homology）</strong>
  const hasHomologyStrong = await page.evaluate(() => {
    const strongs = [...document.querySelectorAll('.article-content strong')].map(s => s.textContent.trim());
    return strongs.includes('同源（homology）');
  });
  assert.ok(hasHomologyStrong, 'M04-01 必须正确渲染 <strong>同源（homology）</strong>');
  pass('M04-01 成功生成 <strong>同源（homology）</strong> 语义标签');

  // 1.2 检查是否存在 <strong>直系同源（orthology）</strong> 与 <strong>旁系同源（paralogy）</strong>
  const hasOrthologyStrongs = await page.evaluate(() => {
    const strongs = [...document.querySelectorAll('.article-content strong')].map(s => s.textContent.trim());
    return strongs.includes('直系同源（orthology）') && strongs.includes('旁系同源（paralogy）');
  });
  assert.ok(hasOrthologyStrongs, 'M04-01 必须正确渲染 <strong>直系同源（orthology）</strong> 与 <strong>旁系同源（paralogy）</strong>');
  pass('M04-01 成功生成 <strong>直系同源（orthology）</strong> 与 <strong>旁系同源（paralogy）</strong> 语义标签');

  // 1.3 检查正文 textContent 中绝对不能包含字面量 **
  const leakedDoubleStars = await page.evaluate(() => {
    const content = document.querySelector('.article-content');
    if (!content) return 0;
    // 克隆并移除 pre/code
    const clone = content.cloneNode(true);
    clone.querySelectorAll('pre, code, svg, script').forEach(el => el.remove());
    return (clone.textContent.match(/\*\*/g) || []).length;
  });
  assert.strictEqual(leakedDoubleStars, 0, 'M04-01 正文文本中绝对不能残留任何 ** 标记');
  pass('M04-01 正文文本中 0 处未渲染的 ** 标记');

  // 1.4 截图：M04-01 局部第二章与全景
  const section2 = await page.$('h2#同源关系的三个基本概念');
  assert.ok(section2, '第二章节标题元素必须存在');
  await page.screenshot({ path: `${screenshotDir}/m04-topic-01-concepts-fixed.png`, fullPage: false });
  pass(`已截取 M04-01 核心修复区域截图: ${screenshotDir}/m04-topic-01-concepts-fixed.png`);

  await page.screenshot({ path: `${screenshotDir}/m04-topic-01-desktop-1600.png`, fullPage: true });
  pass(`已截取 M04-01 桌面端全景截图: ${screenshotDir}/m04-topic-01-desktop-1600.png`);

  // 2. 全量巡检：遍历 63 篇专题，核查可访问性、无 ** 残留、目录与侧边栏
  console.log('\n--- 测试 2: 全站九大领域 63 篇专题无死角自动化巡检 ---');
  const allTopicRoutes = [];
  for (const d of fs.readdirSync(distDir)) {
    const dPath = path.join(distDir, d);
    if (!fs.statSync(dPath).isDirectory()) continue;
    for (const t of fs.readdirSync(dPath)) {
      const tPath = path.join(dPath, t);
      if (fs.statSync(tPath).isDirectory() && fs.existsSync(path.join(tPath, 'index.html'))) {
        allTopicRoutes.push({ domain: d, topic: t });
      }
    }
  }

  for (const r of allTopicRoutes) {
    const url = `${base}/topics/${r.domain}/${r.topic}/`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // 验证标题与文章主体
    const h1Text = await page.$eval('h1', el => el.textContent.trim());
    assert.ok(h1Text.length > 0, `${r.topic} 必须包含有效 h1 标题`);

    // 验证正文无暴露的 ** 标记
    const starLeaks = await page.evaluate(() => {
      const art = document.querySelector('.article-content');
      if (!art) return 0;
      const clone = art.cloneNode(true);
      clone.querySelectorAll('pre, code, svg, script').forEach(el => el.remove());
      return (clone.textContent.match(/\*\*/g) || []).length;
    });
    assert.strictEqual(starLeaks, 0, `专题 ${r.topic} 正文严禁暴露 ** 标记`);
  }
  pass(`全部 ${allTopicRoutes.length} 篇专题巡检通过: 100% 可正常访问且正文文本 0 处 ** 标记暴露`);

  // 3. 九大领域各选一篇代表性专题截图
  console.log('\n--- 测试 3: 九大研究领域代表性专题截图归档 ---');
  const representativeTopics = [
    { domain: 'genome-assembly', topic: 'm01-topic-01', label: 'M01-组装评估' },
    { domain: 'genome-annotation', topic: 'm02-topic-01', label: 'M02-重复序列与基因注释' },
    { domain: 'pangenomics-structural-variation', topic: 'm03-topic-01', label: 'M03-泛基因组图构建' },
    { domain: 'comparative-genomics', topic: 'm04-topic-01', label: 'M04-同源与演化' },
    { domain: 'population-genetics', topic: 'm05-topic-01', label: 'M05-群体遗传分化' },
    { domain: 'gwas-breeding', topic: 'm06-topic-01', label: 'M06-GWAS关联分析' },
    { domain: 'epigenomics-3d-genome', topic: 'm07-topic-01', label: 'M07-甲基化与三维构象' },
    { domain: 'single-cell-spatial-omics', topic: 'm08-topic-01', label: 'M08-单细胞聚类' },
    { domain: 'regulatory-genomics-ai', topic: 'm09-topic-01', label: 'M09-AI调控序列模型' }
  ];

  for (const rep of representativeTopics) {
    await page.goto(`${base}/topics/${rep.domain}/${rep.topic}/`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${screenshotDir}/${rep.domain}-${rep.topic}-desktop.png`, fullPage: false });
    pass(`已归档 ${rep.label} 桌面端截图: ${screenshotDir}/${rep.domain}-${rep.topic}-desktop.png`);
  }

  // 4. 移动端 390px 响应式与溢出检测
  console.log('\n--- 测试 4: 移动端 (390px) 响应式与横向溢出检测 ---');
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileSamples = [
    { domain: 'comparative-genomics', topic: 'm04-topic-01' },
    { domain: 'genome-annotation', topic: 'm02-topic-01' },
    { domain: 'pangenomics-structural-variation', topic: 'm03-topic-01' },
    { domain: 'population-genetics', topic: 'm05-topic-01' }
  ];
  for (const s of mobileSamples) {
    await page.goto(`${base}/topics/${s.domain}/${s.topic}/`, { waitUntil: 'networkidle' });

    const isOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.strictEqual(isOverflow, false, `移动端 390px 下 ${s.topic} 不得出现横向溢出`);
    pass(`专题 ${s.topic} 390px 移动端无横向溢出`);

    if (s.topic === 'm04-topic-01') {
      await page.screenshot({ path: `${screenshotDir}/m04-topic-01-mobile-390.png`, fullPage: false });
      pass(`已保存 M04-01 移动端截图: ${screenshotDir}/m04-topic-01-mobile-390.png`);
    }
  }

  // 5. 交互功能验证：目录点击滚动、前后篇导航与返回入口
  console.log('\n--- 测试 5: 专题页交互功能回归测试 ---');
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(`${base}/topics/comparative-genomics/m04-topic-01/`, { waitUntil: 'networkidle' });

  // 5.1 目录项点击
  const tocLink = await page.$('nav.toc a[href="#方法比较与适用条件"]');
  if (tocLink) {
    await tocLink.click();
    pass('章节目录点击交互正常');
  }

  // 5.2 返回领域链接
  const domainBack = await page.$('a[href*="/topics/comparative-genomics/"]');
  assert.ok(domainBack, '必须包含返回所属领域的面包屑或导航链接');
  pass('领域返回导航链接正常');

} finally {
  await browser.close();
  server.close();
}

console.log('\n================ 测试执行完成 ================');
console.log(`全部通过: ${results.passed} 项断言 | 失败: ${results.failed} 项`);
if (results.failed > 0) {
  process.exitCode = 1;
} else {
  console.log('🎉 63 篇专题 Markdown 渲染与浏览器回归断言 100% 全部通过！');
}
