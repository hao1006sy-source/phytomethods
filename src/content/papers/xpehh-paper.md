---
title: "Genome-wide detection and characterization of positive selection in human populations"
summary: "在 HapMap 群体基因组扫描中提出并应用跨群体延伸单倍型纯合性 XP-EHH。"
authors: "Sabeti PC, Varilly P, Fry B, et al.; International HapMap Consortium"
year: 2007
journal: Nature
doi: 10.1038/nature06250
type: method
methodIds: [selscan]
domainIds: [population-genetics]
speciesIds: []
status: published
updatedAt: 2026-11-22
---
## 方法贡献

Sabeti 等提出 XP-EHH，用两群体间延伸单倍型纯合性差异识别某一群体中接近或达到固定、而对照群体尚未同样固定的选择信号。其方法在 2007 年的人类 HapMap 群体数据中应用，提供了跨群体长单倍型扫描的计算框架。

统计值基于两个群体 EHH 延伸积分的比较；方向依赖输入群体排序，数据需要适当的密集单倍型和重组/遗传坐标处理。原论文中的统计定义与后续软件实现的定相、积分截断和标准化选项应分别核对。[Nature 原文](https://www.nature.com/articles/nature06250)；[PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/17943131/)；[DOI](https://doi.org/10.1038/nature06250)。

该论文建立的是统计方法，未介绍 PhytoMethods 页面所列 `selscan` 版本。软件实现与安装见[XP-EHH/selscan 工具页](../../methods/selscan/)；植物应用见[韩国杂草稻研究](../rice-weedy-selection/)和[M05-05 专题](../../topics/population-genetics/m05-topic-05/)。
