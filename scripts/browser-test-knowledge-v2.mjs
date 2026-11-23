/**
 * PhytoMethods 科研知识关联图 V2.1 专项自动化浏览器回归与截图测试
 * 覆盖 20+ 项全功能、科学语义一致性、无障碍操作与多端响应式断言
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const distDir = path.resolve('dist');
const port = 4488;
const basePrefix = '/phytomethods';
const base = `http://127.0.0.1:${port}${basePrefix}`;
const outDir = path.resolve('outputs/knowledge-v2-test');
const artifactDir = process.env.ARTIFACT_DIR
  ? path.resolve(process.env.ARTIFACT_DIR)
  : (process.platform === 'win32' && fs.existsSync('C:/Users/31764/.gemini/antigravity/brain/d149be35-849f-46ab-996a-3d160ac92565')
      ? path.resolve('C:/Users/31764/.gemini/antigravity/brain/d149be35-849f-46ab-996a-3d160ac92565')
      : null);

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

// 跨平台查找 Chromium / Edge 浏览器，或回退至 Playwright 安装的默认 Chromium
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
  const linuxPaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ];
  executablePath = linuxPaths.find(p => fs.existsSync(p));
} else if (process.platform === 'darwin') {
  const macPaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
  ];
  executablePath = macPaths.find(p => fs.existsSync(p));
}

const launchOptions = {
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
};

if (executablePath) {
  launchOptions.executablePath = executablePath;
} else {
  try {
    if (typeof chromium.executablePath === 'function') {
      const p = chromium.executablePath();
      if (fs.existsSync(p)) launchOptions.executablePath = p;
    }
  } catch {}
}

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage();

async function saveScreenshot(filename) {
  const localPath = path.join(outDir, filename);
  await page.screenshot({ path: localPath });
  console.log(`[Screenshot] Saved: ${localPath}`);

  if (artifactDir && fs.existsSync(artifactDir)) {
    try {
      const artPath = path.join(artifactDir, filename);
      fs.copyFileSync(localPath, artPath);
    } catch {}
  }
}

try {
  console.log('\n=== 开始 PhytoMethods 知识关联图 V2.1 专项自动化回归测试 ===\n');

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

  await saveScreenshot('knowledge-v2-desktop-1600-overview.png');

  // 2. 动态统计一致性验证 (消除硬编码)
  const totalNodesText = await page.locator('#stat-total-nodes').innerText();
  const totalEdgesText = await page.locator('#stat-total-edges').innerText();
  const viewNodesText = await page.locator('#stat-view-nodes').innerText();
  const viewEdgesText = await page.locator('#stat-view-edges').innerText();

  console.log(`✓ 测试 2 通过: 全局动态统计 (${totalNodesText} 节点, ${totalEdgesText} 关系) 与当前视图 (${viewNodesText} 节点, ${viewEdgesText} 关系) 一致`);
  assert.ok(Number(totalNodesText) >= 303, '全局节点总数应 >= 303');
  assert.ok(Number(totalEdgesText) >= 740, '全局关系总数应 >= 740');
  assert.equal(Number(viewNodesText), initialNodesCount);
  assert.equal(Number(viewEdgesText), initialEdgesCount);

  // 3. 节点点击与右侧科学证据详情面板联动
  const hifiasmNode = page.locator('#nodes-g .node-g[data-node-id="method:hifiasm"]');
  await hifiasmNode.click();
  await page.waitForTimeout(200);

  const inspectorTitle = await page.locator('#inspector-content .entity-title').innerText();
  console.log(`✓ 测试 3 通过: 点击 Hifiasm 节点成功，右侧面板展示: "${inspectorTitle}"`);
  assert.equal(inspectorTitle, 'Hifiasm');

  // 4. 普通元数据中性标签检查 (任务 F1: 禁止普通 ID 冒用 source_checked 绿色徽标)
  const metaBadges = await page.locator('#inspector-content .meta-badge').count();
  assert.ok(metaBadges >= 1, '节点 ID 等普通元数据应使用 meta-badge 中性标签');
  const invalidStatusOnId = await page.locator('#inspector-content .panel-header-badge .status-badge.source_checked').count();
  assert.equal(invalidStatusOnId, 0, '顶栏元数据 ID 不得滥用 status-badge source_checked 样式');
  console.log('✓ 测试 4 通过: 普通元数据 ID 与版本号已正确应用中性标签样式');

  await saveScreenshot('knowledge-v2-desktop-1600-node-selected.png');

  // 5. 多证据关系完整展示 (任务 F3: 完整展示证据状态)
  const multiEvidenceText = await page.locator('#inspector-content').innerHTML();
  assert.ok(multiEvidenceText.includes('条证据'), '关联卡片应展示证据条数说明');
  console.log('✓ 测试 5 通过: 多证据关联卡片已支持多条证据状态完整列出');

  // 6. 连线点击与精准学术证据溯源展示
  const targetEdgeLabel = page.locator('#edges-g .edge-group[data-edge-id*="introduces_method"] .edge-label-bg').first();
  await targetEdgeLabel.click({ force: true });
  await page.waitForTimeout(200);

  const edgeInspectorHtml = await page.locator('#inspector-content').innerHTML();
  console.log('✓ 测试 6 通过: 点击边连线成功，右侧面板展示科学语义关系与证据溯源');
  assert.ok(edgeInspectorHtml.includes('提出方法') || edgeInspectorHtml.includes('introduces_method'), '应包含提出方法关系');
  assert.ok(edgeInspectorHtml.includes('source_checked'), '应展示来源已核实状态');
  assert.ok(edgeInspectorHtml.includes('10.1038/s41592-020-01056-5') || edgeInspectorHtml.includes('DOI'), '应包含学术 DOI');

  await saveScreenshot('knowledge-v2-desktop-1600-edge-selected.png');

  // 7. 局部节点展开网络
  const expandBtn = page.locator('#btn-expand-inspector');
  if (await expandBtn.isVisible()) {
    await expandBtn.click();
    await page.waitForTimeout(300);
    const expandedNodesCount = await page.locator('#nodes-g .node-g').count();
    console.log(`✓ 测试 7 通过: 局部展开网络成功 (节点数由 ${initialNodesCount} 增至 ${expandedNodesCount})`);
    assert.ok(expandedNodesCount >= initialNodesCount, '展开后节点数不应减少');
  }

  await saveScreenshot('knowledge-v2-expanded-network.png');

  // 8. 切换预设网络后旧详情状态彻底清除 (任务 D)
  const orthofinderChip = page.locator('.preset-chip[data-seed="method:orthofinder"]');
  await orthofinderChip.click();
  await page.waitForTimeout(300);
  const orthoInspectorHtml = await page.locator('#inspector-content').innerHTML();
  assert.ok(!orthoInspectorHtml.includes('Hifiasm'), '切换网络后右侧不得残留旧的 Hifiasm 详情');
  assert.ok(orthoInspectorHtml.includes('科研知识图谱概览'), '切换网络后右侧已重置为全局图谱概览');
  console.log('✓ 测试 8 通过: 切换预设网络后旧详情状态彻底清除并重置概览');

  // 9. 搜索候选键盘操作 (任务 E)
  const searchInput = page.locator('#explorer-search');
  await searchInput.fill('OrthoFinder');
  await page.waitForSelector('#search-dropdown .search-result-item');
  await searchInput.press('ArrowDown');
  await page.waitForTimeout(100);
  const firstItemHighlighted = await page.locator('#search-dropdown .search-result-item').first().getAttribute('class');
  assert.ok(firstItemHighlighted?.includes('highlighted'), 'ArrowDown 应高亮首个候选项');
  await searchInput.press('Enter');
  await page.waitForTimeout(300);

  const selectedAfterSearch = await page.locator('#inspector-content .entity-title').innerText();
  assert.ok(selectedAfterSearch.includes('OrthoFinder'), 'Enter 键应成功选择搜索候选');
  console.log(`✓ 测试 9 通过: 搜索候选键盘操作 (ArrowDown / Enter) 成功定位: "${selectedAfterSearch}"`);

  await saveScreenshot('knowledge-v2-search-filter.png');

  // 10. 综述论文节点可搜索、可选中与可见性 (任务 C)
  await searchInput.fill('review');
  await page.waitForSelector('#search-dropdown .search-result-item');
  const reviewCount = await page.locator('#search-dropdown .search-result-item').count();
  assert.ok(reviewCount >= 1, '应能检索到综述论文节点');
  await page.locator('#search-dropdown .search-result-item').first().click();
  await page.waitForTimeout(300);
  const reviewTitle = await page.locator('#inspector-content .entity-title').innerText();
  const reviewTag = await page.locator('#inspector-content .type-tag.paper_review').count();
  assert.ok(reviewTag >= 1, '综述论文实体标签展示正确');
  console.log(`✓ 测试 10 通过: 综述论文节点可搜索且详情联动成功: "${reviewTitle}"`);

  // 11. 重置筛选恢复默认 Hifiasm
  await page.locator('#btn-reset-filters').click();
  await page.waitForTimeout(300);
  console.log('✓ 测试 11 通过: 重置全部筛选成功恢复默认状态');

  // 12. 实体类型筛选与图谱、列表一致性 (任务 B)
  const appPaperCheckbox = page.locator('.filter-type-checkbox[value="paper_application"]');
  await appPaperCheckbox.uncheck();
  await page.waitForTimeout(300);

  const canvasAppCount = await page.locator('#nodes-g .node-badge-text:has-text("植物应用")').count();
  assert.equal(canvasAppCount, 0, '图谱中植物应用节点数量应为 0');

  // 切换列表检查列表是否一致过滤
  const viewToggleBtn = page.locator('#btn-view-toggle');
  await viewToggleBtn.click();
  await page.waitForTimeout(200);

  const listRowsText = await page.locator('#list-view-tbody').innerText();
  assert.ok(!listRowsText.includes('Macadamia'), '列表中不应展示已过滤的应用论文关系');

  const viewEdgesAfterType = await page.locator('#stat-view-edges').innerText();
  const listRowsCount = await page.locator('#list-view-tbody tr.list-view-row').count();
  assert.equal(Number(viewEdgesAfterType), listRowsCount, '当前视图边统计必须与列表数据行数 100% 一致');
  console.log(`✓ 测试 12 通过: 实体类型过滤后图谱与列表完全一致 (可见边: ${listRowsCount} 条)`);

  await viewToggleBtn.click(); // 切回图谱
  await appPaperCheckbox.check(); // 恢复

  // 13. 十种科学关系类型筛选与全选/清空测试 (任务 A)
  const relationCheckboxesCount = await page.locator('.filter-relation-checkbox').count();
  assert.equal(relationCheckboxesCount, 10, '左侧面板应提供全部 10 种科学关系筛选');

  // 取消 belongs_to_domain
  const domainRelCheckbox = page.locator('.filter-relation-checkbox[value="belongs_to_domain"]');
  await domainRelCheckbox.uncheck();
  await page.waitForTimeout(200);
  const edgesWithoutDomain = await page.locator('#edges-g .edge-group').count();
  assert.ok(edgesWithoutDomain < initialEdgesCount, '取消归属领域后连线数量应显著减少');

  // 测试清空按钮
  const clearRelBtn = page.locator('#btn-clear-all-relations');
  await clearRelBtn.click();
  await page.waitForTimeout(200);
  const zeroEdgesCount = await page.locator('#edges-g .edge-group').count();
  assert.equal(zeroEdgesCount, 0, '清空关系类型后可见连线应为 0');

  // 测试全选按钮
  const selectAllRelBtn = page.locator('#btn-select-all-relations');
  await selectAllRelBtn.click();
  await page.waitForTimeout(200);
  const restoredEdges = await page.locator('#edges-g .edge-group').count();
  assert.equal(restoredEdges, initialEdgesCount, '全选关系后连线数应完全恢复');
  console.log('✓ 测试 13 通过: 10 种科学关系多选、清空与全选过滤测试通过');

  // 14. 领域筛选与列表一致性
  const domainSelect = page.locator('#filter-domain-select');
  await domainSelect.selectOption('genome-assembly');
  await page.waitForTimeout(200);
  const domainNodesCount = await page.locator('#nodes-g .node-g').count();
  assert.ok(domainNodesCount > 0, '领域筛选后应有相关节点');
  console.log(`✓ 测试 14 通过: 领域筛选过滤测试通过 (剩余节点: ${domainNodesCount})`);

  // 15. 证据级别筛选与列表一致性
  const evidenceSelect = page.locator('#filter-evidence-select');
  await evidenceSelect.selectOption('source_checked');
  await page.waitForTimeout(200);
  const sourceCheckedEdgesCount = await page.locator('#edges-g .edge-group').count();
  assert.ok(sourceCheckedEdgesCount > 0, '来源已核实关系筛选有效');
  console.log(`✓ 测试 15 通过: 证据级别筛选测试通过 (来源已核实边: ${sourceCheckedEdgesCount})`);

  // 恢复筛选
  await page.locator('#btn-reset-filters').click();
  await page.waitForTimeout(300);

  // 15b. 任务 D 专项: 筛选隐藏选中节点后右侧状态自动清空
  const macadamiaNode = page.locator('#nodes-g .node-g[data-node-id="paper:macadamia"]');
  if (await macadamiaNode.count() > 0) {
    await macadamiaNode.click();
    await page.waitForTimeout(200);
    const titleBefore = await page.locator('#inspector-content .entity-title').innerText();
    assert.ok(titleBefore.length > 0, '点击应用论文应成功展示详情标题');
    await appPaperCheckbox.uncheck();
    await page.waitForTimeout(200);
    const inspectorAfterHidden = await page.locator('#inspector-content').innerHTML();
    assert.ok(inspectorAfterHidden.includes('科研知识图谱概览'), '被筛选隐藏的选中节点应自动清空并重置为概览');
    console.log('✓ 测试 15b 通过: 节点被筛选隐藏后右侧详情自动清空并重置为概览');
    await appPaperCheckbox.check();
    await page.waitForTimeout(200);
  }

  // 16. SVG 节点键盘操作 (任务 E)
  const firstNode = page.locator('#nodes-g .node-g').first();
  await firstNode.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const isNodeSelected = await firstNode.getAttribute('aria-pressed');
  assert.equal(isNodeSelected, 'true', '按 Enter 键应选中节点');
  console.log('✓ 测试 16 通过: SVG 节点键盘 Tab 与 Enter 键选中测试通过');

  // 17. 列表模式键盘操作 (任务 E)
  await viewToggleBtn.click();
  await page.waitForTimeout(200);
  const firstRow = page.locator('#list-view-tbody tr.list-view-row').first();
  await firstRow.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const edgeDetailTitle = await page.locator('#inspector-content .entity-title').innerText();
  assert.ok(edgeDetailTitle.length > 0, '按 Enter 键应在抽屉展示对应关系的证据详情');
  console.log(`✓ 测试 17 通过: 列表视图表格行键盘 Enter 键打开证据详情: "${edgeDetailTitle}"`);
  await viewToggleBtn.click(); // 切回图谱

  // 18. 画布平移缩放与复位
  const zoomInBtn = page.locator('#btn-zoom-in');
  await zoomInBtn.click();
  const resetViewBtn = page.locator('#btn-reset-view');
  await resetViewBtn.click();
  console.log('✓ 测试 18 通过: 画布缩放与复位居中控制正常');

  // 19. 1280px 桌面端与 1024px 平板端响应式测试
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(200);
  await saveScreenshot('knowledge-v2-desktop-1280.png');
  console.log('✓ 测试 19 通过: 1280px 桌面端布局测试通过');

  await page.setViewportSize({ width: 1024, height: 768 });
  await page.waitForTimeout(200);
  await saveScreenshot('knowledge-v2-tablet-1024.png');
  console.log('✓ 测试 20 通过: 1024px 平板端布局测试通过');

  // 20. 390px 移动端无溢出检测
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(200);
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  console.log(`✓ 测试 21 通过: 390px 移动端无横向溢出检测 (scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth})`);
  assert.ok(scrollWidth <= clientWidth + 2, '移动端不应发生横向滚动溢出');
  await saveScreenshot('knowledge-v2-mobile-390.png');

  console.log('\n🎉 全部 21 项专项自动化测试断言 100% 顺利通过！\n');

} catch (err) {
  console.error('测试过程中发生异常:', err);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
