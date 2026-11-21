---
title: "Benchmarking long-read aligner-caller pipelines for structural variant detection across ten angiosperm species with PacBio high-fidelity sequencing"
summary: "建立十种被子植物的 HiFi 结构变异真值集，比较 91 种比对器—变异检测器流程。"
authors: "Zhang Z, Xu J, Wang Z, Yu T, He K, Liu D, Zhao Y, Wang K, Xie Z, Huang C, Wang J, Li H"
year: 2026
journal: Genome Biology
doi: 10.1186/s13059-026-04300-x
type: application
methodIds: [sniffles2, cutesv]
domainIds: [pangenomics-structural-variation]
speciesIds: []
status: draft
updatedAt: 2026-11-21
---
## 研究问题与数据
Zhang 等为十种被子植物构建碱基级结构变异真值集，并系统评估 91 种 PacBio HiFi 比对器—caller 组合。研究处理的是植物跨物种方法性能；结果显示各 pipeline 与物种间有明显差异，缺失检测整体表现高于插入检测。

## 方法关系与主要结果
作者报告 NGMLR/Sniffles2 在缺失检测的跨物种稳定性方面表现较好；插入检测则报告 Minimap2/Sniffles1、Minimap2/cuteSV2 和 pbmm2/cuteSV1 具有较强稳定性。分析还发现，大型 SV 与重复区（特别是简单重复）中的检测准确性下降，并报告按每条单倍型约 15× 深度时 F1 达峰的研究内结果。该覆盖结论依赖本文真值构建、物种和评价设置，不能直接视作项目通用测序推荐深度。

Sniffles2 和 cuteSV 在这项论文中作为 pipeline 组件接受跨被子植物评估；该论文的版本记录和性能表应与工具当前 release 分开引用。本文为 2026 年 10 月 15 日出版的在线早期版本，页面说明后续将替换为最终版本。[Genome Biology 出版方页面](https://link.springer.com/article/10.1186/s13059-026-04300-x)。

## 文献与工具
- [DOI](https://doi.org/10.1186/s13059-026-04300-x)
- [补充材料入口](https://link.springer.com/article/10.1186/s13059-026-04300-x#Sec23)
- 相关工具：[Sniffles2](../../methods/sniffles2/)、[cuteSV](../../methods/cutesv/)
