---
title: "Pangenome graph construction from genome alignments with Minigraph-Cactus"
summary: "由多套组装构建序列图。"
authors: "Hickey G et al."
year: 2024
journal: Nature Biotechnology
doi: 10.1038/s41587-023-01793-w
type: method
methodIds: [minigraph-cactus]
domainIds: [pangenomics-structural-variation]
speciesIds: []
status: draft
updatedAt: 2026-11-21
---
## 方法贡献
Minigraph-Cactus 直接以多套基因组组装为输入，通过 Minigraph 先组织较大的结构变异，再用 Cactus 对组装进行多序列比对并生成碱基级图表示。工作流接收 FASTA 组装，可生成泛基因组图、组装间比对、VCF 及 vg Giraffe 所需索引；论文在人类 90 条单倍型上展示其可扩展性。该论文为方法研究，植物数据需由具体植物应用论文核实。期刊卷期引用年份为 2024，论文于 2023 年在线发表。[Nature Biotechnology 原文](https://doi.org/10.1038/s41587-023-01793-w)；[PMC 全文与图示说明](https://pmc.ncbi.nlm.nih.gov/articles/PMC10638906/)。
