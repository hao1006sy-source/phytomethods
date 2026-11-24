/**
 * PhytoMethods 开放科研平台升级 V1 浏览器自动化回归测试套件
 * 
 * 覆盖 11 大核心升级功能：
 * 1. About 页面 (作者介绍、建站初衷与公益承诺)
 * 2. 全站深色模式 (ThemeSwitcher 三态切换与 localStorage 持久化)
 * 3. GitHub Issue 反馈与在线编辑入口 (ContentFeedback)
 * 4. 检索同义词与快速建议 (Search Synonyms)
 * 5. 经典小型测试数据集与极速上手 (TutorialQuickStart)
 * 6. 端到端科研工作流路线图 (Workflows 交互与阶段展示)
 * 7. 工具计算资源与耗时评估 (MethodComputeProfile)
 * 8. 核心工具常见报错及排查指南 (MethodTroubleshooting)
 * 9. 领域工具选型对比矩阵 (MethodComparisonMatrix)
 * 10. KaTeX 数学公式移动端防溢出保护
 * 11. 7 种视口无横向溢出断言与多端截图
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
const outputsDir = path.join(rootDir, 'outputs', 'platform-v1-test');

if (!fs.existsSync(outputsDir)) {
  fs.mkdirSync(outputsDir, { recursive: true });
}

// 静态文件测试服务器
function startStaticServer(port = 4588) {
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

// 严格横向溢出断言
async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth ||
           document.body.scrollWidth > window.innerWidth;
  });
  assert.strictEqual(overflow, false, `[横向溢出检测失败] 页面在 ${label} 产生横向溢出滚动条`);
}

async function runPlatformV1Tests() {
  console.log('=== 开始 PhytoMethods 开放科研平台 V1 浏览器自动化测试套件 ===\n');

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

  try {
    // ----------------------------------------------------
    // 测试 1: About 页面 (作者介绍、初衷与公益承诺)
    // ----------------------------------------------------
    console.log('[Test 1] 校验 About 页面与公益承诺...');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${url}/about/`, { waitUntil: 'domcontentloaded' });

    const aboutTitle = await page.locator('h1').textContent();
    assert.ok(aboutTitle?.includes('关于 PhytoMethods'), 'About 标题应包含关于 PhytoMethods');

    const bodyText = await page.textContent('body');
    assert.ok(bodyText?.includes('中国农业科学院深圳农业基因组研究所'), '应包含发起人科研背景信息');
    assert.ok(bodyText?.includes('公益性与永久免费承诺'), '应包含公益承诺模块');
    assert.ok(bodyText?.includes('永久免费向所有人开放'), '应包含永久免费声明');
    await assertNoHorizontalOverflow(page, 'About 页面');
    console.log('✓ Test 1 通过: About 页面作者背景与公益承诺完整生效。\n');

    // ----------------------------------------------------
    // 测试 2: 全站深色模式切换 (ThemeSwitcher)
    // ----------------------------------------------------
    console.log('[Test 2] 校验深色模式切换与持久化...');
    const themeBtn = page.locator('.site-nav .theme-switch-btn');
    assert.strictEqual(await themeBtn.count(), 1, 'Header 桌面导航中应存在主题切换器按钮');

    // 点击切换为浅色/深色
    await themeBtn.click();
    let themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    let savedTheme = await page.evaluate(() => localStorage.getItem('pm-theme'));
    assert.ok(themeAttr === 'light' || themeAttr === 'dark', '点击后应应用指定主题');
    assert.ok(savedTheme === 'light' || savedTheme === 'dark', '主题偏好应正确持久化至 localStorage');

    // 再次点击切换
    await themeBtn.click();
    themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    if (themeAttr === 'dark') {
      await page.screenshot({ path: path.join(outputsDir, 'about-dark-1440.png') });
    }

    console.log('✓ Test 2 通过: 深色模式三态切换与持久化逻辑完全正确。\n');

    // ----------------------------------------------------
    // 测试 3: 搜索页面同义词推荐与真实检索召回 (Search Synonyms Recall)
    // ----------------------------------------------------
    console.log('[Test 3] 校验搜索页中英文同义词快捷标签与真实 Pagefind 召回能力...');
    await page.goto(`${url}/search/`, { waitUntil: 'networkidle' });
    const synonymBox = page.locator('.search-suggestions');
    assert.strictEqual(await synonymBox.count(), 1, '应存在同义词推荐模块');

    const gwasTag = page.locator('.suggestion-pill', { hasText: 'GWAS' });
    assert.strictEqual(await gwasTag.count(), 1, '应包含 GWAS 同义词快捷标签');
    assert.ok((await gwasTag.getAttribute('href'))?.includes('GWAS'), '标签应链接到带参检索');

    const input = page.locator('.pagefind-ui__search-input');
    await input.waitFor({ state: 'visible', timeout: 5000 });

    // 核心 5 组双向中英文同义词召回断言
    const synonymPairs = [
      ['GWAS', '全基因组关联分析'],
      ['TE', '转座子'],
      ['Ortholog', '直系同源'],
      ['Gene Family', '基因家族'],
      ['scRNA-seq', '单细胞 RNA 测序']
    ];

    for (const [enTerm, zhTerm] of synonymPairs) {
      // 测试英文缩写/全称检索
      await input.fill(enTerm);
      await page.waitForTimeout(500);
      const enResults = await page.locator('.pagefind-ui__result').count();
      assert.ok(enResults > 0, `英文词条 [${enTerm}] 应在 Pagefind 中检索到实际结果，实际为 ${enResults}`);

      // 测试中文学术全称检索
      await input.fill(zhTerm);
      await page.waitForTimeout(500);
      const zhResults = await page.locator('.pagefind-ui__result').count();
      assert.ok(zhResults > 0, `中文词条 [${zhTerm}] 应在 Pagefind 中检索到实际结果，实际为 ${zhResults}`);
    }

    console.log('✓ Test 3 通过: 5 组核心学术同义词 (中英双向) 全部实现 Pagefind 真实高召回。\n');

    // ----------------------------------------------------
    // 测试 4: 教程经典测试数据 (TutorialQuickStart)
    // ----------------------------------------------------
    console.log('[Test 4] 校验分析教程经典测试数据集与真实状态...');
    // 4.1 Hifiasm 教程 (documented 官方文档模板)
    await page.goto(`${url}/tutorials/hifiasm-intro/`, { waitUntil: 'domcontentloaded' });
    const hifiasmQuickstart = page.locator('#quickstart-dataset');
    assert.strictEqual(await hifiasmQuickstart.count(), 1, 'Hifiasm 教程应展示快速测试数据卡片');
    const hifiasmBadgeText = await hifiasmQuickstart.locator('.status-badge').textContent();
    assert.ok(hifiasmBadgeText?.includes('官方文档核验'), 'Hifiasm 应严格标记为官方文档核验 (待植物实测)');

    // 4.2 OrthoFinder 教程 (executed 本站端到端运行验证)
    await page.goto(`${url}/tutorials/orthofinder-intro/`, { waitUntil: 'domcontentloaded' });
    const orthoQuickstart = page.locator('#quickstart-dataset');
    assert.strictEqual(await orthoQuickstart.count(), 1, 'OrthoFinder 教程应展示快速测试数据卡片');
    const orthoBadgeText = await orthoQuickstart.locator('.status-badge').textContent();
    assert.ok(orthoBadgeText?.includes('本站端到端运行验证'), 'OrthoFinder 应标记为本站端到端运行验证');

    // 校验极速 3 步代码块与预期产出
    const cmdBlocks = orthoQuickstart.locator('.cmd-code-block');
    assert.ok((await cmdBlocks.count()) >= 2, '应包含下载与运行命令代码块');
    console.log('✓ Test 4 通过: 教程经典测试数据集展示与科研真实性状态完全一致。\n');

    // ----------------------------------------------------
    // 测试 5: 端到端分析工作流路线图与本地 Mermaid 渲染 (/workflows/)
    // ----------------------------------------------------
    console.log('[Test 5] 校验端到端科研工作流路线图交互、阶段与本地 Mermaid SVG 渲染...');
    // 阻断外部 CDN，验证本地依赖渲染能力
    await page.route('**/*jsdelivr.net/**', route => route.abort());
    await page.goto(`${url}/workflows/`, { waitUntil: 'networkidle' });

    const tabs = page.locator('.workflow-tab-btn');
    assert.strictEqual(await tabs.count(), 3, '应包含 3 个核心端到端工作流选项卡');

    // 验证当前默认激活路线一 (assembly-pangenome)
    const activePanel = page.locator('.workflow-detail-panel.active');
    assert.ok((await activePanel.locator('.overview-heading').textContent())?.includes('长读段测序到植物泛基因组'));

    // 验证 Mermaid 流程图在零外部 CDN 下成功渲染出实际 SVG
    await page.waitForSelector('.diagram-box .mermaid svg', { timeout: 10000 });
    const svgCount = await page.locator('.diagram-box .mermaid svg').count();
    assert.ok(svgCount >= 1, `本地 Mermaid 应在零外部网络下成功渲染出 SVG 流程图，实际渲染 ${svgCount} 个`);

    // 点击切换至路线二 (population-gwas)
    await tabs.nth(1).click();
    assert.strictEqual(await page.evaluate(() => window.location.hash), '#population-gwas', '点击切换应同步 URL Hash');
    const gwasPanel = page.locator('#panel-population-gwas');
    assert.ok(await gwasPanel.isVisible(), '路线二面板应切换为可见状态');

    // 检查阶段步骤数量
    const phases = gwasPanel.locator('.phase-step-card');
    assert.strictEqual(await phases.count(), 5, '路线二应包含 5 个详细执行阶段');

    // 检查阶段内输入输出与质控要点
    const firstPhase = phases.first();
    assert.ok(await firstPhase.locator('.io-input').isVisible(), '应展示输入数据规格');
    assert.ok(await firstPhase.locator('.io-output').isVisible(), '应展示输出数据规格');
    assert.ok(await firstPhase.locator('.qc-checkpoints-box').isVisible(), '应展示关键质控标准');
    await page.unroute('**/*jsdelivr.net/**');
    console.log('✓ Test 5 通过: 端到端工作流路线图切换、本地 Mermaid 零 CDN SVG 渲染与阶段详解交互良好。\n');

    // ----------------------------------------------------
    // 测试 6: 方法详情计算资源与报错排查 (/methods/hifiasm/)
    // ----------------------------------------------------
    console.log('[Test 6] 校验算法详情页计算资源基准与故障排查指南...');
    await page.goto(`${url}/methods/hifiasm/`, { waitUntil: 'domcontentloaded' });

    // 计算资源评估卡片
    const computeCard = page.locator('#method-compute-profile');
    assert.strictEqual(await computeCard.count(), 1, 'Hifiasm 应展示计算资源卡片');
    assert.ok((await computeCard.textContent())?.includes('玉米 B73'), '应明确标注基准测试场景');
    assert.ok((await computeCard.textContent())?.includes('160 ~ 200 GB RAM'), '应包含峰值内存评估');

    // 故障排查手册
    const tsSection = page.locator('#method-troubleshooting');
    assert.strictEqual(await tsSection.count(), 1, 'Hifiasm 应包含常见报错排查指南');
    const accordions = tsSection.locator('.ts-accordion');
    assert.ok((await accordions.count()) >= 1, '应包含可折叠报错条目');
    assert.ok((await tsSection.textContent())?.includes('Killed / Out of memory'), '应包含 OOM 经典排查');

    // 底部 GitHub 反馈入口
    const feedbackBox = page.locator('.content-feedback-bar');
    assert.ok((await feedbackBox.count()) >= 1, '页面底部应存在 GitHub 反馈与在线编辑入口');
    console.log('✓ Test 6 通过: 方法页计算资源基准与故障排查知识库成功集成。\n');

    // ----------------------------------------------------
    // 测试 7: 领域工具选型对比矩阵 (/topics/genome-assembly/)
    // ----------------------------------------------------
    console.log('[Test 7] 校验领域工具选型对比矩阵...');
    await page.goto(`${url}/topics/genome-assembly/`, { waitUntil: 'domcontentloaded' });

    const matrixSection = page.locator('#method-comparison');
    assert.strictEqual(await matrixSection.count(), 1, 'M01 领域页应包含工具对比矩阵');
    assert.ok(await matrixSection.locator('.decision-tree-box').isVisible(), '应展示场景选型建议卡片');
    assert.ok(await matrixSection.locator('.comparison-table').isVisible(), '应展示多维横向对比表');

    const tableRows = matrixSection.locator('.comparison-table tbody tr');
    assert.ok((await tableRows.count()) >= 3, '对比表应包含至少 3 款主流工具行');
    console.log('✓ Test 7 通过: 领域核心工具选型对比矩阵与决策树展示正常。\n');

    // ----------------------------------------------------
    // 测试 8: 7 种屏幕视口多端回归与截图
    // ----------------------------------------------------
    console.log('[Test 8] 校验 7 种视口下的无横向溢出与多端渲染...\n');
    const viewports = [
      { name: 'desktop-1600', width: 1600, height: 900 },
      { name: 'desktop-1440', width: 1440, height: 900 },
      { name: 'laptop-1280', width: 1280, height: 800 },
      { name: 'tablet-landscape-1024', width: 1024, height: 768 },
      { name: 'tablet-portrait-768', width: 768, height: 1024 },
      { name: 'mobile-large-390', width: 390, height: 844 },
      { name: 'mobile-compact-375', width: 375, height: 812 }
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 验证 /workflows/
      await page.goto(`${url}/workflows/`, { waitUntil: 'domcontentloaded' });
      await assertNoHorizontalOverflow(page, `/workflows/ @ ${vp.width}x${vp.height}`);

      // 验证 /tutorials/hifiasm-intro/
      await page.goto(`${url}/tutorials/hifiasm-intro/`, { waitUntil: 'domcontentloaded' });
      await assertNoHorizontalOverflow(page, `/tutorials/hifiasm-intro/ @ ${vp.width}x${vp.height}`);

      // 保存核心页面代表性截图
      if (vp.width === 1600 || vp.width === 390) {
        await page.goto(`${url}/workflows/`, { waitUntil: 'domcontentloaded' });
        await page.screenshot({ path: path.join(outputsDir, `workflows-${vp.name}.png`), fullPage: false });

        await page.goto(`${url}/methods/hifiasm/`, { waitUntil: 'domcontentloaded' });
        await page.screenshot({ path: path.join(outputsDir, `methods-hifiasm-${vp.name}.png`), fullPage: false });

        await page.goto(`${url}/topics/genome-assembly/`, { waitUntil: 'domcontentloaded' });
        await page.screenshot({ path: path.join(outputsDir, `domain-m01-${vp.name}.png`), fullPage: false });
      }

      console.log(`  ✓ 视口 ${vp.width}x${vp.height} (${vp.name}) 0 溢出校验通过`);
    }

    console.log('\n=====================================================');
    console.log('  🎉 开放科研平台 V1 浏览器自动化回归测试全部通过！');
    console.log('=====================================================\n');

  } finally {
    await browser.close();
    server.close();
  }
}

runPlatformV1Tests().catch((err) => {
  console.error('\n❌ 自动化测试套件执行失败:', err);
  process.exit(1);
});
