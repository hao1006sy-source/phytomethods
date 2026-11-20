---
title: Minigraph-Cactus
name: Minigraph-Cactus
summary: 结合组装比对与碱基级对齐构建泛基因组图。
dataType: 多个组装 FASTA
principle: 泛基因组图构建
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-05]
principleIds: [graph-genomics]
dataIds: [assembly]
paper: minigraph-cactus-paper
repository: https://github.com/ComparativeGenomicsToolkit/cactus
status: draft
updatedAt: 2026-11-20
---
## 研究问题与原理
Minigraph-Cactus 是从多个组装构建序列图的流程。它结合 minigraph 的组装到图映射与 Cactus 的碱基级比对，将不同样本的序列及其关系组织为图，并对接下游图工具。输入质量与参考选择会影响最终结果。

## 输入、输出与适用范围
需要多套经质量控制的组装及流程所需配置；具体准备、计算资源、索引和输出格式请参考[官方文档](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/doc/pangenome.md)。运行大型植物多倍体数据前应按同源区域、样本数量和算力规划。

## 论文与对比
[原论文](https://doi.org/10.1038/s41587-023-01793-w)以人类和果蝇数据展示方法；它与 PGGB 的输入组织和图构建过程不同，比较应基于相同输入及下游任务。植物应用案例见下节。

## 已核实的植物案例
Kopalli 等将 Minigraph-Cactus 应用于高粱染色体组装，和其他图构建方法比较，并报告图比对评估结果。[GigaScience 原文](https://doi.org/10.1093/gigascience/giaf121)。研究采用的工具版本和具体参数见原文方法部分。

## 流程及参数含义
官方 `cactus-pangenome` 流程的序列清单包含样本名和 FASTA 地址；工具先以 minigraph 构造和映射图，再进行分区与 Cactus 碱基级比对，并汇总各部分结果。`--reference` 指定参考样本，`--outDir` 和 `--outName` 控制输出位置和名称；`--gfa`、`--gbz` 等选项请求相应图输出。输出选项及格式需按具体版本官方帮助检查，图裁剪、参考路径选择和过滤也会影响下游内容。[官方流程文档](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/doc/pangenome.md)。

## 与 PGGB 的差异
Minigraph-Cactus 使用 minigraph 引导分区，再通过 Cactus 完成碱基级多序列比对；PGGB 通常先做序列全对全比对，再诱导和规范化图。前者的参考与分区设置、后者的比对阈值与序列范围均会影响表示和资源开销。研究者应依据目标区域、样本集合、可用资源及独立评价结果比较，不能只依据工具名称推断某图更完整。
