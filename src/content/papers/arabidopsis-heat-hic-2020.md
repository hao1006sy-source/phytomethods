---
title: "Heat stress-induced transposon activation correlates with 3D chromatin organization rearrangement in Arabidopsis"
summary: "拟南芥热胁迫 Hi-C 研究将 HiC-Pro 输出转换后用 HiCExplorer 处理与检查接触矩阵。"
authors: "Sun L, Jing Y, Liu X, Li Q, Xue Z, Cheng Z, Wang D, He H, Qian W"
year: 2020
journal: Nature Communications
doi: 10.1038/s41467-020-15809-5
type: application
methodIds: [hicexplorer]
domainIds: [epigenomics-3d-genome]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
高温胁迫不仅剧烈改变植物基因表达，还能诱导异染色质区转座子（TE）激活，但其是否伴随三维基因组空间构象的重排尚不明确。Sun 等（2020）以 **拟南芥（*Arabidopsis thaliana*）** 为材料，在正常对照、热胁迫处理及热恢复期三个状态下开展高通量染色质构象捕获（Hi-C）测序，系统解析热胁迫下三维染色质互作重排与转座子激活的关联。

## 分析流程
1. **Hi-C 接触矩阵构建**：使用 **HiC-Pro** 对双端测序读段进行比对、过滤无效连接并构建全基因组染色质接触矩阵（contact maps）。
2. **矩阵标准化与互作分析**：将 HiC-Pro 输出矩阵导入 **HiCExplorer**，依次运行 `hicPlotDistVsCounts`（距离—互作衰减分析）、`hicNormalize`（文库深度标准化）、`hicCorrectMatrix`（ICE 迭代校正）与 `hicTransform`（Obs/Exp 转换）。
3. **A/B 区室（Compartment）划分**：使用 **HOMER** 对校正后的 Hi-C 矩阵执行主成分分析（PCA），识别热胁迫前后 A/B 区室转换及染色质区室化（compartmentalization）减弱区域。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **HiC-Pro** | Hi-C 双端读段比对与原始接触矩阵构建 | 过滤未连接与自连读段，生成可靠的基因组 bin 互作计数 |
| **HiCExplorer** | 矩阵标准化（`hicNormalize`）、ICE 校正（`hicCorrectMatrix`）及距离衰减绘图 | 量化热胁迫下长程染色质互作增强与局部拓扑结构域松弛 |
| **HOMER** | 基于 PCA 划分染色质 A/B 区室 | 揭示热胁迫导致部分异染色质区室化减弱并与转座子激活共现 |

## 主要科研发现
- 发现热胁迫诱导拟南芥三维染色质发生显著重排，表现为**异染色质区室化减弱**以及染色体臂与着丝粒周围区域的长程互作改变。
- 三维染色质解聚与热胁迫诱导的转座子（TE）转录激活高度相关，且在热恢复期部分构象可逆恢复。

## 阅读与数据复现资源
- **原始论文**：[Nature Communications (2020)](https://doi.org/10.1038/s41467-020-15809-5) | [PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC7170881/)
- **相关站内资源**：[HiCExplorer 方法页](../../methods/hicexplorer/)
- **数据复现**：原始 Hi-C 与 RNA-seq 数据详见原文 Data Availability 部分（NCBI GEO）。
