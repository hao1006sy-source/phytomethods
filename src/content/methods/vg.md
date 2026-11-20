---
title: vg
name: vg
summary: 支持变异图构建、索引、序列比对与变异分析。
dataType: 变异图 / 测序 reads
principle: 图索引与序列比对
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-06]
principleIds: [graph-genomics]
dataIds: [graph]
paper: vg-paper
repository: https://github.com/vgteam/vg
status: draft
updatedAt: 2026-11-20
---
## 方法定位
vg 是处理变异图的一组工具；不同子命令负责图的表示、索引、reads 比对及变异相关分析。读取比对可沿图中候选路径搜索，结果依赖输入图、索引、读长和版本。

## 输入输出与解释
输入可能包括图、参考路径和 reads；使用哪种图格式及索引取决于具体流程。输出的图比对与基因型需明确图版本及参考路径坐标，不应将图节点编号直接当成通用染色体坐标。[官方仓库](https://github.com/vgteam/vg)提供版本对应的流程。

## 原始论文
[vg 方法论文](https://doi.org/10.1038/nbt.4227)讨论用变异图表示参考中的变异并改进 reads 比对。植物应用案例见下节。

## 已核实的植物案例
Kopalli 等在高粱泛基因组评估中使用 Giraffe 进行图参考读段比对。比对结果依赖构图、测序数据、映射质量阈值和评价区域。[GigaScience 原文](https://doi.org/10.1093/gigascience/giaf121)。
