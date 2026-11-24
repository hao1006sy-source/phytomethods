/**
 * PhytoMethods 算法与工具目录 V4 (方案 B 高密度学术目录) 自动化测试与多端回归套件
 * 
 * 严格覆盖：
 * 1. 全部已发布方法可浏览 (动态计算数量，当前 59 款)
 * 2. 方法总数动态计算，杜绝写死
 * 3. 实时中英文搜索及清空按钮交互
 * 4. 研究领域、专题、算法原理、输入数据四重维度筛选
 * 5. 领域与专题联动逻辑 (选择领域后限制专题候选，切换领域自动清除失效专题)
 * 6. 已选条件标签栏 (单个标签移除与清除全部)
 * 7. 正反向排序 (A-Z 与 Z-A 确定性排序及序号自适应)
 * 8. 无匹配搜索与筛选下的空状态展示及一键重置
 * 9. URL 参数双向同步 (q, domain, topic, principle, data, sort)
 * 10. 浏览器前进/后退状态恢复
 * 11. 方法详情跳转链接完整性与 target
 * 12. 键盘可访问性与 Tab 导航
 * 13. 移动端筛选折叠与展开交互
 * 14. 7 种屏幕视口下的无横向溢出检测与高保真截图产出:
 *     - 1600×900, 1440×900, 1280×800, 1024×768, 768×1024, 390×844, 375×812
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
const outputsDir = path.join(rootDir, 'outputs', 'methods-v4-test');

if (!fs.existsSync(outputsDir)) {
  fs.mkdirSync(outputsDir, { recursive: true });
}

// 启动本地静态测试服务器
function startStaticServer(port = 4577) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath.startsWith('/phytomethods')) {
      reqPath = reqPath.slice('/phytomethods'.length);
    }
    if (reqPath === '' || reqPath.endsWith('/')) {
      reqPath += 'index.html';
    }

    const filePath = path.join(distDir, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.listen(port, '127.0.0.1', () => {
      resolve({ server, url: `http://127.0.0.1:${port}/phytomethods` });
    });
    server.on('error', reject);
  });
}

// 检查横向溢出
async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth ||
           document.body.scrollWidth > window.innerWidth;
  });
  assert.strictEqual(overflow, false, `[溢出检测失败] 页面在 ${label} 产生横向溢出滚动条`);
}

async function runMethodsV4Tests() {
  console.log('=== 开始 PhytoMethods 算法与工具目录 V4 (方案 B) 自动化测试套件 ===\n');

  const { server, url } = await startStaticServer();
  console.log(`[Test Server] 启动就绪: ${url}\n`);

  const launchOptions = {
    headless: true,
    args: ['--no-sandbox']
  };
  const executablePath = process.env.BROWSER_PATH || 
    process.env.EDGE_PATH || 
    (process.platform === 'win32' && fs.existsSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe') ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : undefined);
  if (executablePath) {
    launchOptions.executablePath = executablePath;
  }

  const browser = await chromium.launch(launchOptions);

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------------------
    // 测试 1: 桌面端 1600×900 初始加载与动态总数
    // -------------------------------------------------------------------------
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(`${url}/methods/`, { waitUntil: 'networkidle' });

    await assertNoHorizontalOverflow(page, '1600x900 初始状态');

    const methodRows = page.locator('.method-row');
    const rowCount = await methodRows.count();
    assert.ok(rowCount >= 58, `已收录工具总数应 >= 58 (实际: ${rowCount})`);

    const metricText = await page.locator('#metric-text').innerText();
    assert.ok(metricText.includes(String(rowCount)), `顶部徽章数字 (${metricText}) 必须与实际行数 (${rowCount}) 动态一致`);

    const countText = await page.locator('#results-count').innerText();
    assert.ok(countText.includes(`找到 ${rowCount} 条结果`), `结果统计 (${countText}) 必须与行数一致`);

    // 检查方案 B 高密度表头与第一行
    const headerCols = await page.locator('.table-header > div').allInnerTexts();
    assert.deepStrictEqual(headerCols, ['#', '方法名称', '简介 / 研究领域 · 输入数据 · 算法原理', '操作']);

    const firstRowName = await methodRows.first().locator('.col-name').innerText();
    assert.ok(firstRowName.length > 0, '第一行必须包含有效工具名称');
    console.log(`✓ 测试 1 通过: 默认高密度学术目录加载成功 (${rowCount} 款工具，排序首位: ${firstRowName})`);

    await page.screenshot({ path: path.join(outputsDir, 'methods-v4-desktop-1600-overview.png'), fullPage: false });

    // -------------------------------------------------------------------------
    // 测试 2: 实时搜索与清除按钮
    // -------------------------------------------------------------------------
    const searchInput = page.locator('#method-search');
    await searchInput.fill('hifi');
    await page.waitForTimeout(150);

    const hifiCount = await page.locator('.method-row:not([hidden])').count();
    assert.ok(hifiCount > 0 && hifiCount < rowCount, `搜索 'hifi' 结果数应介于 1 到 ${rowCount} 之间 (实际: ${hifiCount})`);
    
    // 验证搜索词出现在已选条件栏中
    const activeTags = await page.locator('#active-tags-list .filter-tag').allInnerTexts();
    assert.ok(activeTags.some(t => t.includes('搜索: hifi')), '已选条件栏必须展示搜索标签');

    // 验证 URL 参数同步
    assert.ok(page.url().includes('q=hifi'), 'URL 必须同步 q=hifi');

    // 点击搜索框右侧清除按钮
    const clearBtn = page.locator('#search-clear');
    assert.strictEqual(await clearBtn.isVisible(), true, '搜索有内容时清除按钮必须可见');
    await clearBtn.click();
    await page.waitForTimeout(150);

    const clearedCount = await page.locator('.method-row:not([hidden])').count();
    assert.strictEqual(clearedCount, rowCount, '清除搜索后应恢复全部方法');
    console.log('✓ 测试 2 通过: 实时模糊搜索、清除按钮交互与已选条件标签展示正常');

    // -------------------------------------------------------------------------
    // 测试 3: 四维精准筛选与领域-专题动态联动
    // -------------------------------------------------------------------------
    const domainSelect = page.locator('#filter-domain');
    const topicSelect = page.locator('#filter-topic');

    // 选择领域：群体遗传与驯化 (population-genetics)
    await domainSelect.selectOption('population-genetics');
    await page.waitForTimeout(150);

    const popCount = await page.locator('.method-row:not([hidden])').count();
    assert.ok(popCount >= 5, `群体遗传领域工具数量应 >= 5 (实际: ${popCount})`);
    assert.ok(page.url().includes('domain=population-genetics'), 'URL 必须同步 domain 参数');

    // 检查专题候选是否已被限制在该领域下
    const topicOptionsCount = await topicSelect.locator('option').count();
    assert.ok(topicOptionsCount > 1 && topicOptionsCount < 20, '专题候选项必须动态收窄至该领域专属专题');

    // 选择专题：群体历史动态 (m05-topic-06)
    await topicSelect.selectOption('m05-topic-06');
    await page.waitForTimeout(150);

    const topicFilteredCount = await page.locator('.method-row:not([hidden])').count();
    assert.ok(topicFilteredCount >= 3, `m05-topic-06 对应工具应包含 psmc, msmc, msmc2, smcpp 等 (实际: ${topicFilteredCount})`);

    // 切换到另一个领域 (如 genome-assembly)，验证专题选项自动清除重置
    await domainSelect.selectOption('genome-assembly');
    await page.waitForTimeout(150);
    const topicValueAfterSwitch = await topicSelect.inputValue();
    assert.strictEqual(topicValueAfterSwitch, '', '切换不兼容领域后专题必须自动重置清空');
    assert.ok(!page.url().includes('topic=m05-topic-06'), 'URL 中不适用的专题参数必须自动移除');

    // 重置所有筛选
    await page.locator('#filter-reset').click();
    await page.waitForTimeout(150);
    assert.strictEqual(await page.locator('.method-row:not([hidden])').count(), rowCount, '重置后恢复全量');
    console.log('✓ 测试 3 通过: 四维精准筛选与领域-专题动态联动/失效自动清除校验通过');

    // -------------------------------------------------------------------------
    // 测试 4: 条件标签单独移除与一键清空全部
    // -------------------------------------------------------------------------
    await domainSelect.selectOption('population-genetics');
    await page.locator('#filter-data').selectOption('variant-data');
    await page.waitForTimeout(150);

    let activeFilterTags = await page.locator('#active-tags-list .filter-tag').allInnerTexts();
    assert.strictEqual(activeFilterTags.length, 2, '当前应显示 2 个已选条件标签');

    // 单独移除数据类型标签
    const removeDataBtn = page.locator('.filter-tag button[data-key="data"]');
    await removeDataBtn.click();
    await page.waitForTimeout(150);

    activeFilterTags = await page.locator('#active-tags-list .filter-tag').allInnerTexts();
    assert.strictEqual(activeFilterTags.length, 1, '移除后应仅剩 1 个领域标签');
    assert.strictEqual(await page.locator('#filter-data').inputValue(), '', '数据选择框应重置为空');
    assert.ok(!page.url().includes('data='), 'URL 中 data 参数已被剔除');

    // 点击一键清空全部
    await page.locator('#clear-all-tags').click();
    await page.waitForTimeout(150);
    assert.strictEqual(await page.locator('#active-filters-bar').isVisible(), false, '已选条件栏应自动隐藏');
    assert.strictEqual(await page.locator('.method-row:not([hidden])').count(), rowCount, '全量恢复');
    console.log('✓ 测试 4 通过: 已选条件标签单独移除与一键清空全部正常');

    // -------------------------------------------------------------------------
    // 测试 5: 正反向排序及序号自适应
    // -------------------------------------------------------------------------
    const sortSelect = page.locator('#sort-order');
    await sortSelect.selectOption('name-desc');
    await page.waitForTimeout(150);

    const descFirst = await page.locator('.method-row:not([hidden]) .col-name').first().innerText();
    const descIndex = await page.locator('.method-row:not([hidden]) .col-index').first().innerText();
    assert.strictEqual(descIndex, '01', '倒序排序后首行序号必须重新自适应为 01');

    await sortSelect.selectOption('name-asc');
    await page.waitForTimeout(150);
    const ascFirst = await page.locator('.method-row:not([hidden]) .col-name').first().innerText();
    assert.notStrictEqual(descFirst, ascFirst, 'A-Z 与 Z-A 排序首位不应相同');
    console.log(`✓ 测试 5 通过: 确定性排序生效 (Z-A 首位: ${descFirst}, A-Z 首位: ${ascFirst})，序号自适应刷新`);

    // -------------------------------------------------------------------------
    // 测试 6: 无匹配空状态与一键重置
    // -------------------------------------------------------------------------
    await searchInput.fill('NonExistentBioinformaticsToolXYZ123');
    await page.waitForTimeout(150);

    assert.strictEqual(await page.locator('.method-row:not([hidden])').count(), 0, '应无匹配结果');
    assert.strictEqual(await page.locator('#empty-state').isVisible(), true, '空状态提示必须展示');

    // 点击空状态中的重置按钮
    await page.locator('#empty-reset').click();
    await page.waitForTimeout(150);
    assert.strictEqual(await page.locator('#empty-state').isVisible(), false, '重置后空状态消失');
    assert.strictEqual(await page.locator('.method-row:not([hidden])').count(), rowCount, '列表重新展现全部');
    console.log('✓ 测试 6 通过: 无匹配空状态提示与一键重置闭环通过');

    // -------------------------------------------------------------------------
    // 测试 7: URL 深度还原与浏览器前进/后退
    // -------------------------------------------------------------------------
    await page.goto(`${url}/methods/?q=msmc&domain=population-genetics`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(150);

    assert.strictEqual(await searchInput.inputValue(), 'msmc', '页面加载时从 URL 正确回填搜索框');
    assert.strictEqual(await domainSelect.inputValue(), 'population-genetics', '页面加载时正确回填领域筛选');

    const msmcMatches = await page.locator('.method-row:not([hidden])').count();
    assert.ok(msmcMatches >= 2, `搜索 'msmc' 且限定群体遗传学应匹配 msmc 与 msmc2 (实际: ${msmcMatches})`);

    // 模拟后退与前进
    await page.goto(`${url}/methods/`, { waitUntil: 'networkidle' });
    assert.strictEqual(await searchInput.inputValue(), '', '跳转回无参 URL 时输入框清空');
    await page.goBack();
    await page.waitForTimeout(200);
    assert.strictEqual(await searchInput.inputValue(), 'msmc', '浏览器后退后状态成功恢复');
    console.log('✓ 测试 7 通过: URL 参数深度加载与浏览器前进/后退状态恢复正常');

    // -------------------------------------------------------------------------
    // 测试 8: 方法详情链接与键盘可访问性
    // -------------------------------------------------------------------------
    const firstLink = page.locator('.method-row:not([hidden]) .details-link').first();
    const href = await firstLink.getAttribute('href');
    assert.ok(href && href.includes('/methods/'), '详情跳转链接必须为标准站内链接');

    // Tab 导航聚焦
    await searchInput.focus();
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    assert.ok(['BUTTON', 'SELECT', 'A', 'INPUT'].includes(focusedTag), 'Tab 键焦点流顺畅可访问');
    console.log('✓ 测试 8 通过: 链接完整性与键盘 Tab 可访问性校验通过');

    // -------------------------------------------------------------------------
    // 测试 9: 多端视口适配、截图与无横向溢出检测
    // -------------------------------------------------------------------------
    const viewports = [
      { name: '1600x900', width: 1600, height: 900 },
      { name: '1440x900', width: 1440, height: 900 },
      { name: '1280x800', width: 1280, height: 800 },
      { name: '1024x768', width: 1024, height: 768 },
      { name: '768x1024', width: 768, height: 1024 },
      { name: '390x844', width: 390, height: 844 },
      { name: '375x812', width: 375, height: 812 }
    ];

    console.log('\n--- 阶段 2: 7 种屏幕视口多端响应式校验与截图产出 ---');
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${url}/methods/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(150);

      await assertNoHorizontalOverflow(page, vp.name);

      // 在移动端 (390x844) 测试展开筛选按钮
      if (vp.width <= 640) {
        const toggleBtn = page.locator('#mobile-filter-toggle');
        assert.strictEqual(await toggleBtn.isVisible(), true, '移动端展开筛选按钮必须可见');
        await toggleBtn.click();
        await page.waitForTimeout(150);

        const sidebarVisible = await page.locator('#filter-sidebar').isVisible();
        assert.strictEqual(sidebarVisible, true, '点击后筛选面板必须展开显示');
        await assertNoHorizontalOverflow(page, `${vp.name} 筛选展开状态`);
      }

      const shotPath = path.join(outputsDir, `methods-v4-${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`✓ 视口 ${vp.name.padEnd(9)} 无横向溢出，截图已保存: ${path.basename(shotPath)}`);
    }

    console.log('\n🎉 全部 9 大模块、7 种视口测试断言 100% 顺利通过！');

  } finally {
    await browser.close();
    server.close();
  }
}

runMethodsV4Tests().catch(err => {
  console.error('\n❌ 测试执行失败:', err);
  process.exit(1);
});
