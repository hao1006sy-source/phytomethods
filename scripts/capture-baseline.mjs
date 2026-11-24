import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const baselineDir = path.resolve(__dirname, '..', 'outputs', 'plant-genome-hub-v1.1', 'baseline');
fs.mkdirSync(baselineDir, { recursive: true });

const server = http.createServer((req, res) => {
  let cleanUrl = req.url?.split('?')[0].split('#')[0] || '/';
  let pathname = decodeURIComponent(cleanUrl);
  if (pathname.startsWith('/phytomethods')) {
    pathname = pathname.slice('/phytomethods'.length) || '/';
  }
  let filePath = path.join(distDir, pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.wasm': 'application/wasm'
  };
  const buf = fs.readFileSync(filePath);
  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    'Content-Length': buf.length
  });
  res.end(buf);
});

server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/phytomethods`;
  console.log(`[Baseline Server] 启动于 ${baseUrl}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  });

  const page = await browser.newPage();

  // 1. 目录页 1600px
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(`${baseUrl}/genomes/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(baselineDir, 'baseline-genomes-1600.png'), fullPage: true });

  // 2. 目录页 390px
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/genomes/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(baselineDir, 'baseline-genomes-390.png'), fullPage: true });

  // 3. 拟南芥 1600px
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(`${baseUrl}/genomes/arabidopsis/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(baselineDir, 'baseline-arabidopsis-1600.png'), fullPage: true });

  // 4. 拟南芥 390px
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/genomes/arabidopsis/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(baselineDir, 'baseline-arabidopsis-390.png'), fullPage: true });

  // 5. 水稻 1600px
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(`${baseUrl}/genomes/rice/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(baselineDir, 'baseline-rice-1600.png'), fullPage: true });

  // 6. 水稻 390px
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/genomes/rice/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(baselineDir, 'baseline-rice-390.png'), fullPage: true });

  // 7. 官方数据库导航 1600px
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(`${baseUrl}/genomes/databases/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(baselineDir, 'baseline-databases-1600.png'), fullPage: true });

  // 8. 官方数据库导航 390px
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/genomes/databases/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(baselineDir, 'baseline-databases-390.png'), fullPage: true });

  // 9. 深色模式目录页 (1600px)
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(`${baseUrl}/genomes/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(baselineDir, 'baseline-genomes-dark-1600.png'), fullPage: true });

  // 10. 深色模式物种详情页 (水稻 1600px)
  await page.goto(`${baseUrl}/genomes/rice/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(baselineDir, 'baseline-rice-dark-1600.png'), fullPage: true });

  console.log('✓ 全部 10 张基准视觉截图已成功捕获保存至 outputs/plant-genome-hub-v1.1/baseline/');

  await browser.close();
  server.close();
  process.exit(0);
});
