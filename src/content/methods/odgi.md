---
title: ODGI
name: ODGI
summary: 处理、统计和可视化泛基因组图及样本路径。
dataType: GFA / 泛基因组图
principle: 图存储与路径可视化
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-06, m03-topic-07]
principleIds: [graph-genomics]
dataIds: [graph]
paper: odgi-paper
repository: https://github.com/pangenome/odgi
status: draft
updatedAt: 2026-11-20
---
## 方法定位
ODGI 提供图及嵌入路径的处理、统计和可视化。它可用于理解图结构和不同样本经过的路径，功能定位应与专门的 reads 比对器区分。

## 数据和结果
图的导入、路径提取及可视化命令需要对应版本的图格式和参数；结果图中的布局距离不必然等于基因组距离。应保留输入图版本、路径名称与坐标映射。[官方文档](https://odgi.readthedocs.io/)列出支持操作。

## 方法论文
[ODGI 原始论文](https://doi.org/10.1093/bioinformatics/btac308)介绍图工具与可视化。植物多倍体的相似拷贝可能使局部图结构复杂，应配合组装和样本路径检查。

## 已核实的植物案例
Kopalli 等使用 ODGI 将高粱泛基因组图展平为序列，以配合 BUSCO 等指标进行评估；展平后的结果依赖图及转换方式，不能单独证明每条样本路径的完整性。[GigaScience 原文](https://doi.org/10.1093/gigascience/giaf121)。
