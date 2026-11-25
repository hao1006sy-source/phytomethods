---
title: "Single-cell transcriptome atlas and chromatin accessibility landscape reveal differentiation trajectories in the rice root"
summary: "结合单细胞转录组和染色质可及性研究水稻根细胞分化。"
authors: "Zhang TQ, Chen Y, Liu Y, et al."
year: 2021
journal: Nature Communications
doi: 10.1038/s41467-021-22352-4
type: application
methodIds: [scanpy]
domainIds: [single-cell-spatial-omics]
speciesIds: [rice]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
单子叶植物水稻的根尖具有独特的解剖结构与细胞分化模式，但长期缺乏单细胞分辨率的转录组与染色质可及性图谱。Zhang 等（2021）对水稻根尖原生质体分别开展 **scRNA-seq** 与 **scATAC-seq** 测序（两种模态独立测序，非同细胞配对 multiome），系统刻画水稻根尖各细胞类型的分化轨迹与表观调控网络。

## 分析流程
1. **单细胞表达矩阵构建与批次校正**：使用 **Scanpy 1.4.5.1** 进行质量控制、高变基因筛选，并采用 ComBat 消除批次效应，随后执行 PCA 降维、邻近图构建、Diffusion Map 与 ForceAtlas2 可视化。
2. **分化拟时序与 RNA 速率推断**：利用 **Palantir 0.2.2** 计算细胞分化潜能与拟时序轨迹，结合 **velocyto** 估算 RNA velocity 方向，相互印证根尖分生组织向成熟组织的发育流向。
3. **单细胞染色质可及性整合**：独立处理 scATAC-seq 数据，鉴定细胞类型特异的开放染色质峰（OCR）及富集的转录因子结合基序，与 scRNA-seq 转录因子表达谱进行关联分析。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **Scanpy 1.4.5.1** | scRNA-seq 质控、ComBat 去批次、PCA 与 ForceAtlas2 降维 | 清晰解析表皮、皮层、内皮层、中柱鞘等主要根尖细胞类型 |
| **Palantir 0.2.2** | 连续分化轨迹与分支概率推断 | 定量刻画根毛细胞与非根毛细胞等分支命运的连续转变过程 |
| **velocyto** | 基于剪接/未剪接 mRNA 比例估算 RNA 速率 | 为根尖细胞分化方向提供动力学方向的独立验证 |

## 主要科研发现
- 构建了高分辨率的水稻根尖单细胞转录组与染色质可及性图谱，识别出关键发育调控因子与细胞类型特异顺式调控元件。
- 跨物种比较揭示了水稻与拟南芥根尖保守与分化的细胞类型调控程序。

## 阅读与数据复现资源
- **原始论文**：[Nature Communications (2021)](https://doi.org/10.1038/s41467-021-22352-4) | [PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC8024345/)
- **PubMed**：[PMID: 33824350](https://pubmed.ncbi.nlm.nih.gov/33824350/)
- **数据复现**：原始 scRNA-seq 与 scATAC-seq 数据详见原文 Data Availability 部分（NCBI GEO）。
