# PhytoMethods｜计算资源证据最终收尾报告

**项目名称**：PhytoMethods  
**仓库地址**：https://github.com/hao1006sy-source/phytomethods  
**开发分支**：`fix/compute-benchmark-final-cleanup`  
**PR 标题**：`fix: 计算资源证据最终收尾与未证实指标清理`  
**任务定位**：基于已合并 PR #51 开展整改，本轮不新增任何性能估计数字，不扩大审核范围；坚决贯彻“无法找到原始表格行、实际执行日志或完整实验条件时，直接显示暂无可核实基准，禁止用另一组估算数字替换”的科学证据规范。

---

## 一、核心问题整改成果

### 1. 修复 FarmCPU 错误引用与模型实现区分
- **原始文献更正**：
  - 彻底删除错误的 *Nature Genetics* 48:696–704 引用及 DOI (`10.1038/ng.3552`)；
  - 纠正为真正的原始奠基论文：Liu et al. (2016). Iterative Usage of Fixed and Random Effect Models for Powerful and Efficient Genome-Wide Association Studies. *PLOS Genetics*, 12(2), e1005767 (DOI: `10.1371/journal.pgen.1005767`)；
- **计算性能实际定位**：
  - 经实地穿透查验，实际计算性能比较位于 Section "Computational efficiency"、Figure 6 ("Computing time and memory usage of five software packages") 以及 S10 Table / S11 Table / S25 Fig；
  - 原文测试硬件为 Asus A53S 笔记本（4.0 GB RAM, Core i3-2310M @ 2.1 GHz 单核），测试对象为 60,000 个标记的模拟数据集；
  - 原文正文及补充材料中**未包含**“1,307 份拟南芥个体 × 216,130 个 SNP 耗时 1.1 分钟、常驻内存 < 2 GB”的实测表格行；
- **实现差异界定与数据清理**：
  - 明确区分原始独立的 FarmCPU R 包与 GAPIT3 中的集成 FarmCPU 实现；
  - 彻底移除未定位原始实验记录的“1.1 分钟”与“低于 2 GB”等经验数值；
  - 运行时间与峰值内存均规范显示为「暂无可核实的运行时间基准」与「暂无可核实的峰值内存基准 (待独立测定)」。

### 2. 修复 EDTA 证据定位与全管线基准核查
- **原始文献核验**：
  - 查阅 Ou et al. (2019) *Genome Biology*, 20, 275 (DOI: `10.1186/s13059-019-1905-y`)；
  - 经实地穿透论文正文，主表仅有 Table 1（水稻 TE 分类含量），无 Table 2；
  - 实际计算效率评估位于 **Additional file 2: Table S2**（"Algorithmic efficiency of TE annotation programs on the rice genome"）；
- **实测数据事实核验**：
  - Table S2 仅分别测定了 14 个独立从头挖掘子工具（SINE-Finder、GRF、LTR_FINDER、LTRharvest、TIR-Learner、HelitronScanner、RepeatModeler 等）在不同集群节点上的单项开销；
  - **Table S2 从未对 EDTA 整体整合管线在单节点 36 线程下的端到端全流程（4.2 小时 / 114.7 CPU 小时）进行过独立表格行记录**；
- **数据清理与呈现**：
  - 彻底删除 4.2 小时、114.7 CPU 小时及未经证实的硬件规格；
  - 规范标注为「暂无可核实的运行时间基准 (论文未单列全管线实测总耗时，待独立测定)」与「暂无可核实的峰值内存基准 (论文 Additional file 2 Table S2 仅记录了各单独子程序在不同平台的开销，全管线整体基准待独立测定)」。

### 3. 修复 Scanpy 性能图定位与官方基准统一
- **文献与官方发布记录核准**：
  - 论文原始性能图位于 **Figure 1** ("Runtime comparison for single-cell analysis pipelines", Wolf et al. *Genome Biology* 2018 19:15, DOI: `10.1186/s13059-017-1382-0`)；
  - 官方性能记录源自 **Scanpy v1.0.0 发布公告基准** (https://scanpy.scverse.org/en/stable/release-notes/index.html)；
- **官方基准耗时与任务范围**：
  - **任务范围**：涵盖单细胞预处理（质控与标准化）、高变基因筛选（HVGs）、PCA 降维、邻近图构建、Louvain 聚类与流形可视化；
  - **68,000 个细胞**（PBMC 68k）：约 **3 分钟**；
  - **130,000 个细胞**：约 **14 分钟**；
  - **1,300,000 个细胞**（1.3M 脑细胞数据集）：约 **6 小时**；
- **数据清理**：
  - 移除缺少实测证据的内存估计数字（如 1.5~3 GB、16 GB），峰值内存标注为「暂无可核实的峰值内存基准 (官方发布记录未列物理常驻内存，待独立测定)」；
  - 彻底更正此前关于“百万细胞 1.5 小时”的错误描述（官方记录为 6 小时）。

### 4. 全面清理未充分证实的工具性能指标
对缺乏独立表格行、实际执行日志或完整实验条件的工具，坚决贯彻“暂无可核实基准”的科学诚实声明，禁止用另一组估算数字替换：
- **DESeq2**：正文仅提及简要测试，无独立算力表格行，显示「暂无可核实的运行时间基准」与「暂无可核实的峰值内存基准」；
- **WGCNA**：论文第 4 节仅阐述 $O(N^2)$ 理论复杂度，无独立算力表格行，显示「暂无可核实的运行时间基准」与「暂无可核实的峰值内存基准」；
- **PLINK**：论文 Table 2 仅测试部分人类步骤且无常驻内存列，显示「暂无可核实的运行时间基准」与「暂无可核实的峰值内存基准」；
- **Bismark**：论文 Table 1 缺少植物全基因组常驻内存测定，显示「暂无可核实的运行时间基准」与「暂无可核实的峰值内存基准」；
- **SyRI**：论文 Table 1 仅为变异类型统计表而非算力表，显示「暂无可核实的运行时间基准」与「暂无可核实的峰值内存基准」；
- **OrthoFinder**：论文 Fig 5 仅展示相对耗时曲线，无特定植物全蛋白组绝对时长表格行，显示「暂无可核实的运行时间基准」与「暂无可核实的峰值内存基准」；
- **Minigraph-Cactus**：论文仅有人类 94 单倍型全流程约 14,000 CPU 小时，无植物小规模组装独立表格行，显示「暂无可核实的运行时间基准」与「暂无可核实的峰值内存基准」；
- **CAFE 5 与 Hifiasm 真实实测继续保留**：
  - **Hifiasm**：保留官方 v0.12 B73 48 线程 5.1 小时 (Wall-clock) / 68 GB RAM 实测；
  - **CAFE 5**：保留本地 `execution.json` 实测 12,653 输入 / 10,956 保留家族 (Base 187.99 秒, Gamma 828.50 秒) 实测；内存诚实标注暂无峰值记录。

---

## 二、12 项工具计算基准核验结论总览

| 工具名称 (ID) | 查阅来源与定位 | 运行时间展示 | 峰值内存展示 | 审核状态 |
| :--- | :--- | :--- | :--- | :--- |
| **Hifiasm** (`hifiasm`) | GitHub Benchmarking Table & Nature Methods 2021 Table 1 | 实测 5.1 小时 (Wall-clock, 48 线程) / 203.2 小时 (CPU 时间) | 68 GB RAM (官方实测) | `source_checked` |
| **CAFE 5** (`cafe5`) | 本地实测日志 `execution.json` & Bioinformatics 2020 | Base 模型实测 187.99 秒；Gamma 模型实测 828.50 秒 | 暂无峰值内存实测记录 (推荐配置 ≥ 4 GB RAM) | `corrected` |
| **Scanpy** (`scanpy`) | Genome Biology 2018 Fig 1 & 官方 v1.0.0 Release Notes | 官方 v1.0.0 记录: 6.8 万细胞约 3 分钟；13 万细胞约 14 分钟；130 万细胞约 6 小时 | 暂无可核实的峰值内存基准 (待独立测定) | `corrected` |
| **EDTA** (`edta`) | Genome Biology 2019 Additional file 2: Table S2 | 暂无可核实的运行时间基准 (待独立测定) | 暂无可核实的峰值内存基准 (待独立测定) | `corrected` |
| **GAPIT** (`gapit`) | PLOS Genetics 2016 e1005767 Section "Computational efficiency" & Fig 6 | 暂无可核实的运行时间基准 (待独立测定) | 暂无可核实的峰值内存基准 (待独立测定) | `corrected` |
| **OrthoFinder** (`orthofinder`) | Genome Biology 2019 Figure 5 & Scalability section | 暂无可核实的运行时间基准 (待独立测定) | 暂无可核实的峰值内存基准 (待独立测定) | `corrected` |
| **PLINK** (`plink`) | GigaScience 2015 4:7 Table 2 | 暂无可核实的运行时间基准 (待独立测定) | 暂无可核实的峰值内存基准 (待独立测定) | `corrected` |
| **SyRI** (`syri`) | Genome Biology 2019 20:277 Table 1 | 暂无可核实的运行时间基准 (待独立测定) | 暂无可核实的峰值内存基准 (待独立测定) | `corrected` |
| **Minigraph-Cactus** (`minigraph-cactus`) | Nature Biotechnology 2023 41:1447-1456 Methods | 暂无可核实的运行时间基准 (待独立测定) | 暂无可核实的峰值内存基准 (待独立测定) | `corrected` |
| **DESeq2** (`deseq2`) | Genome Biology 2014 15:550 Performance section | 暂无可核实的运行时间基准 (待独立测定) | 暂无可核实的峰值内存基准 (待独立测定) | `corrected` |
| **WGCNA** (`wgcna`) | BMC Bioinformatics 2008 9:559 Section 4 | 暂无可核实的运行时间基准 (待独立测定) | 暂无可核实的峰值内存基准 (待独立测定) | `corrected` |
| **Bismark** (`bismark`) | Bioinformatics 2011 27:1571-1572 Table 1 | 暂无可核实的运行时间基准 (待独立测定) | 暂无可核实的峰值内存基准 (待独立测定) | `corrected` |

---

## 三、全站展示与未决清单同步

1. **计算画像数据库 (`src/data/method-compute-profiles.ts`)**：
   - 12 项工具画像字段与上述科学基准完全对齐；
2. **工具选型对比矩阵 (`src/data/method-comparison-matrices.ts`)**：
   - 同步清理全部未证实的算力耗时与常驻内存，统一更新为“待独立测定”或官方已证实的实测基准；
3. **未决科学证据清单 (`outputs/scientific-content-review-v2/unresolved-evidence.csv`)**：
   - 11 项尚缺乏标准化全流程植物实测算力/内存的指标已全部自动纳入未决清单进行动态跟踪；
   - `summary.json` 动态汇总统计保持 100% 闭环一致；
4. **12 份独立单项 Markdown 证据核查记录 (`outputs/compute-benchmark-review/*.md`)**：
   - 全部同步更新查阅出处、实验条件与核查结论。

---

## 四、自动化回归测试结果 (100% 通过)

本地执行全量自动化验证链与多端浏览器测试套件：
- `npm run check` (TypeScript 诊断)：**0 errors, 0 warnings (192 files)**
- `npm run check:scientific-taxonomy` (7 大审核真实性与 GAPIT/EDTA/Scanpy 专项断言)：**100% PASS**
- `npm run check:cafe5` (CAFE 5 家族数与哈希闭环)：**100% PASS**
- `npm run check:platform-data` (开放科研平台 6 项核心数据)：**100% PASS**
- `npm run check:genome-hub` (基因组中心数据闭环)：**100% PASS**
- `npm run check:tutorial-science` (教程实测与模板状态)：**100% PASS**
- `npm run check:topic-markdown` (63 篇专题保真度)：**100% PASS**
- `npm run audit:knowledge` (305 节点, 743 边, 0 悬空, 0 重复)：**100% PASS**
- `npm run test:knowledge-integrity` (13/13 PASS)
- `npm run test:application-evidence` (12/12 PASS)
- `npm run test:msmc-chronology` (6/6 PASS)
- `npm run test:independent-evidence` (5/5 PASS)
- `npm run validate` (全站生产打包与静态检索索引构建)：**100% PASS**
- `npm run test:search-v2` (全站搜索纯文字结果)：**7/7 PASS**
- `npm run test:methods-index-v4` (高密度学术目录与四维筛选)：**9/9 PASS**
- `npm run test:genome-hub` (Genome Hub 目录与物种详情)：**9/9 PASS**
- `npm run test:platform-browser` (平台多端视口 0 溢出)：**8/8 PASS**
- `npm run test:knowledge-v2` (知识图谱交互与多端视口)：**21/21 PASS**
