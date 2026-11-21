---
title: "EUPAN enables pan-genome studies of a large number of eukaryotic genomes"
summary: "介绍面向大规模真核生物泛基因组分析与基因 PAV 识别的工具集和 Map-to-pan 流程。"
authors: "Hu Z, Sun C, Lu K-C, Chu X, Zhao Y, Lu J, Shi J, Wei C"
year: 2017
journal: Bioinformatics
doi: 10.1093/bioinformatics/btx170
type: method
methodIds: [eupan]
domainIds: [pangenomics-structural-variation]
speciesIds: [rice]
status: draft
updatedAt: 2026-11-21
---
## 方法贡献
EUPAN 将真核生物多样本泛基因组分析组织为并行质量控制、个体组装、参考基础的 pan-genome 序列构建、reads 映射、基因/基因家族 PAV 判定及下游泛基因组分析。其 Map-to-pan 策略将测序 reads 映射到参考序列与新增非冗余序列的组合，再根据基因体和编码序列覆盖定义 PAV，旨在降低大规模样本逐一高质量组装带来的成本。[PubMed 书目及摘要](https://pubmed.ncbi.nlm.nih.gov/28369371/)、[DOI](https://doi.org/10.1093/bioinformatics/btx170)。

方法论文以水稻数据展示工具能力；其具体性能与 PAV 准确性依赖样本深度、序列与注释质量及判定阈值。工具页保留草稿，且本机没有运行该软件。
