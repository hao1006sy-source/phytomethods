---
title: "DoubletFinder: Doublet Detection in Single-Cell RNA Sequencing Data Using Artificial Nearest Neighbors"
summary: "以人工合成双细胞邻居识别液滴单细胞表达数据中的 doublet 候选。"
authors: "McGinnis CS, Murrow LM, Gartner ZJ"
year: 2019
journal: Cell Systems
doi: 10.1016/j.cels.2019.03.003
type: method
methodIds: [doubletfinder]
domainIds: [single-cell-spatial-omics]
speciesIds: []
status: published
updatedAt: 2026-11-22
---
## 方法论文
DoubletFinder 通过随机抽取细胞对并合成表达 profile，在 PCA 邻近空间计算真实观测对人工 doublet 的邻近程度，输出 pANN 及预期 doublet 数对应的候选标签。性能依赖捕获率、细胞异质性、参数和同型 doublet 比例；预测标签须结合实验捕获率和标记检查。[Cell Systems 原文](https://doi.org/10.1016/j.cels.2019.03.003)；[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC6853612/)。
