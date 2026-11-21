---
title: "selscan: an efficient multi-threaded program to perform EHH-based scans for positive selection"
summary: "介绍用于计算 EHH、iHS 和 XP-EHH 等统计量的多线程软件实现。"
authors: "Szpiech ZA, Hernandez RD"
year: 2014
journal: Molecular Biology and Evolution
doi: 10.1093/molbev/msu211
type: method
methodIds: [selscan]
domainIds: [population-genetics]
speciesIds: []
status: published
updatedAt: 2026-11-22
---
## 软件贡献

Szpiech 与 Hernandez 描述 `selscan`，用于高效计算 EHH 相关的正选择扫描统计量，并报告其多线程实现。该软件论文介绍的是程序计算方法和运行性能；XP-EHH 的统计思想来源于更早的 Sabeti 等 2007 年方法论文。

当前项目代码库持续增加统计量、输入形式和平台构建。复现应明确具体发行版，分别引用使用到的统计量原始方法、软件实现论文及版本。[论文全文](https://www.szpiech.com/pdfs/SzpiechAndHernandez2014-MBE-selscan.pdf)；[DOI](https://doi.org/10.1093/molbev/msu211)；[PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/25064563/)。

软件：[selscan 官方 GitHub](https://github.com/szpiech/selscan)；XP-EHH 原始方法：[Sabeti 等，2007](../xpehh-paper/)；植物应用：[韩国杂草稻研究](../rice-weedy-selection/)；工具详情：[selscan](../../methods/selscan/)。
