# PhytoMethods｜全站现有功能质量优化 V1 审计与交付报告

> **开发分支**: `fix/site-quality-research-integrity-v1`  
> **PR 标题**: `fix: 全站科研数据一致性、检索安全与交互质量优化`  
> **基准提交**: 基于最新 `main` 分支  
> **定位原则**: 暂停所有新功能开发，针对科研元数据一致性、检索 XSS 安全、多实例主题控制器、URL 状态同步、图谱反虚构与 CI 自动化执行全量系统性质量加固。

---

## 一、实际检查的页面和模块清单

| 模块序号 | 检查页面 / 核心代码模块 | 涉及技术栈与文件 | 检查重点 |
| :---: | :--- | :--- | :--- |
| **M1** | 分析教程元数据与快速上手卡片 | `src/data/tutorial-test-datasets.ts`<br>`src/pages/tutorials/index.astro`<br>`src/components/tutorial-v3/TutorialQuickStart.astro`<br>`examples/cafe5/verified-20261123/execution.json` | CAFE 5 耗时冲突、数据来源与验证状态分离、清除虚假默认回退数值 |
| **M2** | 全站搜索与方法目录筛选安全 | `src/pages/search/index.astro`<br>`src/scripts/filters-methods-v4.ts` | 用户输入与标签进入 `innerHTML` 的 DOM XSS 风险、特殊字符过滤、Pagefind 避免重复加载 |
| **M3** | 全站深色/浅色多实例主题控制器 | `src/components/ThemeSwitcher.astro`<br>`src/layouts/Base.astro`<br>`src/styles/themes.css` | 桌面端与移动端双实例重复 ID、事件绑定失效、双端状态同步与刷新防闪烁 |
| **M4** | 全站搜索资源分类与文献索引筛选 | `src/pages/search/index.astro`<br>`src/pages/papers/index.astro`<br>`src/scripts/filters.ts` | 补齐 `genome` 基因组分类胶囊、清除文献硬编码数量、实现多维筛选的 URL 双向同步与恢复 |
| **M5** | 科研知识图谱与 Workflows | `src/pages/knowledge/index.astro`<br>`src/pages/workflows/index.astro`<br>`outputs/knowledge-graph-v2.json` | 移除 `|| 798` 兜底常量与数据强校验、修复嵌套 `<main>` 语义冲突、Mermaid `strict` 安全与深色模式热重绘 |
| **M6** | 浏览器自动化测试与 CI 流水线 | `.github/workflows/ci.yml`<br>`scripts/browser-test-*.mjs` | 移除 Windows Edge 绝对路径硬编码、集成 5 大核心浏览器回归用例、失败自动归档产物 |

---

## 二、发现的问题、代码位置、严重程度与修复前后对比

### 1. [P0] CAFE 5 实测耗时与元数据注册表严重冲突
- **代码位置**: `src/data/tutorial-test-datasets.ts:375`
- **严重程度**: P0（科研数据失真与学术严谨性缺陷）
- **核查依据**: 原始复现日志 `examples/cafe5/verified-20261123/execution.json` 明确记录：Base 模型 `elapsedSeconds: 187.987`（约 188 秒，即 3 分 08 秒），Gamma 模型 `elapsedSeconds: 828.496`（约 828.5 秒，即 13 分 48 秒）；教程正文 `src/content/tutorials/cafe5-intro.md` 记载一致。而测试数据集注册表中误录为「1 分 18 秒 / 3 分 42 秒」。
- **修复前实际行为**: 前端教程快速开始卡片展示错误耗时，与正文和实验日志矛盾。
- **修复后实际行为**: 注册表更正为 `实测约 188 秒 (Base 模型) / 约 828 秒 (Gamma 模型)`，并在 `scripts/check-cafe5-reproducibility.mjs` 中添加强断言，杜绝时序失真。

### 2. [P0] CAFE 5 教程目录状态与标签描述矛盾
- **代码位置**: `src/pages/tutorials/index.astro:13`
- **严重程度**: P0（状态语义混乱）
- **核查依据**: `cafe5-intro` 的 Frontmatter 与验证记录均为 `tested: verified`（已完整运行 12,653 家族端到端验证），但目录中硬编码来源字符串为 `官方非植物示例（模板）`，导致前端同时出现 `✓ 示例运行已验证` 与 `（模板）` 的荒谬冲突。
- **修复前实际行为**: 目录卡片展示 `官方非植物示例（模板）`。
- **修复后实际行为**: 数据来源与验证状态彻底解耦，来源显示为 `官方非植物示例`，验证状态由结构化 `data.tested` 独立渲染为 `✓ 示例运行已验证`。

### 3. [P0] 教程快速开始卡片未经核实默认数据回退
- **代码位置**: `src/components/tutorial-v3/TutorialQuickStart.astro:32-48`
- **严重程度**: P0（虚假学术数据生成风险）
- **核查依据**: 当数据集缺少字段时，原组件自动兜底为 `约数兆至数百兆`、`极速秒级/分钟级`、`2~4 核心`、`2~4 GB 内存`、`最新稳定版`，存在用未经测算的泛化数字误导科研人员配置计算资源的风险。
- **修复前实际行为**: 任何缺失字段自动填充未验证的经验数字。
- **修复后实际行为**: 彻底清除所有虚假兜底，未测算字段统一显式标注为 `暂无核实数据`，实测数据继续真实准确展示。

### 4. [P0] 搜索与筛选动态渲染中潜在的 DOM XSS 漏洞
- **代码位置**: `src/pages/search/index.astro:276-281, 335-337`；`src/scripts/filters-methods-v4.ts:120, 222`
- **严重程度**: P0（前端安全漏洞）
- **核查依据**: 用户输入的搜索词 `query`、同义词链接及筛选标签 `tag.label` 未经转义直接字符串插值赋值给 `messageEl.innerHTML` 与 `tagEl.innerHTML`。输入 `<script>` 或 `<img onerror>` 时存在脚本注入隐患。
- **修复前实际行为**: 使用 `innerHTML` 拼接用户输入内容。
- **修复后实际行为**: 全面重构为 `textContent`、`createTextNode` 与 `createElement` 等安全 DOM 原生方法，在 `scripts/browser-test-search-v2.mjs` 中增加恶意 HTML / XSS 防护专项回归用例（Test 7）并 100% 通过。

### 5. [P0] 全站多实例主题控制器冲突与移动端失效
- **代码位置**: `src/components/ThemeSwitcher.astro:7-32`；`src/layouts/Base.astro:56, 70`
- **严重程度**: P0（UI 交互阻塞与 HTML 规范违规）
- **核查依据**: `Base.astro` 在桌面导航与移动端抽屉中分别渲染了一次 `ThemeSwitcher.astro`，产生重复的 DOM ID (`#theme-toggle-btn`、`#theme-icon-*`)；脚本仅使用 `getElementById` 绑定事件，导致移动端按钮无法响应点击，且双端图标和状态完全不同步；缺乏 `<head>` 防闪烁逻辑。
- **修复前实际行为**: 移动端无法切换主题；桌面端切换后移动端状态不同步；刷新存在瞬间浅色闪烁。
- **修复后实际行为**: 移除所有重复 ID 改用类选择器；使用事件委托支持全页所有按钮统一响应；双向同步状态徽章；在 `Base.astro` 的 `<head>` 中增加前置防闪烁微脚本；`browser-test-platform-v1.mjs` 覆盖多实例双端切换、系统媒体查询联动与刷新持久化测试。

### 6. [P1] 全站搜索缺少基因组资源分类胶囊
- **代码位置**: `src/pages/search/index.astro:22-30`
- **严重程度**: P1（功能缺失与检索闭环断裂）
- **核查依据**: 搜索脚本内部已有 `getResourceInfo` 识别 `genome` 类型（`data-resource-type="genome"`），但前端胶囊栏仅有 7 个按钮，独缺「基因组资源」。
- **修复前实际行为**: 搜索到水稻、拟南芥等参考基因组时，无法通过分类胶囊进行筛选。
- **修复后实际行为**: 补齐 `<button type="button" class="filter-pill" data-type="genome">基因组资源</button>`，支持一键按基因组类型过滤。

### 7. [P1] 文献索引页面固定数量硬编码与 URL 筛选状态丢失
- **代码位置**: `src/pages/papers/index.astro:5`；`src/scripts/filters.ts:1-13`
- **严重程度**: P1（元数据失真与状态不持久）
- **核查依据**: 页面元数据描述硬编码 `收录 130 篇经典文献`；`filters.ts` 仅单向恢复 `q` 关键词，不支持年份、类型、领域、工具、物种等维度的 URL 同步与浏览器后退历史恢复。
- **修复前实际行为**: 筛选后无法分享带参链接，刷新或后退后重置条件；描述中的 130 篇无法随数据更新联动。
- **修复后实际行为**: 元数据使用 `${entries.length}` 动态计算；重写 `filters.ts`，实现全部 6 个维度的 URL 双向同步、popstate 历史恢复与安全计数。

### 8. [P1] 知识图谱使用历史常量掩盖数据缺失
- **代码位置**: `src/pages/knowledge/index.astro:26`
- **严重程度**: P1（科研数据伪装隐患）
- **核查依据**: 原代码编写了 `const totalEvidence = stats.evidenceEntriesCount || 798;`，使用过期的 798 历史常量兜底，若图谱数据生成发生结构缺失会被伪装掩盖。
- **修复前实际行为**: 若 `evidenceEntriesCount` 缺失，静默显示 798。
- **修复后实际行为**: 移除 `|| 798`，对 `nodesCount`、`edgesCount`、`evidenceEntriesCount` 进行强类型与数值完整性校验，缺失时直接抛出显式编译/运行异常，实测当前真实值为 801。

### 9. [P1] 端到端工作流页面语义违规与 Mermaid 主题失步
- **代码位置**: `src/pages/workflows/index.astro:14, 257-262`
- **严重程度**: P1（HTML5 语义错误与视觉体验缺陷）
- **核查依据**: `workflows/index.astro` 内部使用了 `<main class="workflows-page">`，嵌套在 `Base.astro` 已有的 `<main>` 内部，违反 HTML5 规范；Mermaid 脚本检测 `classList.contains('dark')`（网站使用 `data-theme`），导致深色模式下 Mermaid 永远渲染为浅色主题；主题切换时不重新渲染图表；配置为 `securityLevel: 'loose'`。
- **修复前实际行为**: 重复 main 标签；深色模式下 Mermaid 显示刺眼白底；切换主题图表不更新。
- **修复后实际行为**: 修复为标准 `<div class="workflows-page">`；Mermaid 安全级别调整为 `securityLevel: 'strict'`；精准判断 `data-theme` 与系统偏好；通过 MutationObserver 与 storage/matchMedia 监听实现深色模式热重绘；`.diagram-box` 支持移动端平滑横向滚动与自适应缩放。

### 10. [P1] CI 流程缺少核心浏览器回归测试与跨平台 Edge 路径依赖
- **代码位置**: `.github/workflows/ci.yml`；`scripts/browser-test-*.mjs`
- **严重程度**: P1（CI 测试覆盖不足与跨平台构建失败）
- **核查依据**: CI 流水线原先只运行静态数据校验和单项 genome-hub 测试，缺少搜索、工具目录、图谱和平台的综合回归；部分脚本依赖 `C:/Program Files (x86)/.../msedge.exe`，在 Linux Actions runner 上无法执行。
- **修复前实际行为**: PR 提交时无法验证各端 UI 表现；Linux CI 可能因找不到 Edge 可执行文件报错。
- **修复后实际行为**: 所有浏览器脚本重构为自动适配 Windows Edge / Linux Chromium；在 `.github/workflows/ci.yml` 中接入 5 大核心端到端回归套件；测试失败自动通过 `actions/upload-artifact@v4` 打包上传 `outputs/`。

---

## 三、测试运行结果与指标统计

本地严格执行了全量静态检查、学术质量审计与端到端真实 Chromium 浏览器回归测试，**通过率 100%**：

```text
======================= 静态类型与数据真实性校验 =======================
> npm run check
Result (190 files): 0 errors, 0 warnings

> npm run check:tutorial-science
10 tutorials, 66 commands, 100% evidence verified (0 unverified broad claims)

> npm run check:cafe5
CAFE5 evidence passed: 35 hashes; 2 model runs; 12653 input / 10956 retained; 8 verified / 2 template
- Base 模型: 187.987s (约 188 秒)
- Gamma 模型: 828.496s (约 828 秒)
- 严禁虚假 1分18秒 / 3分42秒 校验通过

> npm run check:genome-hub
{"confirmedBundles":5,"unverifiedBundles":6,"species":10,"assemblies":12,"annotations":12,"files":89,"direct":25,"loginRequired":0,"unverified":28,"portals":36,"compatibilityAssertions":11}

> npm run validate
- check-home-curation: 100% passed
- check-domain-v2: 100% passed
- check-links: 100% valid (0 broken links)
- audit:knowledge & test:knowledge-integrity: 304 nodes, 743 edges, 801 evidence passed
- test:application-evidence: 12/12 passed
- test:msmc-chronology: 6/6 passed
- test:independent-evidence: 5/5 passed
- check:topic-markdown: 63 topics, 0 errors
- check:platform-data: 6/6 passed

> npm run coverage
9 大领域、63 篇专题、59 款工具、130 篇文献、10 篇教程覆盖率 100%

======================= 浏览器自动化端到端回归测试 =======================
> npm run test:search-v2
✓ 全部 7 项测试通过 (含「泛基因组」「GWAS」「Hifiasm」「OrthoFinder」纯文字学术列表、genome 分类胶囊、XSS 恶意 HTML 防护与 7 视口 0 溢出)

> npm run test:methods-index-v4
✓ 全部 9 大模块、7 种视口测试通过 (59 款工具四维筛选、联动清空、确定性排序、URL 恢复)

> npm run test:genome-hub
✓ 全部 9 项测试通过 (10 物种归组、25 直链验证、深色三态适配、28 项视口 0 溢出)

> npm run test:knowledge-v2
✓ 全部 21 项知识图谱专项测试通过 (多证据溯源、实体/关系多维过滤、键盘 A11y、移动端 0 溢出)

> npm run test:platform-browser
✓ 全部 8 项平台综合测试通过 (双实例主题控制器双端联动、Mermaid strict 渲染、计算资源基准)
```

---

## 四、GitHub Actions CI 配置更新

在 `.github/workflows/ci.yml` 中正式编排了完整的浏览器端回归流水线：

```yaml
      - name: Check tutorial scientific verification records
        run: npm run check:tutorial-science

      - name: Check CAFE5 reproducibility evidence
        run: npm run check:cafe5

      - name: Check Genome Hub data integrity
        run: npm run check:genome-hub

      - name: Install Playwright Chromium
        run: npx playwright install --with-deps chromium

      - name: Run Core Browser Regression Tests
        run: |
          npm run test:search-v2
          npm run test:methods-index-v4
          npm run test:genome-hub
          npm run test:knowledge-v2
          npm run test:platform-browser

      - name: Upload browser test artifacts on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: browser-test-artifacts
          path: |
            outputs/
          if-no-files-found: ignore
```

---

## 五、未修复事项及原因说明（科学严谨性边界）

1. **教程中非实测的 2 篇模板流程（`edta-tutorial` 与 `hifiasm-intro`）保持 `template` 状态**：
   - 恪守“不伪造运行记录与日志”的科研伦理边界。两篇教程当前尚未完成真实植物大型基因组的端到端运行日志归档，前端明确保持 `📋 官方文档核验 (待植物实测)` 与 `命令模板已核对` 状态，不擅自升级为 `verified`。
2. **Plant Genome Hub 其余 5 个物种的直链扩充继续由独立任务承接**：
   - 严格遵守开发边界要求，本轮不重复执行资源扩充，保持已验证的 5 大核心物种（水稻、拟南芥、玉米、小麦、大豆）25 条确证直链稳定。
