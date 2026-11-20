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
[原论文](https://doi.org/10.1038/s41587-023-01793-w)以人类和果蝇数据展示方法；它与 PGGB 的输入组织和图构建过程不同，比较应基于相同输入及下游任务。此处尚未添加经核实的植物应用案例。
