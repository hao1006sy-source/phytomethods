---
title: "InterProScan 5: genome-scale protein function classification"
summary: "介绍 InterProScan 5 的大规模蛋白签名分析及 InterPro 条目映射。"
authors: "Jones P et al."
year: 2014
journal: Bioinformatics
doi: 10.1093/bioinformatics/btu031
type: method
methodIds: [interproscan]
domainIds: [genome-annotation]
speciesIds: []
updatedAt: 2026-11-22
---
## 研究问题与方法贡献

蛋白组规模的功能注释需要运行多个专业数据库的签名模型，并将不同分析结果整合为可比较的分类。本文介绍 InterProScan 5，将成员数据库分析、匹配信息整合及 InterPro 条目关联纳入大规模注释框架。

## 算法与输出

输入蛋白序列后，成员分析器依据 profile、HMM、模式或其他签名方法识别相应家族/结构域。InterProScan 汇集匹配坐标、模型来源和显著性，并关联可用 InterPro、GO 等术语。不同成员库的统计方法并不相同，因此输出应保留分析来源与版本，不宜把全部匹配视为同一置信度。

## 结果与应用边界

论文展示了面向大规模蛋白组的整合架构和性能改进。方法提供计算预测证据，不能替代实验功能测定；远缘同源、短序列、低复杂度区域和缺少数据库模型的蛋白会产生不确定或无命中结果。植物基因组研究常将其与同源注释及通路数据库共同使用。

## 阅读重点

关注分析器集合、InterPro 映射和 GO 关联逻辑，并核对论文发表时与当前数据库版本的差异。芒果基因组案例报告使用 InterProScan 进行功能注释：[原始应用论文](https://doi.org/10.1002/tpg2.20441)。

原始方法论文：[Bioinformatics](https://doi.org/10.1093/bioinformatics/btu031)；[官方输出格式说明](https://interproscan-docs.readthedocs.io/en/v5/OutputFormats.html)。
