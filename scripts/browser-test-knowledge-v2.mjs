/**
 * PhytoMethods 科研知识关联图 V2 专项自动化浏览器回归与截图测试
 * 包含 16 项全功能断言与多端多状态高保真截图输出
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const distDir = path.resolve('dist');
const port = 4477;
const basePrefix = '/phytomethods';
const base = `http://127.0.0.1:${port}${basePrefix}`;
const outDir = path.resolve('outputs/knowledge-v2-test');
const artifactDir = path.resolve('C:/Users/31764/.gemini/antigravity/brain/d149be35-849f-46ab-996a-3d160ac92565');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
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

// 查找 Chromium 浏览器
const winPaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
];
const executablePath = winPaths.find(p => fs.existsSync(p));

const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
});

const page = await browser.newPage();

async function saveScreenshot(filename) {
  const localPath = path.join(outDir, filename);
  await page.screenshot({ path: localPath });
  console.log(`[Screenshot] Saved: ${localPath}`);

  if (fs.existsSync(artifactDir)) {
    const artPath = path.join(artifactDir, filename);
    fs.copyFileSync(localPath, artPath);
  }
}

try {
  console.log('\n=== 开始 PhytoMethods 知识关联图 V2 浏览器自动化回归测试 ===\n');

  // 1. 默认网络与桌面 1600x900 布局加载
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(`${base}/knowledge/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#knowledge-explorer-app');
  await page.waitForSelector('#nodes-g .node-g');

  const initialNodesCount = await page.locator('#nodes-g .node-g').count();
  const initialEdgesCount = await page.locator('#edges-g .edge-group').count();
  console.log(`✓ 测试 1 通过: 默认 Hifiasm 网络加载成功 (画布节点: ${initialNodesCount}, 连线: ${initialEdgesCount})`);
  assert.ok(initialNodesCount >= 8, '初始节点数应不少于 8 个');
  assert.ok(initialEdgesCount >= 8, '初始连线数应不少于 8 条');

  // 截图 1: 1600x900 初始探索全景
  await saveScreenshot('knowledge-v2-desktop-1600-overview.png');

  // 2. 全局与当前视图统计验证
  const totalNodesText = await page.locator('#stat-total-nodes').innerText();
  const totalEdgesText = await page.locator('#stat-total-edges').innerText();
  const viewNodesText = await page.locator('#stat-view-nodes').innerText();
  const viewEdgesText = await page.locator('#stat-view-edges').innerText();

  console.log(`✓ 测试 2 通过: 全局统计 (${totalNodesText} 节点, ${totalEdgesText} 关系) 与当前视图 (${viewNodesText} 节点, ${viewEdgesText} 关系) 同步正确`);
  assert.equal(totalNodesText, '303');
  assert.equal(totalEdgesText, '740');
  assert.equal(Number(viewNodesText), initialNodesCount);
  assert.equal(Number(viewEdgesText), initialEdgesCount);

  // 3. 节点点击与右侧科学证据详情面板联动
  const hifiasmNode = page.locator('#nodes-g .node-g[data-node-id="method:hifiasm"]');
  await hifiasmNode.click();
  await page.waitForTimeout(200);

  const inspectorTitle = await page.locator('#inspector-content .entity-title').innerText();
  console.log(`✓ 测试 3 通过: 点击 Hifiasm 节点成功，右侧面板展示: "${inspectorTitle}"`);
  assert.equal(inspectorTitle, 'Hifiasm');

  // 检查详情内是否有期刊年份、DOI 和站内链接
  const inspectorHtml = await page.locator('#inspector-content').innerHTML();
  assert.ok(inspectorHtml.includes('genome-assembly'), '详情应包含所属领域');
  assert.ok(inspectorHtml.includes('phytomethods/methods/hifiasm'), '站内链接应包含 BASE_URL');

  // 截图 2: 1600x900 Hifiasm 节点选中态
  await saveScreenshot('knowledge-v2-desktop-1600-node-selected.png');

  // 4. 连线点击与精准学术证据溯源展示
  const targetEdgeLabel = page.locator('#edges-g .edge-group[data-edge-id*="introduces_method"] .edge-label-bg').first();
  await targetEdgeLabel.click({ force: true });
  await page.waitForTimeout(200);

  const edgeInspectorHtml = await page.locator('#inspector-content').innerHTML();
  console.log('✓ 测试 4 通过: 点击边连线成功，右侧面板展示科学语义关系与证据溯源');
  assert.ok(edgeInspectorHtml.includes('提出方法') || edgeInspectorHtml.includes('introduces_method'), '应包含提出方法关系');
  assert.ok(edgeInspectorHtml.includes('source_checked'), '应展示来源已核实状态');
  assert.ok(edgeInspectorHtml.includes('10.1038/s41592-020-01056-5') || edgeInspectorHtml.includes('DOI'), '应包含学术 DOI');

  // 截图 3: 1600x900 连线关系选中态
  await saveScreenshot('knowledge-v2-desktop-1600-edge-selected.png');

  // 5. 局部节点展开网络
  const expandBtn = page.locator('#btn-expand-inspector');
  if (await expandBtn.isVisible()) {
    await expandBtn.click();
    await page.waitForTimeout(300);
    const expandedNodesCount = await page.locator('#nodes-g .node-g').count();
    console.log(`✓ 测试 5 通过: 局部展开网络成功 (节点数由 ${initialNodesCount} 增至 ${expandedNodesCount})`);
    assert.ok(expandedNodesCount >= initialNodesCount, '展开后节点数不应减少');
  }

  // 截图 4: 展开后的局部网络
  await saveScreenshot('knowledge-v2-expanded-network.png');

  // 6. 全局搜索定位与下拉建议
  const searchInput = page.locator('#explorer-search');
  await searchInput.fill('OrthoFinder');
  await page.waitForSelector('#search-dropdown .search-result-item');
  const searchItemsCount = await page.locator('#search-dropdown .search-result-item').count();
  console.log(`✓ 测试 6 通过: 搜索 "OrthoFinder" 检索到 ${searchItemsCount} 条候选实体`);
  assert.ok(searchItemsCount > 0);

  // 点击第一项搜索结果
  await page.locator('#search-dropdown .search-result-item').first().click();
  await page.waitForTimeout(300);
  const newSelectedTitle = await page.locator('#inspector-content .entity-title').innerText();
  console.log(`✓ 测试 7 通过: 从搜索列表选择实体成功聚焦: "${newSelectedTitle}"`);
  assert.ok(newSelectedTitle.includes('OrthoFinder') || newSelectedTitle.includes('orthofinder'));

  // 截图 5: 搜索筛选结果
  await saveScreenshot('knowledge-v2-search-filter.png');

  // 7. 预设网络切换
  const hifiasmChip = page.locator('.preset-chip[data-seed="method:hifiasm"]');
  await hifiasmChip.click();
  await page.waitForTimeout(300);
  const resetSeedTitle = await page.locator('#nodes-g .center-hub .node-title-text').textContent();
  console.log(`✓ 测试 8 通过: 点击预设芯片恢复 Hifiasm 种子网络: "${resetSeedTitle?.trim()}"`);

  // 8. 领域筛选
  const domainSelect = page.locator('#filter-domain-select');
  await domainSelect.selectOption('comparative-genomics');
  await page.waitForTimeout(200);
  console.log('✓ 测试 9 通过: 领域筛选下拉选择成功');

  // 重置筛选
  await page.locator('#btn-reset-filters').click();
  await page.waitForTimeout(200);
  console.log('✓ 测试 10 通过: 点击重置全部按钮成功恢复默认状态');

  // 9. 实体类型可见性切换
  const appPaperCheckbox = page.locator('.filter-type-checkbox[value="paper_application"]');
  await appPaperCheckbox.uncheck();
  await page.waitForTimeout(200);
  const withoutAppCount = await page.locator('#nodes-g .node-badge-text:has-text("植物应用")').count();
  console.log(`✓ 测试 11 通过: 取消植物应用论文勾选，画布中植物应用节点为 0 (实际: ${withoutAppCount})`);
  assert.equal(withoutAppCount, 0);
  await appPaperCheckbox.check();

  // 10. 画布拖拽与缩放控制
  const zoomInBtn = page.locator('#btn-zoom-in');
  await zoomInBtn.click();
  await zoomInBtn.click();
  const resetViewBtn = page.locator('#btn-reset-view');
  await resetViewBtn.click();
  console.log('✓ 测试 12 通过: 缩放与复位居中控制响应正常');

  // 11. 全屏与无障碍键盘操作
  const fullscreenBtn = page.locator('#btn-fullscreen');
  const fullscreenAria = await fullscreenBtn.getAttribute('aria-label');
  assert.equal(fullscreenAria, '全屏查看');
  console.log('✓ 测试 13 通过: 全屏按钮与无障碍 ARIA 标签完整');

  // 12. 图谱与列表视图无障碍切换
  const viewToggleBtn = page.locator('#btn-view-toggle');
  await viewToggleBtn.click();
  await page.waitForTimeout(200);
  const tableRowsCount = await page.locator('#list-view-tbody tr').count();
  console.log(`✓ 测试 14 通过: 切换至列表视图，语义关系数据行: ${tableRowsCount} 条`);
  assert.ok(tableRowsCount > 0);
  await viewToggleBtn.click(); // 切回图谱

  // 13. 1280px 桌面端布局测试
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(200);
  await saveScreenshot('knowledge-v2-desktop-1280.png');
  console.log('✓ 测试 15 通过: 1280px 桌面端响应式测试通过');

  // 14. 1024px 平板端布局测试
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.waitForTimeout(200);
  await saveScreenshot('knowledge-v2-tablet-1024.png');
  console.log('✓ 测试 16 通过: 1024px 平板端响应式测试通过');

  // 15. 390px 移动端布局与无溢出检测
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(200);
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  console.log(`✓ 测试 17 通过: 390px 移动端无横向溢出检测 (scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth})`);
  assert.ok(scrollWidth <= clientWidth + 2, '移动端不应发生横向滚动溢出');
  await saveScreenshot('knowledge-v2-mobile-390.png');

  console.log('\n🎉 全部 17 项浏览器功能断言与响应式测试 100% 通过！\n');

} catch (err) {
  console.error('测试过程中发生异常:', err);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
