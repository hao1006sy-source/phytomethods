---
title: "Variation graph toolkit improves read mapping by representing genetic variation in the reference"
summary: "介绍变异图工具及基于图的 reads 比对。"
authors: "Garrison E et al."
year: 2018
journal: Nature Biotechnology
doi: 10.1038/nbt.4227
type: method
methodIds: [vg]
domainIds: [pangenomics-structural-variation]
speciesIds: []
status: published
updatedAt: 2026-11-21
---
## 方法贡献
vg 将群体遗传变异编码为带嵌入路径的双向序列图，并提供图构建、编辑、读段比对和坐标投影等计算方法。论文以 GCSA2 索引寻找图上种子，再进行局部图比对；人类基准显示，当读段包含非参考等位序列时，图参考比对可减轻线性参考偏倚。原论文指出 vg 的图上映射与独立基因型调用器功能互补，不应将映射结果直接等同于变异分型。论文发表于 Nature Biotechnology 36(9):875–879（2018）。[原文与 PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC6126949/)；[PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/30125266/)。
