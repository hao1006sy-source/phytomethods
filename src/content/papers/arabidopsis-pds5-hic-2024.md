---
title: "Mutations of PDS5 genes enhance TAD-like domain formation in Arabidopsis thaliana"
summary: "Hi-C 分析显示拟南芥 PDS5 突变体出现增强的 TAD-like 结构。"
authors: "Göbel AM, Zhou S, Wang Z, et al."
year: 2024
journal: Nature Communications
doi: 10.1038/s41467-024-53760-x
type: application
methodIds: []
domainIds: [epigenomics-3d-genome]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
与动物基因组中普遍存在由 CTCF 和黏连蛋白（cohesin）介导的明显拓扑关联结构域（TAD）不同，野生型拟南芥基因组中 TAD-like 结构域较为微弱。Göbel 等（2024）以 **拟南芥黏连蛋白释放因子 *PDS5* 基因家族多重突变体** 为材料，开展高分辨率 **Hi-C** 与转录组测序，探究黏连蛋白在植物三维染色质折叠中的调控作用。

## 分析流程
1. **Hi-C 接触矩阵构建与标准化**：对野生型与 *pds5* 突变体叶片开展 Hi-C 测序，构建不同分辨率（如 10 kb、25 kb）染色质接触矩阵并执行均衡化校正。
2. **TAD-like 结构域与环（Loop）识别**：计算绝缘评分（insulation score）与方向性指数，定量比较 *pds5* 突变体与野生型间 TAD-like 边界强度及长程染色质环的变化。
3. **表观修饰与转录关联**：整合组蛋白修饰（如 H3K27me3、H3K4me3）与 RNA-seq 差异表达数据，评估增强的 TAD-like 结构域对基因转录调控的影响。

## 软件明细表格
| 方法 / 分析模块 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **Hi-C 矩阵与绝缘评分分析** | 定量 *pds5* 突变体 TAD-like 结构域边界强度 | 揭示 *PDS5* 缺失导致拟南芥染色体上出现类似动物的清晰 TAD-like 结构 |
| **多组学关联分析** | 关联三维结构域边界与组蛋白修饰/转录变化 | 证明植物同样存在依赖黏连蛋白动态周转的三维染色质环挤压机制 |

## 主要科研发现
- 发现拟南芥 *PDS5* 基因突变会显著**增强全基因组 TAD-like 结构域与染色质环的形成**，改变了植物"缺乏典型 TAD"的传统认知。
- 提示植物中黏连蛋白在染色质上的滞留时间调控（由 PDS5 介导）是决定三维结构域可观测性的关键。

## 阅读与数据复现资源
- **原始论文**：[Nature Communications (2024)](https://doi.org/10.1038/s41467-024-53760-x)
- **数据复现**：原始 Hi-C 与 RNA-seq 测序数据详见原文 Data Availability 部分（NCBI GEO）。
