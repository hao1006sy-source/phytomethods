/**
 * Plant Genome Hub V1.1 全页面自动化浏览器测试与视觉回归套件
 * 
 * 覆盖功能：
 * 1. 目录页紧凑学术列表、动态统计与搜索/多维筛选交互
 * 2. 拟南芥与水稻版本切换、URL 同步、配套状态与科学警告
 * 3. 首屏常用核心下载（Genome FASTA, GFF3, CDS, Protein）直达入口
 * 4. Manifest JSON 导出、NCBI Datasets CLI 复制与 Markdown 引用
 * 5. 官方数据库导航 6 大数据库结构化展示与外链
 * 6. 10 个物种全量路由 200 验证与搜索页联动
 * 7. 深色模式（系统跟随与 data-theme 手动切换）及对比度合规（>= 4.5:1）
 * 8. 7 种视口严格 0 横向溢出检测与高精度多端截图
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const out = process.env.GENOME_HUB_BROWSER_OUTPUT ?? path.join(rootDir, 'outputs', 'plant-genome-hub-v1.1', 'current');
fs.mkdirSync(out, { recursive: true });

// 启动内置轻量静态文件服务器 (避免端口冲突与挂起)
function startStaticServer() {
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
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': content.length
    });
    res.end(content);
  });

  return new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, url: `http://127.0.0.1:${port}/phytomethods` });
    });
    server.on('error', reject);
  });
}

async function runGenomeHubTests() {
  console.log('=== 开始 Plant Genome Hub V1.1 全页面自动化浏览器测试 ===\n');

  let serverInstance = null;
  let base = process.env.PHYTOMETHODS_PREVIEW_BASE?.replace(/\/$/, '');

  if (!base) {
    const s = await startStaticServer();
    serverInstance = s.server;
    base = s.url;
    console.log(`[Test Server] 静态测试服务启动: ${base}\n`);
  }

  const browser = await chromium.launch({
    executablePath: process.env.EDGE_PATH ?? (process.platform === 'win32' && fs.existsSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe') ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : undefined),
    headless: true,
    args: ['--no-sandbox']
  });

  const context = await browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write'],
    acceptDownloads: true
  });

  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  try {
    // ----------------------------------------------------
    // 测试 1: 目录页高密度学术列表、动态统计与卡片总数
    // ----------------------------------------------------
    console.log('[Test 1] 校验目录页紧凑学术列表与动态统计指标...');
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(`${base}/genomes/`, { waitUntil: 'networkidle' });

    // 校验总收录组装数严格等于 12 (新增番茄 Heinz 1706 SL4.0)
    const totalCards = await page.locator('[data-genome-card]').count();
    assert.equal(totalCards, 12, '目录页应精准收录 12 套参考组装卡片');

    // 校验顶部 Hero 动态统计指标
    const statsNums = await page.locator('.gh-stat-num').allTextContents();
    assert.ok(statsNums.length >= 4, 'Hero 应展示 4 项动态指标');
    assert.equal(statsNums[0], '10', '已收录物种应为 10');
    assert.equal(statsNums[1], '12', '参考组装版本应为 12');
    assert.equal(statsNums[2], '5', '已确认配套组合应为 5 套');
    assert.ok(parseInt(statsNums[3], 10) >= 20, '已核实下载直链应 >= 20');
    console.log(`  -> 动态统计校验通过: 物种=${statsNums[0]}, 组装=${statsNums[1]}, 配套=${statsNums[2]}, 直链=${statsNums[3]}`);

    // 校验物种归组结构
    const speciesGroups = await page.locator('[data-species-group]').count();
    assert.equal(speciesGroups, 10, '应归组为 10 个独立物种大组');
    assert.equal(await page.locator('[data-species-group="arabidopsis"] [data-genome-card]').count(), 2, '拟南芥组应包含 2 套组装版本');
    assert.equal(await page.locator('[data-species-group="tomato"] [data-genome-card]').count(), 2, '番茄组应包含 2 套组装版本 (SL4.0 & Micro-Tom)');
    console.log('✓ Test 1 通过: 目录页初始渲染、动态统计指标与物种归组完全正确。\n');

    // ----------------------------------------------------
    // 测试 2: 目录页核心关键词搜索与组合筛选
    // ----------------------------------------------------
    console.log('[Test 2] 校验多维搜索与筛选联动...');
    const searchCases = [
      ['拟南芥', 2],
      ['Arabidopsis thaliana', 2],
      ['Heinz 1706', 1],
      ['SL4.0', 1],
      ['B73', 1],
      ['TAIR12', 1],
      ['Col-CC.v2', 1],
      ['GCA_028009825.2', 1],
      ['39947', 1],
      ['不存在的测试物种', 0]
    ];

    for (const [q, n] of searchCases) {
      await page.locator('#genome-query').fill(q);
      await page.waitForTimeout(100);
      const visible = await page.locator('[data-genome-card]:visible').count();
      assert.equal(visible, n, `搜索「${q}」预期返回 ${n} 条，实际返回 ${visible}`);
    }

    // 重置后测试类别筛选
    await page.locator('#genome-search-clear').click();
    await page.locator('#genome-category').selectOption('单子叶');
    await page.waitForTimeout(100);
    assert.equal(await page.locator('[data-genome-card]:visible').count(), 5, '单子叶应匹配 5 套组装');

    // 测试来源筛选
    await page.locator('#genome-category').selectOption('');
    await page.locator('#genome-source').selectOption('rgap');
    await page.waitForTimeout(100);
    assert.equal(await page.locator('[data-genome-card]:visible').count(), 1, 'RGAP 来源应匹配 1 套组装');

    // 测试级别筛选
    await page.locator('#genome-source').selectOption('');
    await page.locator('#genome-level').selectOption('Scaffold');
    await page.waitForTimeout(100);
    assert.equal(await page.locator('[data-genome-card]:visible').count(), 1, 'Scaffold 级别应匹配 1 套组装 (杨树)');

    // 恢复全量
    await page.locator('#genome-level').selectOption('');
    await page.waitForTimeout(100);
    console.log('✓ Test 2 通过: 搜索、类别、来源与组装等级联动全部正确。\n');

    // ----------------------------------------------------
    // 测试 3: 拟南芥详情页（版本切换、URL 同步与跨版本不兼容警告）
    // ----------------------------------------------------
    console.log('[Test 3] 校验拟南芥详情页版本切换与科学警告...');
    await page.goto(`${base}/genomes/arabidopsis/`, { waitUntil: 'networkidle' });

    // 检查首屏 4 大常用下载卡片存在
    const downloadCards = page.locator('.gh-download-card');
    assert.ok(await downloadCards.count() >= 4, '首屏应展示至少 4 个核心常用下载卡片 (Genome, GFF3, CDS, Protein)');

    // 检查版本警告信息
    const warningText = await page.locator('.gh-alert.warning').first().textContent();
    assert.ok(warningText?.includes('TAIR12') && warningText?.includes('TAIR10'), '应包含 TAIR12 与 TAIR10 坐标不兼容的重要科学警告');

    // 跨版本比较器测试
    await page.locator('#annotation-compare').selectOption('araport11');
    const compText = await page.locator('#comparison-status').innerText();
    assert.match(compText, /版本不兼容/, 'TAIR12 与 Araport11 比较应准确提示版本不兼容');

    // 切换参考组装为 TAIR10 (GCA_000001735.1)
    await page.locator('#assembly-select').selectOption('gca_000001735.1');
    const compStatusAfter = await page.locator('#comparison-status').innerText();
    assert.match(compStatusAfter, /已确认配套/, 'TAIR10 与 Araport11 配套完成真实核验后应准确提示已确认配套');

    // 验证 URL query 参数同步
    assert.equal(new URL(page.url()).searchParams.get('assembly'), 'gca_000001735.1', '切换后 URL 参数应同步为 gca_000001735.1');
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('#assembly-select').inputValue(), 'gca_000001735.1', '页面刷新后组装版本应自动从 URL 回填');
    console.log('✓ Test 3 通过: 拟南芥详情页多版本切换与跨版本科学警告完全正确。\n');

    // ----------------------------------------------------
    // 测试 4: 水稻详情页（直链下载、NCBI CLI 命令与 Manifest 导出）
    // ----------------------------------------------------
    console.log('[Test 4] 校验水稻详情页直接下载、CLI 复制与 Manifest 导出...');
    await page.goto(`${base}/genomes/rice/`, { waitUntil: 'networkidle' });

    // 校验直接下载链接数（至少包含 7 个直接下载链接）
    const directLinksCount = await page.locator('a:has-text("下载文件 ↗")').count();
    assert.ok(directLinksCount >= 7, `水稻页直接下载链接应 >= 7，实际为 ${directLinksCount}`);

    // NCBI Datasets 命令断言与复制
    const cliEl = page.locator('[data-cli]');
    assert.match(await cliEl.innerText(), /GCA_001433935\.1/, 'CLI 命令行中应包含水稻组装 accession GCA_001433935.1');
    await page.locator('[data-copy-cli]').click();
    await page.waitForTimeout(200);
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    assert.match(clipboardText, /datasets download genome accession GCA_001433935\.1/, '复制的命令应为正确的 datasets download');

    // Reference Manifest JSON 导出与完整性检查
    const downloadEvent = page.waitForEvent('download');
    await page.locator('[data-export-manifest]').first().click();
    const download = await downloadEvent;
    const manifestPath = path.join(out, 'reference-manifest.json');
    await download.saveAs(manifestPath);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.assemblyAccession, 'GCA_001433935.1', 'Manifest accession 校验正确');
    assert.equal(manifest.compatibilityStatus, 'confirmed', 'RGAP 配套状态应为 confirmed');
    assert.equal(manifest.selectedFiles.length, 4, '默认选中的核心文件应为 4 个');
    assert.ok(manifest.selectedFiles.every(f => f.url.startsWith('https://rice.uga.edu/')), '水稻直链应全部来自官方 UGA 域名');

    // Markdown 引用复制
    await page.locator('[data-copy-citation]').first().click();
    await page.waitForTimeout(200);
    const citationText = await page.evaluate(() => navigator.clipboard.readText());
    assert.match(citationText, /RGAP/, 'Markdown 引用中应包含 RGAP 官方出处');
    console.log('✓ Test 4 通过: 水稻详情页下载链路、CLI 复制与 Manifest 导出全部成功。\n');

    // ----------------------------------------------------
    // 测试 5: 官方数据库导航页 6 大库结构化列表
    // ----------------------------------------------------
    console.log('[Test 5] 校验官方数据库导航结构化卡片与外链...');
    await page.goto(`${base}/genomes/databases/`, { waitUntil: 'networkidle' });
    const dbCards = page.locator('.gh-card');
    assert.equal(await dbCards.count(), 6, '数据库导航页应精确收录 6 大官方数据库');
    console.log('✓ Test 5 通过: 6 大官方数据库导航全部展示正常。\n');

    // ----------------------------------------------------
    // 测试 6: 10 大物种详情页路由 200 验证
    // ----------------------------------------------------
    console.log('[Test 6] 校验全部 10 个物种详情页路由有效性...');
    const allSpecies = ['arabidopsis', 'rice', 'maize', 'wheat', 'soybean', 'tomato', 'potato', 'sorghum', 'barley', 'poplar'];
    for (const id of allSpecies) {
      const res = await page.request.get(`${base}/genomes/${id}/`);
      assert.equal(res.status(), 200, `物种路由 /genomes/${id}/ 应返回 200`);
    }
    console.log('✓ Test 6 通过: 全部 10 个物种详情页均可正常访问。\n');

    // ----------------------------------------------------
    // 测试 7: 全站搜索页面关联检索
    // ----------------------------------------------------
    console.log('[Test 7] 校验全站搜索页面对 Genome Hub 资源的检索召回...');
    await page.goto(`${base}/search/`, { waitUntil: 'networkidle' });
    const searchInput = page.locator('.pagefind-ui__search-input');
    await searchInput.fill('GCA_028009825.2');
    await searchInput.dispatchEvent('input');
    await page.waitForSelector('.pagefind-ui__result-link[href*="/genomes/"]', { timeout: 15000 });
    console.log('✓ Test 7 通过: 全站搜索可精准召回植物参考基因组组装。\n');

    // ----------------------------------------------------
    // 测试 8: 深色模式三态优先级、变量一致性与标题对比度
    // ----------------------------------------------------
    console.log('[Test 8] 校验全站深色模式变量一致性、三态冲突修复与文本对比度...');
    const setTheme = async (theme) => {
      await page.evaluate((t) => {
        if (t === 'system') {
          localStorage.removeItem('pm-theme');
          document.documentElement.removeAttribute('data-theme');
        } else {
          localStorage.setItem('pm-theme', t);
          document.documentElement.setAttribute('data-theme', t);
        }
      }, theme);
      await page.waitForTimeout(50);
    };

    const isWhite = (c) => ['#ffffff', '#fff', 'rgb(255, 255, 255)'].includes(c.toLowerCase());
    const isDarkBg = (c) => ['#0b131e', 'rgb(11, 19, 30)'].includes(c.toLowerCase());

    // 状态 1: 手动浅色 + 系统深色 (必须呈现纯白背景，不可残留系统深色)
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`${base}/genomes/rice/`, { waitUntil: 'networkidle' });
    await setTheme('light');
    const lightBg = await page.evaluate(() => getComputedStyle(document.querySelector('.gh')).getPropertyValue('--gh-bg').trim());
    assert.ok(isWhite(lightBg), `手动浅色在系统深色下必须强制生效为白色，实际为 ${lightBg}`);

    // 状态 2: 手动深色 + 系统浅色 (必须呈现深色背景)
    await page.emulateMedia({ colorScheme: 'light' });
    await setTheme('dark');
    const darkBg = await page.evaluate(() => getComputedStyle(document.querySelector('.gh')).getPropertyValue('--gh-bg').trim());
    assert.ok(isDarkBg(darkBg), `手动深色在系统浅色下必须强制生效为 #0b131e，实际为 ${darkBg}`);

    // 状态 3: 跟随系统 + 系统主题变化
    await setTheme('system');
    // 系统深色
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(50);
    const sysDarkBg = await page.evaluate(() => getComputedStyle(document.querySelector('.gh')).getPropertyValue('--gh-bg').trim());
    assert.ok(isDarkBg(sysDarkBg), `跟随系统在系统深色下应自动变为 #0b131e，实际为 ${sysDarkBg}`);
    // 系统浅色
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForTimeout(50);
    const sysLightBg = await page.evaluate(() => getComputedStyle(document.querySelector('.gh')).getPropertyValue('--gh-bg').trim());
    assert.ok(isWhite(sysLightBg), `跟随系统在系统浅色下应自动变为白色，实际为 ${sysLightBg}`);

    // 保存深色模式截图
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.screenshot({ path: path.join(out, 'genomes-rice-dark-1600.png'), fullPage: false });

    // 检查深色下标题与背景对比度 (>= 4.5:1)
    const contrastPassed = await page.locator('.gh h1').evaluate(el => {
      const luminance = (value) => {
        const rgb = value.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => {
          v /= 255;
          return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        });
        return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
      };
      const fg = luminance(getComputedStyle(el).color);
      // 获取有效背景色
      let p = el.parentElement;
      let bgVal = getComputedStyle(p).backgroundColor;
      while (p && (bgVal === 'rgba(0, 0, 0, 0)' || bgVal === 'transparent')) {
        p = p.parentElement;
        if (p) bgVal = getComputedStyle(p).backgroundColor;
      }
      const bg = luminance(bgVal || 'rgb(11, 19, 30)');
      const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
      return ratio >= 4.5;
    });
    assert.ok(contrastPassed, '深色模式下标题与背景对比度必须满足 WCAG AA (>= 4.5:1)');

    // 恢复浅色媒体
    await page.emulateMedia({ colorScheme: 'light' });
    console.log('✓ Test 8 通过: 深色模式变量适配与对比度检查完全达标。\n');

    // ----------------------------------------------------
    // 测试 9: 7 种视口严格 0 横向溢出与高精度视觉截图
    // ----------------------------------------------------
    console.log('[Test 9] 校验 7 种视口 0 横向溢出并捕获最新视觉截图...');
    const viewports = [
      [1600, 900],
      [1440, 900],
      [1280, 800],
      [1024, 768],
      [768, 1024],
      [390, 844],
      [375, 812]
    ];
    const targetRoutes = ['genomes/', 'genomes/arabidopsis/', 'genomes/rice/', 'genomes/databases/'];
    const measurements = [];

    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      for (const route of targetRoutes) {
        await page.goto(`${base}/${route}`, { waitUntil: 'networkidle' });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth || document.body.scrollWidth > window.innerWidth);
        assert.equal(overflow, false, `[横向溢出失败] 页面 ${route} 在 ${width}x${height} 存在横向滚动`);

        // 在 1600 与 390 视口下保存关键截图
        if (width === 1600 || width === 390) {
          const cleanRoute = route.replaceAll('/', '-').replace(/-$/, '');
          await page.screenshot({
            path: path.join(out, `${cleanRoute}-${width}.png`),
            fullPage: false
          });
        }
        measurements.push({ route, width, height, overflow: false });
      }
    }

    // 额外截取深色模式目录页截图 (1600px)
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`${base}/genomes/`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(out, 'genomes-dark-1600.png'), fullPage: false });
    await page.emulateMedia({ colorScheme: 'light' });

    console.log(`✓ Test 9 通过: 7 种视口共 ${measurements.length} 项自适应断言全部 0 横向溢出，关键视觉截图已保存。\n`);

    assert.deepEqual(errors, [], `页面不应产生未捕获异常: ${errors.join(', ')}`);

    fs.writeFileSync(
      path.join(out, 'browser-results.json'),
      JSON.stringify(
        {
          searchCases: searchCases.length,
          speciesRoutes: allSpecies.length,
          viewports: measurements,
          manifest: true,
          clipboard: true,
          darkMode: true,
          pageErrors: errors
        },
        null,
        2
      )
    );

    console.log('🎉 全部 9 项 Plant Genome Hub V1.1 自动化回归测试 100% 验证通过！');

  } finally {
    await browser.close();
    if (serverInstance) {
      serverInstance.close();
    }
  }
}

runGenomeHubTests().catch(err => {
  console.error('测试运行异常失败:', err);
  process.exit(1);
});
