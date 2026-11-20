---
title: PGGB
name: PGGB
summary: 基于全对全序列比对构建泛基因组变异图。
dataType: 多样本序列 FASTA
principle: 全对全比对与图规范化
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-05]
principleIds: [graph-genomics]
dataIds: [assembly]
paper: pggb-paper
repository: https://github.com/pangenome/pggb
status: draft
updatedAt: 2026-11-20
---
## 研究问题与流程
PGGB 从输入序列间的全对全比对构建泛基因组图。官方说明中，流程包括 wfmash 比对、seqwish 图诱导与图规范化，最后可输出 GFA 图与诊断可视化。图内容受输入序列和过滤设置约束。

## 输入输出与参数
输入为经过准备的 FASTA，官方建议建立序列索引并规范样本命名。`-i` 指定输入，`-o` 输出目录，`-t` 设置线程；相似度、片段长度和单倍型数等参数需按所用版本的[官方文档](https://github.com/pangenome/pggb)选择。输出可供兼容的图工具继续分析。

## 方法论文与植物应用
[PGGB 论文](https://doi.org/10.1038/s41592-024-02430-3)介绍该方法。植物基因组中的重复和多倍性增加比对和计算复杂度；具体植物案例需单独核对论文方法，不根据其他研究的泛基因组概念推断使用了 PGGB。

## 已核实的植物案例
Kopalli 等在高粱染色体数据中以 PGGB 构图，与 Minigraph-Cactus 和 Minigraph 进行比较，并报告各方法和评估参数；结果应按论文所用输入与评价指标理解。[GigaScience 原文](https://doi.org/10.1093/gigascience/giaf121)。
