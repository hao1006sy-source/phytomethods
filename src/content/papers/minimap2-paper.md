---
title: "Minimap2: pairwise alignment for nucleotide sequences"
summary: "介绍 minimizer 种子、锚点链化及碱基级动态规划的通用核苷酸序列比对方法。"
authors: "Li H"
year: 2018
journal: Bioinformatics 34(18):3094–3100
doi: 10.1093/bioinformatics/bty191
type: method
methodIds: [minimap2]
domainIds: [pangenomics-structural-variation]
speciesIds: []
status: draft
updatedAt: 2026-11-21
---
minimap2 原始方法将序列比对组织为 minimizer 锚点发现、链化和链间动态规划比对，并针对组装比对、长读段、RNA 等不同任务提供不同配置。本文是通用算法方法论文，不代表特定植物基因组的性能验证。[PubMed/PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6137996/)；[出版方页面](https://academic.oup.com/bioinformatics/article/34/18/3094/4994778)。
