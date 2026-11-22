---
title: "wgd v2: a suite of tools to uncover and date ancient polyploidy and whole-genome duplication"
summary: "用于重复基因 Ks、共线性与古多倍化时间分析的工具集。"
authors: "Chen H, Zwaenepoel A, Van de Peer Y"
year: 2024
journal: Bioinformatics
doi: 10.1093/bioinformatics/btae272
type: method
methodIds: [wgd]
domainIds: [comparative-genomics]
speciesIds: []
status: published
updatedAt: 2026-11-22
---
## 方法问题与分析框架
wgd v2 提供全基因组重复基因家族、同义替换率（Ks）、共线锚点及多倍化年代分析组件。研究者可将 whole-paranome Ks 分布与共线 anchor-pair Ks 分布分别检查，再评估候选峰和谱系替换速率；定年流程需要额外的物种树、化石校准和指定的时间推断程序。论文展示在海草 *Posidonia oceanica* 等植物上的分析，结果依赖数据、模型和校准设置。

工具由序列聚类、Ks 估计、共线性分析、峰拟合与可选时间推断步骤构成；各步骤生成的统计量支持不同判断，单独的 Ks 峰不等同于 WGD 事件。版本化命令和输入要求见[官方文档](https://wgdv2.readthedocs.io/en/latest/recipes.html)。作者、卷期和 DOI 可由[论文原文](https://doi.org/10.1093/bioinformatics/btae272)与[PubMed](https://pubmed.ncbi.nlm.nih.gov/38632086/)核对。
