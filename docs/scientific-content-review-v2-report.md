# PhytoMethods｜Scientific Content Review V2 全站科研内容深度精修报告

## 一、审查背景与任务定位

**项目**：PhytoMethods  
**仓库**：https://github.com/hao1006sy-source/phytomethods  
**正式网站**：https://hao1006sy-source.github.io/phytomethods/  
**开发分支**：`audit/scientific-content-review-v2`  
**PR 标题**：`audit: Scientific Content Review V2 全站科研内容与证据质量深度精修`  
**审计标准**：植物基因组学与生物信息学学术审稿人标准，以可核查证据、准确方法机理和真实运行记录为准绳，严禁虚构数据、严禁盲目升级未经核准的结论。

本轮审查暂停了所有新功能、新物种及新工具的收录扩展，全面聚焦于全站既有科学知识与证据体系的深度复核与可复现性整改。

---

## 二、七类科学证据体系落地规范

全站科学内容严格按以下 7 级证据规范进行分层标注与呈现：

| 证据级别 | 证据分类 | 站内定义与收录标准 | 涉及范围与代表案例 |
| :--- | :--- | :--- | :--- |
| **Level 1** | **原始方法奠基论文结论** | 算法初次提出的同行评议发表论文，记录模型推导与核心数学公式 | 70 篇 Method 论文 (如 Hifiasm Nature Methods 2021) |
| **Level 2** | **官方软件文档与手册** | 开发者官方 README、Release 说明、参数手册与推荐用法 | 59 个工具官方仓库链接及各版本 Release 边界 |
| **Level 3** | **独立基准评测 (Benchmark)** | 包含横向对比实验的权威第三方文献或官方公布基准 | 12 个工具的 Compute Profile (标明章节与表格) |
| **Level 4** | **本站实际运行验证** | 本地沙箱实际跑通、留存完整 input SHA256 与 stdout 日志 | 8 篇实测教程 (如 CAFE 5 官方基准、OrthoFinder 等) |
| **Level 5** | **教学模拟与小型测试数据** | 人工合成或规模截断的微型数据，仅供语法与流程教学 | 教程中的 synthetic 数据 (如 60 细胞单细胞、6 位点群体) |
| **Level 6** | **已有植物研究综合解释** | 在高水平植物物种演化与功能基因组学研究中的实战应用 | 59 篇 Application 论文 (如非洲稻 246 基因组演化) |
| **Level 7** | **待核实科学推断 / 模板** | 尚待植物大基因组实测或官方未明确给出推荐参数的内容 | 2 篇 Template 教程 (Hifiasm 与 EDTA 明确标注待实测) |

---

## 三、各专项审查与精修成果

### 1. 任务 A：九大研究领域 63 篇专题学术质量审核 (`src/content/topics/`)
- **覆盖规模**：全面覆盖 M01~M09 全部 9 个核心植物基因组学研究领域，共计 63 篇学术专题。
- **植物特色强化**：
  - 重点核实植物基因组特有的生物学问题，包括：**全基因组复制 (WGD) 与古多倍化残余**、**高杂合度引起的单倍型气泡**、**超大基因组与长末端重复转座元件 (LTR-RT) 扩张**、**异源多倍体亚基因组分化与偏向性表达**。
  - 经扫描，42 篇专题深入阐述了植物核心特征，其余 21 篇专注于通用比对与统计基础（如 HMM、PCA 等算法原理），全面去除了空泛的泛泛而谈。
- **渲染与排版**：通过 `check:topic-markdown` 自动化审计，全站 63 篇专题实现 0 处 CommonMark 强调标记暴露与 0 处 KaTeX 数学公式渲染截断。

### 2. 任务 B：59 个算法工具深度核查与版本边界 (`src/content/methods/`)
- **覆盖规模**：审查全站 59 个算法与生物信息学工具。
- **版本与算法时序严格解耦**：
  - **MSMC vs MSMC2**：初代 MSMC（2014，C 语言，联合隐状态模型，适合 4~8 单倍型）与 MSMC2（2016 重构/2020 协议，成对共祖率复合似然，突破维度瓶颈）拆分为独立页面，参数建议（`-R` 与 `-I`）严格区分。
  - **CAFE vs CAFE 5**：CAFE 5 统一为 Mendes 等开发的 1.1 (v5.1) 版本，区分 Base 单 λ 模型与 Gamma 离散速率类别模型；清除历史残留矛盾语句，明确说明本站已实测官方基准。
  - **PLINK 1.9 vs PLINK 2.0**：详细对比 BED/BIM/FAM 与 PGEN/PVAR/PSAM 格式、FST（Weir–Cockerham vs Hudson）及 PCA 默认维数差异。
- **复杂植物适用性**：全部方法均注明在多倍体、高重复序列、自交纯合背景下的局限性与参数避坑提示。

### 3. 任务 C：130 篇学术文献审核与证据溯源 (`src/content/papers/`)
- **书目元数据核实**：130 篇文献的 Title、DOI、Journal、Year 字段 100% 完整，链接均有效。
- **文献类型精准归纳**：
  - 70 篇方法奠基文献 (`type: method`)；
  - 59 篇植物实战应用文献 (`type: application`)；
  - 1 篇经典综述 (`type: review`)。
- **证据链穿透审计**：
  - 关联至图谱的 67 条应用关系（56 条植物实战应用 + 11 条重点策展）100% 具备出处定位（`sourceLocator`）与软件版本识别标记（`observedSoftwareName`），在 `test:independent-evidence` 中全部判定为 `VERIFIED_CORRECT`。

### 4. 任务 D & J1：10 篇教程复现性审计与 CAFE 5 路径统一
- **真实验证状态保持**：
  - 8 篇 `status: verified` 教程具备物理存在的运行证据目录（包含完整 SHA256 与 stdout 日志）；
  - 2 篇（`hifiasm-intro` 与 `edta-tutorial`）诚实标识为 `status: template`（命令模板已核对，真实数据待植物实测），严禁虚构证据。
- **CAFE 5 命令路径统一 (J1)**：
  - 针对源码构建生成可执行文件位于 `./bin/cafe5` 的特性，在 `src/data/tutorial-test-datasets.ts` 的 `quickStartCommand` 中统一加入环境变量引用：
    ```bash
    export CAFE5_BIN="${CAFE5_BIN:-./CAFE5/bin/cafe5}" && "$CAFE5_BIN" -t mammals_tree.txt -i mammal_gene_families.txt -p -c 4 -o results-base && "$CAFE5_BIN" -t mammals_tree.txt -i mammal_gene_families.txt -p -k 2 -c 4 -o results-gamma
    ```
  - 安装命令追加 `&& cd ..` 回到工作目录，使用户按步骤 1、2、3 顺序操作不会发生 `cafe5: command not found`。
  - `check-cafe5-reproducibility.mjs` 中加入对 `CAFE5_BIN` 路径引用的自动化断言。

### 5. 任务 E：12 个工具计算资源 Profile 真实性 (`src/data/method-compute-profiles.ts`)
- 涵盖 Hifiasm、OrthoFinder、EDTA、CAFE 5、PLINK、GAPIT、SyRI、Minigraph-Cactus、DESeq2、WGCNA、Bismark、Scanpy 共 12 个重点工具。
- 全部标明精确的 Benchmark 来源文献、章节或本站实测日志，注明输入数据规模（如玉米 2.3Gb、水稻 390Mb、12 物种基因家族等）、硬件规格（CPU 线程、RAM）及调优建议。未收录的方法页面则明确标识“暂无可核实基准”，避免用户误判。

### 6. 任务 F：10 个常见排错案例审查 (`src/data/troubleshooting/`)
- 涵盖 Hifiasm OOM、OrthoFinder 终止密码子、EDTA FASTA 头过长、CAFE 5 树非超度量、PLINK 多等位位点拒绝、GAPIT 奇异矩阵、DESeq2 非整数 counts 等 10 大植物分析高发报错。
- 逐项核实报错特征字符串、生物学诱因、诊断命令与修复方案，切实提供指导价值。

### 7. 任务 G：3 条端到端 Workflows 科学依赖核查 (`src/data/workflows/`)
- 组装与泛基因组路线（5 个阶段）、群体 GWAS 路线（5 个阶段）、转录调控网络路线（5 个阶段）。
- 各阶段因果关系严密（如组装 -> 质控 -> 挂载 -> 重复序列屏蔽 -> 基因注释 -> 泛基因组构建），工具输入输出完全闭环。

### 8. 任务 H：知识图谱科学语义审核 (`src/lib/knowledge/`, `outputs/knowledge-graph-v2.json`)
- 节点规模：304 个实体（9 领域、59 工具、130 文献、33 物种、63 专题、10 教程）。
- 关系边规模：743 条语义边。
- 证据条目：801 条（source_checked: 600, structurally_valid: 201, needs_review: 0）。
- 拓扑结构：0 悬空边、0 重复边、0 重复节点。

### 9. 任务 I：Plant Genome Hub 数据质量抽查 (`src/data/genomes/`)
- 收录 10 个代表性植物物种、12 套组装版本与 12 套注释版本，89 个文件记录。
- 确证 25 条直接下载链接（拟南芥、水稻、玉米、小麦、大豆），保留 28 个未确证外部链接。

### 10. 任务 J：现有交互遗留问题深度优化
- **J2: 搜索结果数量多维度区分 (`src/pages/search/index.astro`)**：
  - 顶部统计文案动态区分**全站总匹配数**与**当前分类筛选可见数**。
  - 在全站视角下显示“找到 X 个与 “关键词” 相关的结果”；在分类筛选下智能追加“（全站共 Y 项匹配）”，兼顾清晰性与规范句式。
- **J3: 文献筛选历史恢复与防抖优化 (`src/scripts/filters.ts`)**：
  - 增加 120ms 防抖同步（`syncUrl`），防止文本框快速输入连续触发 `history.replaceState`。
  - 重构 `restoreFromUrl()`：遍历表单全部控件，当 URL 参数为空或后退到初始状态时，自动将表单控件清空重置，彻底解决浏览器前进/后退状态不恢复的问题。
  - 在 `popstate` 恢复期间传入 `update(false)`，避免二次重写 history 栈。

---

## 四、自动化测试与审计产物清单

### 1. 结构化审计产物 (`outputs/scientific-content-review-v2/`)
- `review-inventory.json`：全站 287 项科学条目的结构化审查清单与统计摘要；
- `review-inventory.csv`：扁平化全量可检索审查清单；
- `topic-review.csv`：63 篇专题学术质量与植物特征审核表；
- `method-review.csv`：59 个算法工具核心原理与适用边界审核表；
- `paper-review.csv`：130 篇文献书目元数据与类型审核表；
- `tutorial-review.csv`：10 篇教程实测证据与未验证范围审核表；
- `compute-profile-review.csv`：12 项计算基准硬件配置与证据出处审核表；
- `workflow-review.csv`：3 条端到端路线图阶段与计算资源审核表；
- `genome-resource-review.csv`：10 个物种基因组资源组装与直链核验审核表；
- `unresolved-evidence.csv`：存疑证据跟踪表（0 项未闭环，全量闭环）；
- `summary.json`：总体审计指标概览。

### 2. 自动化回归测试验证
本地执行全套自动化回归测试：
- `npm run check` (Astro TypeScript 类型诊断)：0 errors, 0 warnings
- `npm run check:tutorial-science`：10 篇教程验证状态 100% 通过
- `npm run check:cafe5`：CAFE 5 证据哈希与路径断言 100% 通过
- `npm run check:genome-hub`：基因组资源数据校验 100% 通过
- `npm run check:topic-markdown`：63 篇专题渲染无异常
- `npm run audit:knowledge`：知识图谱 304 节点 743 边 0 悬空通过
- `npm run test:knowledge-integrity`：13 项图谱语义与时序断言 100% 通过
- `npm run test:application-evidence`：12 项植物应用防失真断言 100% 通过
- `npm run test:independent-evidence`：5 项独立穿透审计断言 100% 通过
- `npm run test:search-v2`：7 项搜索纯文字设计与视口测试 100% 通过
- `npm run test:methods-index-v4`：算法工具学术目录多视口与筛选测试 100% 通过
- `npm run test:genome-hub`：Plant Genome Hub 页面与主题测试 100% 通过
- `npm run test:platform-browser`：开放平台全页面与深色模式测试 100% 通过

**全站科学内容与证据库达到发布级学术严谨度与工程稳定性。**
