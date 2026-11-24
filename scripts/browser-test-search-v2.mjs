/**
 * PhytoMethods 全站搜索 V2 纯文字结果设计与学术高密度体验测试套件
 * 
 * 校验目标：
 * 1. 结果纯文字列表：无缩略图、Logo、装饰图标及占位区域 (img 与 .pagefind-ui__result-thumb 数量为 0)
 * 2. 结构完整性：标题、面包屑 (所属领域/来源)、2-3 行摘要、右侧详情入口 (查看详情 →)
 * 3. 关键词浅绿色高亮：<mark> 标签为柔和浅绿色背景 (#dcfce7 / rgb(220, 252, 231)) 与深绿文字
 * 4. 核心关键词召回与检索正确性：「泛基因组」「GWAS」「Hifiasm」「OrthoFinder」
 * 5. 资源类型筛选胶囊：全部、研究领域、专题、方法与工具、文献、教程、路线图 交互与即时计数
 * 6. 同义词与缩写关联：同义词提示卡展开与免刷新填入
 * 7. 多端响应式与 0 横向溢出断言：涵盖 1600x900 至 375x812 共 7 种视口
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
const outputsDir = path.join(rootDir, 'outputs', 'search-v2-test');

if (!fs.existsSync(outputsDir)) {
  fs.mkdirSync(outputsDir, { recursive: true });
}

function startStaticServer(port = 0) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.wasm': 'application/wasm',
    '.pf_meta': 'application/octet-stream',
    '.pf_fragment': 'application/octet-stream',
    '.pf_index': 'application/octet-stream'
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
      res.end(`404 Not Found: ${req.url}`);
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
    server.listen(port, '127.0.0.1', () => {
      const assignedPort = server.address().port;
      resolve({ server, url: `http://127.0.0.1:${assignedPort}/phytomethods` });
    });
    server.on('error', reject);
  });
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth ||
           document.body.scrollWidth > window.innerWidth;
  });
  assert.strictEqual(overflow, false, `[横向溢出检测失败] 页面在 ${label} 产生横向溢出滚动条`);
}

async function runSearchV2Tests() {
  console.log('=== 开始 PhytoMethods 全站搜索 V2 纯文字结果设计自动化回归测试 ===\n');

  const { server, url } = await startStaticServer();
  console.log(`[Test Server] 启动就绪: ${url}\n`);

  const executablePath = process.env.BROWSER_PATH || 
    process.env.EDGE_PATH || 
    (fs.existsSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe') ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : undefined);

  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure()?.errorText));

  try {
    // ----------------------------------------------------
    // 测试 1: 页面初始状态校验
    // ----------------------------------------------------
    console.log('[Test 1] 校验初始状态元素与排版...');
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(`${url}/search/`, { waitUntil: 'domcontentloaded' });

    const titleText = await page.locator('h1').textContent();
    assert.ok(titleText?.includes('全站搜索'), '主标题应包含全站搜索');

    const overline = await page.locator('.nav-overline').textContent();
    assert.strictEqual(overline?.trim(), 'SITE SEARCH', '顶部标记应为 SITE SEARCH');

    const searchInput = page.locator('.pagefind-ui__search-input');
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    assert.ok(await searchInput.count() === 1, '应渲染 PagefindUI 搜索框');

    const suggestions = page.locator('.suggestion-pill');
    assert.ok(await suggestions.count() >= 6, '未输入时应提供热门关键词快速检索胶囊');
    console.log('✓ Test 1 通过: 页面初始状态完整正常。\n');

    // 辅助函数：执行关键词搜索并等待结果渲染
    async function searchKeyword(kw) {
      await searchInput.click();
      await searchInput.fill(kw);
      await searchInput.dispatchEvent('input');
      // 等待结果渲染并由 MutationObserver 进行 DOM 增强
      await page.waitForSelector('.pagefind-ui__result', { timeout: 15000 });
      await page.waitForTimeout(600);
    }

    // ----------------------------------------------------
    // 测试 2: 关键词「泛基因组」检索与纯文字学术设计断言
    // ----------------------------------------------------
    console.log('[Test 2] 校验关键词「泛基因组」检索与纯文字学术排版规范...');
    await searchKeyword('泛基因组');

    // 1. 结果数量与统计文案
    const messageText = await page.locator('.pagefind-ui__message').textContent();
    console.log(`  -> 统计文案: ${messageText?.trim()}`);
    assert.ok(messageText?.includes('泛基因组'), '统计文案应包含搜索关键词');
    assert.ok(/找到\s*\d+\s*个与/.test(messageText || ''), '文案格式应符合规范：“找到 X 个与 “泛基因组” 相关的结果”');

    const results = page.locator('.pagefind-ui__result');
    const resultCount = await results.count();
    assert.ok(resultCount > 0, '「泛基因组」应返回至少一条结果');
    console.log(`  -> 当前结果条数: ${resultCount}`);

    // 2. 严格无图片节点断言
    const imageCount = await page.evaluate(() => {
      const resultsEl = document.querySelector('.pagefind-ui__results');
      if (!resultsEl) return 0;
      return resultsEl.querySelectorAll('img, .pagefind-ui__result-thumb').length;
    });
    assert.strictEqual(imageCount, 0, '【关键要求】搜索结果列表中严禁存在任何 img 或 .pagefind-ui__result-thumb 图片/缩略图节点');

    // 3. 单条结果项结构校验 (标题、查看详情按钮、面包屑、摘要)
    const firstResult = results.first();
    const hasHeaderRow = await firstResult.locator('.result-header-row').count();
    assert.strictEqual(hasHeaderRow, 1, '结果项应包含 .result-header-row 标题操作容器');

    const titleEl = firstResult.locator('.pagefind-ui__result-title');
    assert.ok(await titleEl.count() === 1, '结果项应包含标题');

    const detailBtn = firstResult.locator('.result-details-link');
    assert.ok(await detailBtn.count() === 1, '结果项右侧应包含“查看详情 →”入口');
    const detailText = await detailBtn.textContent();
    assert.ok(detailText?.includes('查看详情'), '详情按钮文字应为查看详情');

    const breadcrumbs = firstResult.locator('.result-meta-breadcrumbs');
    assert.ok(await breadcrumbs.count() === 1, '结果项第二行应包含来源/领域面包屑');
    const bcText = await breadcrumbs.textContent();
    assert.ok(bcText?.includes('/'), '面包屑应包含层级分隔符 /');
    console.log(`  -> 第一条结果面包屑示例: ${bcText?.trim()}`);

    const excerpt = firstResult.locator('.pagefind-ui__result-excerpt');
    assert.ok(await excerpt.count() === 1, '结果项第三行应包含简短摘要');

    // 4. 浅绿色关键词高亮断言 (<mark>)
    const markEl = firstResult.locator('mark').first();
    assert.ok(await markEl.count() === 1, '结果中应包含关键词高亮 mark 标签');
    const markStyles = await markEl.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });
    console.log(`  -> mark 样式: bg=${markStyles.bg}, color=${markStyles.color}`);
    // rgb(220, 252, 231) 对应 #dcfce7
    assert.ok(
      markStyles.bg.includes('220, 252, 231') || markStyles.bg.includes('dcfce7'),
      '高亮关键词背景色必须为浅绿色 (#dcfce7 / rgb(220, 252, 231))'
    );
    // rgb(20, 83, 45) 对应 #14532d
    assert.ok(
      markStyles.color.includes('20, 83, 45') || markStyles.color.includes('14532d'),
      '高亮关键词文字颜色必须为深绿色 (#14532d / rgb(20, 83, 45))'
    );

    // 5. 截图保存 1600x900 状态
    await page.screenshot({ path: path.join(outputsDir, 'search-v2-pangenome-1600x900.png'), fullPage: false });
    console.log('✓ Test 2 通过: 「泛基因组」检索与纯文字学术目录样式完全达标。\n');

    // ----------------------------------------------------
    // 测试 3: 资源类型筛选胶囊栏交互验证
    // ----------------------------------------------------
    console.log('[Test 3] 校验资源类型筛选胶囊栏实时过滤与即时统计更新...');
    const filterPills = page.locator('.search-filter-pills .filter-pill');
    assert.ok(await filterPills.count() >= 7, '应存在全部、研究领域、专题、方法与工具、文献、教程、路线图 7 类筛选胶囊');

    // 点击「专题」胶囊
    const topicPill = page.locator('.filter-pill[data-type="topic"]');
    await topicPill.click();
    await page.waitForTimeout(300);

    const topicVisibleCount = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.pagefind-ui__result'));
      return items.filter(it => window.getComputedStyle(it).display !== 'none').length;
    });
    console.log(`  -> 切换到「专题」筛选后可见条数: ${topicVisibleCount}`);
    assert.ok(topicVisibleCount > 0, '「专题」筛选后应有可见专题条目');
    assert.ok(topicVisibleCount <= resultCount, '筛选后的数量应小于或等于总数量');

    // 校验所有可见条目确实是 topic
    const allAreTopics = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.pagefind-ui__result'));
      const visible = items.filter(it => window.getComputedStyle(it).display !== 'none');
      return visible.every(it => it.getAttribute('data-resource-type') === 'topic');
    });
    assert.strictEqual(allAreTopics, true, '点击「专题」筛选后，所有可见条目类型必须全为 topic');

    // 切换回「全部」
    const allPill = page.locator('.filter-pill[data-type="all"]');
    await allPill.click();
    await page.waitForTimeout(300);
    console.log('✓ Test 3 通过: 资源类型筛选胶囊即时前端过滤工作正常。\n');

    // ----------------------------------------------------
    // 测试 4: 关键词「GWAS」检索与同义词智能扩展
    // ----------------------------------------------------
    console.log('[Test 4] 校验关键词「GWAS」检索及同义词免刷新扩展交互...');
    await searchKeyword('GWAS');
    const gwasResults = await page.locator('.pagefind-ui__result').count();
    assert.ok(gwasResults > 0, '「GWAS」应返回有效结果');

    // 检查同义词提示模块
    const synonymBox = page.locator('#synonym-hint');
    await synonymBox.waitFor({ state: 'visible', timeout: 3000 });
    const synonymText = await synonymBox.textContent();
    assert.ok(synonymText?.includes('全基因组关联分析'), '输入 GWAS 应提示同义词「全基因组关联分析」');

    // 测试点击同义词链接自动填入并重新搜索
    const synonymLink = page.locator('.synonym-link[data-term="全基因组关联分析"]');
    await synonymLink.click();
    await page.waitForTimeout(800);
    const newInputValue = await searchInput.inputValue();
    assert.strictEqual(newInputValue, '全基因组关联分析', '点击同义词应自动填入输入框');
    console.log('✓ Test 4 通过: 「GWAS」与中英文同义词免刷新检索机制工作正常。\n');

    // ----------------------------------------------------
    // 测试 5: 关键词「Hifiasm」与「OrthoFinder」检索
    // ----------------------------------------------------
    console.log('[Test 5] 校验「Hifiasm」与「OrthoFinder」学术工具检索...');
    await searchKeyword('Hifiasm');
    const hifiasmCount = await page.locator('.pagefind-ui__result').count();
    assert.ok(hifiasmCount > 0, '「Hifiasm」应返回有效结果');

    await searchKeyword('OrthoFinder');
    const orthofinderCount = await page.locator('.pagefind-ui__result').count();
    assert.ok(orthofinderCount > 0, '「OrthoFinder」应返回有效结果');
    console.log('✓ Test 5 通过: 「Hifiasm」与「OrthoFinder」工具正确召回且纯文字排版一致。\n');

    // ----------------------------------------------------
    // 测试 6: 多端视口自适应与 0 横向溢出保护
    // ----------------------------------------------------
    console.log('[Test 6] 校验 7 种视口下纯文字列表无横向溢出...');
    const viewports = [
      { width: 1600, height: 900, name: '1600x900 (Large Desktop)' },
      { width: 1440, height: 900, name: '1440x900 (Desktop)' },
      { width: 1280, height: 800, name: '1280x800 (Small Desktop)' },
      { width: 1024, height: 768, name: '1024x768 (Tablet Landscape)' },
      { width: 768, height: 1024, name: '768x1024 (Tablet Portrait)' },
      { width: 390, height: 844, name: '390x844 (Mobile iPhone)' },
      { width: 375, height: 812, name: '375x812 (Compact Mobile)' }
    ];

    // 在保持「泛基因组」检索状态下检查各个视口
    await searchKeyword('泛基因组');

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(200);
      await assertNoHorizontalOverflow(page, vp.name);

      // 在移动端视口 (390x844) 断言无图片，并截屏保存
      if (vp.width === 390) {
        const mobileImgCount = await page.evaluate(() => {
          return document.querySelectorAll('.pagefind-ui__results img, .pagefind-ui__result-thumb').length;
        });
        assert.strictEqual(mobileImgCount, 0, '移动端搜索结果中亦严禁出现任何缩略图');
        await page.screenshot({ path: path.join(outputsDir, 'search-v2-mobile-390x844.png'), fullPage: false });
      }
    }
    console.log('✓ Test 6 通过: 7 种屏幕视口均实现严格 0 横向溢出，移动端纯文字体验优秀。\n');

    console.log('🎉 全部 6 项核心自动化测试均 100% 验证通过！');

  } finally {
    await browser.close();
    server.close();
  }
}

runSearchV2Tests().catch((err) => {
  console.error('测试运行异常失败:', err);
  process.exit(1);
});
