# PhytoMethods 开放科研平台功能升级 V1 交付审计报告

**报告生成时间**：2026-11-24  
**开发分支**：`feat/open-research-platform-v1`  
**PR 标题**：`feat: 开放科研平台 V1 测试数据、Workflows、资源评估与全站体验升级`  
**关联 PR 状态**：保持 OPEN（等待人工复核与验收，不自行合并）  
**测试与构建状态**：`astro check` (0 error), `npm run validate` (100% 通过), `npm run check:platform-data` (6 项全通过), `npm run test:platform-browser` (7 种视口 0 溢出全通过)

---

## 一、升级背景与目标

PhytoMethods（植物基因组学与生物信息学方法知识库）前期已完成科研知识图谱关系治理、算法目录 V4 高密度学术检索、十篇分析教程科研真实性核查与专题 Markdown 强调渲染审计。

为进一步将 PhytoMethods 建设成支持**方法检索、工具选型、分析路线规划、极速上手、计算资源规划及社区协作**的公益性开放科研平台，本轮升级一次性完整实施交付了 11 项平台级功能。

---

## 二、11 大核心交付成果详述

### 1. 经典小型测试数据集直达入口 (Tutorial QuickStart)
- **核心组件**：`src/components/tutorial-v3/TutorialQuickStart.astro`
- **数据注册表**：`src/data/tutorial-test-datasets.ts`
- **覆盖范围**：覆盖全站全部 10 篇分析教程；
- **科研真实性原则**：
  - 严格保持 **8 篇 `executed`（本站端到端运行验证）** 与 **2 篇 `documented`（官方文档核验 · 待植物实测）**；
  - `hifiasm` 与 `edta` 明确标明采用官方微型示例数据仅用于验证软件编译与参数，明确警示不可等同于植物复杂大基因组的实际表现；
  - 其余 8 篇（OrthoFinder, SyRI, Bismark, PLINK, GWAS, Scanpy, WGCNA, CAFE 5）均绑定仓库中已存证的实测运行日志路径；
- **展示信息**：物种来源、数据源链接、压缩大小、推荐算力、极速 3 步命令（环境、下载、运行）、预期产出文件列表、科研边界说明与实测证据索引。

### 2. 跨模块端到端分析路线图 Workflows (`/workflows/`)
- **页面入口**：主站顶部导航常驻新增「路线图 (`workflows/`)」；
- **数据模型**：`src/data/workflows/types.ts` 与 `src/data/workflows/index.ts`；
- **交付三大核心路线**：
  1. **基因组组装与泛基因组路线** (`assembly-pangenome`)：
     长读段组装 -> Contig 质量评估 -> Hi-C 染色体挂载 -> 基因/重复注释 -> 泛基因组构建；
     串联工具：Hifiasm, Verkko, Merqury, YaHS, EDTA, BRAKER3, Minigraph-Cactus, PGGB, SyRI；
  2. **群体重测序与 GWAS 路线** (`population-gwas`)：
     变异调用 -> 位点多维质控 -> 群体结构与亲缘关系 -> 混合线性模型 GWAS -> 候选区间挖掘与选择消除；
     串联工具：BCFtools, PLINK, ADMIXTURE, GAPIT, selscan；
  3. **表达数据与 WGCNA 调控网络路线** (`expression-network`)：
     表达量过滤与 VST 变换 -> 多因子差异表达 -> 加权共表达网络构建 -> 模块-表型关联 -> 转录因子调控网络推断；
     串联工具：DESeq2, WGCNA, GENIE3, GRNBoost2；
- **交互特性**：选项卡快速切换、URL Hash 双向同步、各阶段输入/输出矩阵、关键质控标准（QC Checkpoints）与站内对应实战教程一键直达。

### 3. 工具计算资源与耗时评估 (Compute Profiles)
- **数据档案**：`src/data/method-compute-profiles.ts`；
- **展示组件**：`src/components/MethodComputeProfile.astro`；
- **集成位置**：各算法详情页（`MethodPageLayout.astro` 与 `HifiasmPageV3.astro`）；
- **覆盖工具**：收录 Hifiasm, OrthoFinder, EDTA, CAFE 5, PLINK, GAPIT, SyRI, Minigraph-Cactus, DESeq2, WGCNA, Bismark, Scanpy 等 12 款主流核心工具的实测/官方基准；
- **真实性守则**：未有可靠公开基准的工具明确展示「暂无可靠公开基准，建议参考官方文档」，杜绝虚构。

### 4. 全站深色模式 (Theme Switcher)
- **样式系统**：`src/styles/themes.css` 建立全套深色/浅色语义化 CSS 变量；
- **控制器组件**：`src/components/ThemeSwitcher.astro`；
- **交互逻辑**：支持三态循环切换（跟随系统 `system` -> 浅色 `light` -> 深色 `dark`），并在 `localStorage` (`pm-theme`) 中持久化用户选择；桌面端与移动端折叠菜单均已集成。

### 5. GitHub Issue 反馈和页面编辑入口 (Content Feedback)
- **反馈组件**：`src/components/ContentFeedback.astro`；
- **集成页面**：嵌入全站全部 59 款算法工具页、10 篇分析教程、9 大研究领域页及 Workflows 页面底部；
- **Issue 模板系统**：在 `.github/ISSUE_TEMPLATE/` 建立 3 个结构化模板：
  1. `documentation-error.yml`（内容错误或科学描述不准确）
  2. `outdated-parameters.yml`（软件参数、版本时序或命令过时）
  3. `dataset-link-problem.yml`（示例数据集或下载链接失效）
- **功能特性**：自动带入当前页面标题、当前 URL 与 GitHub 源码编辑直达链接 (`edit/main/...`)。

### 6 & 8. Pagefind 静态搜索索引优化与中英文同义词建议
- **同义词字典**：`src/data/search-synonyms.json` 建立 14 组高频中英文/缩写同义词组（涵盖 GWAS, TE, Pangenome, Orthology, LD, PCA, SNP, scRNA-seq 等）；
- **搜索页升级**：`src/pages/search/index.astro` 增加同义词快捷点击推荐卡片；输入关键词时动态联想提示对应中英文标准术语；
- **构建索引**：Pagefind 全量索引 281 个静态 HTML 页面，搜索涵盖专题、方法、文献、教程与 Workflows。

### 7. 常见报错及故障排查指南 (Troubleshooting)
- **排查知识库**：`src/data/troubleshooting/index.ts`；
- **展示组件**：`src/components/MethodTroubleshooting.astro`；
- **覆盖场景**：收录 10 款核心工具的 12 项经典高频故障（如 Hifiasm OOM、OrthoFinder 非法终止密码子、EDTA 染色体 Header 过长、CAFE 5 非超度量树、PLINK 多等位位点拒绝、GAPIT 亲缘奇异矩阵、DESeq2 浮点数报错、WGCNA 样本离群树等）；
- **排查要素**：典型现象、根本原因剖析、精准诊断命令 (`diagnosticCommand`) 与经实测验证的标准解决方案。

### 9. 工具选型对比矩阵 (Comparison Matrix)
- **矩阵数据库**：`src/data/method-comparison-matrices.ts`；
- **展示组件**：`src/components/domain-v2/MethodComparisonMatrix.astro`；
- **全量覆盖**：覆盖 M01~M09 全部 9 大研究领域；
- **内容架构**：
  - 核心决策场景建议（“如果你的场景是 X → 推荐方案 Y，核心原因为 Z”）；
  - 7 维横向特性对比表（输入格式、底层模型、算力规模、核心优势、适用边界、推荐场景）；
- **集成位置**：`M01Domain.astro` 与 `DomainPageV2.astro`（各领域关键方法下方）。

### 10. KaTeX 数学公式与 Mermaid 流程图增强
- **公式响应式**：在 `themes.css` 中增加 `.katex-display` 移动端水平滑动溢出保护 (`overflow-x: auto`)，杜绝多项式公式在窄屏下破坏页面排版；深色模式下自适应白灰文字；
- **流程图渲染**：在 Workflows 页面按需异步加载 Mermaid，图表具备深色与浅色自适应主题，移动端具备横向滚动与平滑缩放保护。

### 11. About 页面发起人背景、初衷与公益承诺
- **升级页面**：`src/pages/about/index.astro`；
- **发起人信息**：如实说明为中国农业科学院深圳农业基因组研究所的一名研究生个人发起；
- **建站初衷**：系统化整理植物基因组学分散资源，打破工具与论文孤岛，降低青年学生与科研工作者的入门与选型门槛；
- **公益承诺**：永久免费向所有人开放，绝不设置任何付费阅读门槛或商业化订阅限制；
- **学术标准**：详述全链路文献 DOI 绑定、软件时序解耦与可复现验证规范。

---

## 三、自动化验证与测试执行记录

### 1. 全量数据一致性检查套件 (`npm run check:platform-data`)
```text
=====================================================
  PhytoMethods 开放科研平台 V1 全量数据与知识体系完整性校验
=====================================================

--- 校验中英文同义词与缩写词典 (check-search-synonyms.mjs) ---
✓ 检索同义词词典校验通过 (共 14 组高频植物基因组学中英文/缩写同义词组)
-----------------------------------------------------
--- 校验教程测试数据集注册表 (check-tutorial-datasets.mjs) ---
✓ 教程测试数据集校验全部通过：覆盖全部 10 篇教程 (8 篇 executed，2 篇 documented)
-----------------------------------------------------
--- 校验科研工作流数据 (check-research-workflows.mjs) ---
✓ 3 条端到端工作流及其全部阶段、工具和教程引用校验全部通过！
-----------------------------------------------------
--- 校验算法计算资源基准档案 (check-method-compute-profiles.mjs) ---
✓ 计算资源基准数据校验通过：收录 12 个核心工具基准档案
-----------------------------------------------------
--- 校验常见报错排查知识库 (check-troubleshooting.mjs) ---
✓ 报错排查知识库校验通过：收录 12 条条目，覆盖 10 个核心工具！
-----------------------------------------------------
--- 校验领域工具选型对比矩阵 (check-method-comparisons.mjs) ---
✓ 9 大领域工具选型对比矩阵全部校验通过 (共 9 个领域，覆盖各主流工具与决策场景)
-----------------------------------------------------

🎉 所有 6 项开放科研平台 V1 核心数据校验全部通过！
```

### 2. 多端浏览器自动化回归测试 (`npm run test:platform-browser`)
覆盖 8 大功能模块及 7 种视口，横向溢出断言严格为 0 像素溢出：
- `desktop-1600` (1600×900)：✓ 通过 (0 溢出)
- `desktop-1440` (1440×900)：✓ 通过 (0 溢出)
- `laptop-1280` (1280×800)：✓ 通过 (0 溢出)
- `tablet-landscape-1024` (1024×768)：✓ 通过 (0 溢出)
- `tablet-portrait-768` (768×1024)：✓ 通过 (0 溢出)
- `mobile-large-390` (390×844)：✓ 通过 (0 溢出)
- `mobile-compact-375` (375×812)：✓ 通过 (0 溢出)

高保真截图产出保存于 `outputs/platform-v1-test/`：
- `about-dark-1440.png`
- `workflows-desktop-1600.png`
- `workflows-mobile-large-390.png`
- `methods-hifiasm-desktop-1600.png`
- `methods-hifiasm-mobile-large-390.png`
- `domain-m01-desktop-1600.png`
- `domain-m01-mobile-large-390.png`

### 3. CI 综合验证套件 (`npm run validate`)
- `astro check`: 177 个 Astro/TS 文件 0 error, 0 warning；
- `astro build`: 281 个页面静态构建成功；
- `pagefind`: 281 个 HTML 页面索引完成；
- `check-home-curation.mjs`: 通过；
- `check-domain-v2.mjs`: 通过；
- `check-links.py`: 站内链接 100% 连通；
- `audit:knowledge`: 740 条科学关系全部合规；
- `test:knowledge-integrity`: 13 项断言 100% 通过；
- `test:application-evidence`: 12 项断言 100% 通过；
- `test:msmc-chronology`: 6 项断言 100% 通过；
- `test:independent-evidence`: 5 项断言 100% 通过；
- `check:topic-markdown`: 63 篇专题渲染无异常；
- `check:platform-data`: 6 项核心数据检查全部通过。

---

## 四、Git 提交与分支状态

- 本地已将最新 `origin/main` 成果（包括 PR #37、#38、#39、#40）完全合并至开发分支，确认 **0 冲突**；
- 按照任务要求，PR 提交后保持 **OPEN** 状态，绝不自行合并，等待用户审查验收。
