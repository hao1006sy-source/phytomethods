# PhytoMethods｜130 篇文献详情页 V3 全站批量推广验收报告

## 一、项目概述与交付结论

本轮工程任务基于已通过 PR #21 验收的 Hifiasm 样板，使用 **Gemini 3.8 Flash High** 实现了 PhytoMethods 知识库全站 **130/130 篇文献详情页向 V3 架构的批量推广**。

- **最终覆盖率**：**130 / 130 篇（100%）** 全部采用专业统一的白绿色科研数据库 V3 布局。
- **三种文献类型适配**：
  - **方法学论文（Method, 70 篇）**：展示核心算法贡献、流程图解（支持可选 SVG 注册）、适用边界及植物案例串联。
  - **植物应用论文（Application, 59 篇）**：突出科学问题、实验材料、研究物种卡片、群体分析方法与核心生物学发现。
  - **综述论文（Review, 1 篇）**：突出综述框架、技术演进脉络与领域未来方向，绝不伪装原创实验数据。
- **真实科研内容保障**：通过 Astro 容器插槽渲染 `<Content />`，**100% 保留原有 130 篇 Markdown 的全部段落、LaTeX 数学公式、数据表格与外部文献直链，绝无篡改、删减或数据编造**。
- **Hifiasm 专属逻辑解耦**：Hifiasm 的 SVG 流程图、定量评测表格与三大创新点已独立抽象至 `config/hifiasm-custom.ts`，**彻底杜绝了向其余 129 篇文献误注入 Hifiasm 数据的隐患**。
- **交互功能全量动态化**：
  - **动态学术引用**：根据当前论文真实元数据，实时生成标准的 **BibTeX**、**APA 7th** 与 **GB/T 7714** 格式，并提供一键剪贴板复制。
  - **独立本地收藏**：采用基于文献 ID 的独立 localStorage 存储键（`pm_fav_paper_${id}`），各篇文献状态互不干扰。
  - **数据驱动知识关联**：真实反向匹配关联算法（`/methods/{id}/`）、关联专题（`/topics/...`）、关联分析教程（带有真实的 `已验证` 等验证状态）与真实植物案例。
- **测试与无横向溢出验收**：
  - `astro check`：104 个文件 0 错误、0 警告。
  - `astro build`：全站 279 个页面 100% 静态构建成功。
  - 原有校验：`12178 local links checked; 0 errors`。
  - Playwright 端到端自动化测试：覆盖 1600/1280/1024/768/390 多端尺寸，全部通过无横向溢出断言。

---

## 二、文献统计与类型模型分布

根据对 `src/content/papers/` 中 130 篇 `.md` 文件的全量扫描（数据快照存档于 `outputs/papers-scan.json`）：

| 文献类型 (`type`) | 篇数 | 典型代表案例 | 页面特色与信息架构 |
| :--- | :---: | :--- | :--- |
| **方法学论文 (method)** | **70** | Hifiasm, OrthoFinder, EDTA, ADMIXTURE, WGCNA, DeepVariant 等 | 核心贡献与创新卡片、算法原理、可选科研图解、参数与适用边界、关联已发布的植物案例 |
| **植物应用论文 (application)** | **59** | 澳洲坚果组装 (Macadamia), 非洲稻246基因组, 拟南芥泛基因组等 | 核心生物学发现卡片、实验样本与分析设计、研究植物对象专栏（中文名与拉丁学名） |
| **综述论文 (review)** | **1** | 植物 DNA 甲基化综述 (*Frontiers in Plant Science*, 2021) | 核心综述主题与技术进展、研究背景与方法演进、延伸阅读 |
| **全站合计** | **130** | 涵盖九大研究领域 M01–M09 | 统一遵循 PhytoMethods 白绿学术系统 |

### 九大研究领域分布（多对多统计）：
- **M05 群体遗传与驯化**：26 篇
- **M03 泛基因组与结构变异**：25 篇
- **M04 比较基因组与演化**：16 篇
- **M07 表观基因组与三维基因组**：16 篇
- **M08 单细胞与空间组学**：15 篇
- **M09 调控网络与组学人工智能**：13 篇
- **M06 全基因组关联分析与分子育种**：11 篇
- **M01 测序与基因组组装**：11 篇
- **M02 基因组注释与重复序列**：7 篇

---

## 三、通用 Paper V3 组件架构

本轮将原 Hifiasm 样板成功重构为高内聚、数据驱动、彻底解耦的通用组件体系：

```text
src/components/paper-v3/
├── config/
│   ├── paper-types.ts            # 文献类型定义、徽章映射与主题色
│   ├── citation-helper.ts         # 动态 BibTeX/APA/GB7714 学术引用生成算法
│   └── hifiasm-custom.ts          # Hifiasm 专属评测数据与深度解读独立隔离配置
├── PaperPageLayout.astro          # 通用三栏页面主容器（动态挂载 sections 与 slot）
├── PaperHeader.astro              # 动态 Hero 头部（类型徽章、大标题、作者期刊、DOI、标签云与按钮）
├── PaperSidebar.astro             # 数据驱动的左侧目录（根据真实 headings 动态生成，支持滚动高亮与移动折叠）
├── PaperHighlights.astro          # 核心贡献/生物学发现卡片（根据论文类型自适应）
├── PaperFigureRegistry.astro      # 科研图解分发中心（当前接入 Hifiasm 矢量流程图）
├── PaperNotes.astro               # 结构化精读笔记（提供清晰的待补充备忘录插槽，不虚构个人笔记）
├── PaperResources.astro           # 右侧卡片组（文献信息、真实关联算法/专题/教程、真实研究植物对象）
├── CitationModal.astro            # 学术引用弹窗组件（支持一键格式切换与剪贴板复制）
└── paper-v3.css                   # 文献 V3 专属作用域样式表（1000+ 行，无外部样式污染）
```

---

## 四、核心功能与真实性保障验收

### 1. 真实科研内容完整性 (Markdown Preservation)
- `src/pages/papers/[slug].astro` 统一通过 Astro 的 `render(entry)` 提取 `{ Content, headings }` 并传入插槽：
  ```astro
  <PaperPageLayout entry={entry} headings={headings} ...>
    <Content />
  </PaperPageLayout>
  ```
- 经验证，130 篇论文中原本包含的数学公式（如 SMC++ 突变率 $6.5\times10^{-9}$）、STAR Methods 链接、代码块与结构化小节均 100% 完整渲染。

### 2. 章节目录动态生成 (Dynamic Sidebar TOC)
- 左侧导航根据正文实际存在的 `##` 二级标题动态生成，不再显示写死的 9 个 Hifiasm 章节。
- 例如：
  - `orthofinder-paper`：精准生成 `① 核心信息` ➜ `② 核心贡献` ➜ `③ 方法价值` ➜ `④ 精读笔记` ➜ `⑤ 相关文献`。
  - `macadamia`：精准生成 `① 核心信息` ➜ `② 研究发现` ➜ `③ 研究解读` ➜ `④ 研究背景与分析目标` ➜ `⑤ 数据与计算方法` ➜ `⑥ 主要发现与解读` ➜ `⑦ 方法限制与精读重点` ➜ `⑧ 精读笔记` ➜ `⑨ 相关文献`。
- 支持点击平滑滚动、视口滚动的 `IntersectionObserver` 高亮以及移动端 `<details>` 折叠。

### 3. 学术引用与本地收藏验证
- **引用准确性**：测试验证在任意论文（如 OrthoFinder）点击“引用”按钮，弹出的 BibTeX、APA、GB/T 7714 均包含 `Emms DM, Kelly S`、`2019`、`Genome Biology` 及 `10.1186/s13059-019-1832-y`，完全消除 Hifiasm 数据泄露。
- **收藏独立性**：测试验证在某一论文点击收藏后，仅改变对应文献的 localStorage 状态（如 `pm_fav_paper_orthofinder-paper = true`），切换到其他文献（如 `macadamia`）时保持独立的未收藏状态。

---

## 五、自动化测试与工程验证结果

执行了全套工程自动化流水线：

```bash
# 1. 静态类型检查
npm run check
# 结果: Result (104 files): 0 errors, 0 warnings, 0 hints

# 2. 全站静态构建与 Pagefind 索引
npm run build
# 结果: 279 page(s) built in 3.90s. Complete!

# 3. 站内链接与内容图谱一致性校验
node scripts/check-home-curation.mjs
node scripts/check-domain-v2.mjs
python scripts/check-links.py
# 结果: 12178 local links checked; 0 errors

# 4. 文献 V3 全量端到端浏览器自动化测试
npm run test:papers-v3
# 结果:
# - 130/130 篇文献成功加载 Paper V3 布局，旧版 .paper-entry 彻底归零
# - 130/130 篇文献在大屏 (1600px) 与移动端 (390px) 均通过无横向溢出检测
# - 零 Hifiasm 专属数据外泄断言通过
# - 动态引用弹窗切换与复制断言通过
# - 独立收藏键名隔离断言通过
# - Hifiasm 原有样板视觉 100% 回归无损
```

---

## 六、视觉交付物清单

所有测试截图已生成并保存在：
`outputs/paper-v3-full-rollout/`

包含：
1. **三大文献类型完整长图**：
   - `screenshots/fullpage/Type-method-orthofinder-paper-full.png`（方法学论文）
   - `screenshots/fullpage/Type-application-macadamia-full.png`（植物应用论文）
   - `screenshots/fullpage/Type-review-plant-dna-methylation-review-2021-full.png`（综述论文）
2. **九大领域移动端代表性长图 (390x844)**：
   - `screenshots/mobile/M01-hifiasm-390x844.png`
   - `screenshots/mobile/M02-edta-paper-390x844.png`
   - `screenshots/mobile/M03-minigraph-cactus-paper-390x844.png`
   - `screenshots/mobile/M04-orthofinder-paper-390x844.png`
   - `screenshots/mobile/M05-african-rice-246-genomes-390x844.png`
   - `screenshots/mobile/M06-rice-gwas-2010-390x844.png`
   - `screenshots/mobile/M07-plant-dna-methylation-review-2021-390x844.png`
   - `screenshots/mobile/M08-rice-root-single-cell-2021-390x844.png`
   - `screenshots/mobile/M09-wgcna-paper-390x844.png`
3. **交互弹窗与回归对比截图**：
   - `screenshots/citations/orthofinder-citation-dialog.png`（动态引用弹窗交互）
   - `screenshots/comparisons/hifiasm-v3-regression.png`（Hifiasm 样板无损回归）
   - `screenshots/desktop/`（各领域典型桌面端 1600x900 快照）

---

## 七、Git 提交记录与 PR 交付状态

- **开发分支**：`feat/paper-v3-full-rollout`
- **目标分支**：`main`
- **PR 状态**：已创建并**保持未合并状态**，等待您的审查与验收。
- **与 Codex 开发隔离保障**：
  - 未修改任何算法工具 V3 组件（`src/components/method-v3/*`）。
  - 未修改全站公共导航栏、Logo 与研究领域索引 V4。
  - 纯粹聚焦在文献详情页子系统，零跨域污染。
