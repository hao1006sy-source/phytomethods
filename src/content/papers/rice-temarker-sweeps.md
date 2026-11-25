---
title: "Exploring transposable element-based markers to identify allelic variations underlying agronomic traits in rice"
summary: "在 176 份水稻材料中构建转座子插入基因型，并用 SweepFinder2 比较 SNP 与 TE 标记的扫荡信号。"
authors: "Yan H, Haak DC, Li S, Huang L, Bombarely A"
year: 2022
journal: Plant Communications
doi: 10.1016/j.xplc.2021.100270
type: application
methodIds: [sweepfinder2]
domainIds: [population-genetics]
speciesIds: [rice]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
转座子（TE）插入多态性是植物表型变异的重要来源，但在传统群体遗传分析中常被忽略。Yan 等（2022）利用 **176 份日本晴相关水稻材料** 的公开全基因组重测序数据，开发 **TEmarker** 流程生成群体 TE 插入基因型，并系统比较 TE 标记与传统 SNP 标记在 GWAS 及选择性清除（selective sweep）扫描中的表现差异。

## 分析流程
1. **TE 插入基因型构建**：运行 **TEmarker** 从短读段比对证据中检测转座子插入位点并生成群体存在/缺失基因型矩阵。
2. **SFS 选择性清除扫描**：分别基于 SNP 与 TE 基因型频率谱，使用 **SweepFinder2** 以 **10 kb 网格间距**计算复合似然比（CLR）。
3. **候选区域合并与功能关联**：将每类标记最高 **1%** 窗口定义为候选扫荡区，合并相邻超阈值信号后，与农艺性状 GWAS 峰及候选基因进行交叉比对。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **TEmarker** | 从 176 份水稻重测序数据中构建群体 TE 插入基因型 | 捕捉传统 SNP 难以覆盖的转座子插入变异信息 |
| **SweepFinder2** | 基于 10 kb 网格分别对 SNP 与 TE 标记计算 CLR 统计量 | 识别出 TE 标记特有的选择性清除候选区域，与 SNP 信号形成互补 |

## 主要科研发现
- 证明位点频率谱（SFS）选择扫描工具（如 SweepFinder2）不仅适用于传统 SNP，在保证基因型编码与频率谱定义兼容的前提下也可用于 TE 插入标记。
- 最高 1% CLR 阈值属于该研究的经验设定，选择扫描候选区域仍需结合 GWAS 与功能实验进一步建立因果证据。

## 阅读与数据复现资源
- **原始论文**：[Plant Communications (2022)](https://doi.org/10.1016/j.xplc.2021.100270) | [PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC9251385/)
- **相关站内资源**：[SweepFinder2 方法页](../../methods/sweepfinder2/)、[方法论文](../sweepfinder2-paper/)、[M05-05 选择性清除专题](../../topics/population-genetics/m05-topic-05/)
- **数据复现**：原始重测序数据与 TEmarker 代码详见原文 Data Availability 部分。
