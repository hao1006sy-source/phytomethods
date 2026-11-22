---
title: "IQ-TREE 2: New Models and Efficient Methods for Phylogenetic Inference in the Genomic Era"
summary: "基于最大似然的系统发育树推断与模型选择方法。"
authors: "Minh BQ, Schmidt HA, Chernomor O, et al."
year: 2020
journal: Molecular Biology and Evolution
doi: 10.1093/molbev/msaa015
type: method
methodIds: [iqtree2]
domainIds: [comparative-genomics]
speciesIds: []
status: published
updatedAt: 2026-11-22
---
## 方法问题与计算流程
IQ-TREE 2 面向基于序列比对的最大似然系统发育推断。论文介绍了优化的树搜索与模型处理，整合 ModelFinder 模型选择、近似似然比检验和超快速 bootstrap 等功能。软件通过似然函数、替换模型及启发式搜索评估候选拓扑；不同支持度统计量有各自含义，不能互换解释。

该论文描述的是 2020 年 IQ-TREE 2 方法与功能版本。后续软件版本继续更新，复现时应同时记录可执行文件版本、模型、随机种子、搜索和支持度参数，以及 `.treefile`、`.iqtree` 和日志等输出。[论文原文](https://doi.org/10.1093/molbev/msaa015)、[官方命令文档](https://iqtree.github.io/doc/Command-Reference)。
