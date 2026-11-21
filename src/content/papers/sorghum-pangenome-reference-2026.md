---
title: "A sorghum pangenome reference improves global crop trait discovery"
summary: "以 33 个基因组构建高粱泛基因组参考，并连接群体多样性与作物性状分析。"
authors: "Morris GP, Harder AM, Healey AL, et al."
year: 2026
journal: Nature 652:1245–1253
doi: 10.1038/s41586-026-10229-9
type: application
methodIds: [minigraph-cactus, vg, odgi]
domainIds: [pangenomics-structural-variation]
speciesIds: [sorghum]
status: published
updatedAt: 2026-11-22
---

## 研究范围

Morris 等建立了一个由 33 个基因组组成的高粱泛基因组参考，并构建包含 1,984 份栽培种和地方品种的多样性面板，用于研究泛基因组遗传差异与作物性状发现。本文作为植物泛基因组图的应用案例，书目信息依据 Nature 与 PubMed 核实。

## 图构建与可视化职责

作者以 BTx623 V5 为主参考，按染色体使用 Minigraph-Cactus v2.9.3 构建图；使用 vg v1.59.0 合并和准备裁剪后的染色体图。ODGI v0.9.0 用于检查不同基因组在图中的表示，sequenceTubeMap v0.1.0 用于展示目标区域的变异。这些功能分别对应构图、图处理、图中路径检查和区域可视化，不能归并为单一 ODGI 分析步骤。

在 dhurrin 生物合成基因簇与 SH1 位点，研究继续使用 vg 和 vcfwave 筛选特定大小以上的等位变异。相关方法及性状结论遵循论文设定；本案例不表示本文网站已重新运行原始流程。

原文：[Nature](https://www.nature.com/articles/s41586-026-10229-9)；[PubMed](https://pubmed.ncbi.nlm.nih.gov/41813899/)；[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC13128447/)。书目信息：Morris GP, Harder AM, Healey AL, et al. *Nature* 652, 1245–1253 (2026). DOI: 10.1038/s41586-026-10229-9.
