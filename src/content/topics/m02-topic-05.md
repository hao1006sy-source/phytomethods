---
title: 非编码 RNA 注释
summary: 利用序列与结构证据识别不同类型非编码 RNA。
domain: genome-annotation
methods: []
updatedAt: 2026-11-20
---
## 研究问题和类型
tRNA、rRNA、miRNA 和长链非编码 RNA（lncRNA）具有不同长度、结构和功能。非编码并不代表缺少生物学作用；单靠缺乏开放阅读框不足以确认功能。

## 序列、结构与协方差模型
RNA 同源搜索可利用保守序列和二级结构。协方差模型联合建模序列位置及配对碱基关系；互补碱基对变化可以保留结构。Infernal 使用协方差模型搜索 RNA 同源序列；tRNAscan-SE 针对 tRNA 基因识别与分类设计。lncRNA 常需要转录证据、编码潜力与表达信息的综合判断。

## 方法差异与植物挑战
保守结构模型适用于已有 RNA 家族，物种特异序列和弱表达转录本可能难以检出。植物基因组中的重复和多拷贝区域可能产生假阳性；应结合位置、结构、同源证据及表达核查。

## 进一步阅读
[Infernal 1.1](https://doi.org/10.1093/bioinformatics/btt509)；[tRNAscan-SE 2.0](https://doi.org/10.1093/nar/gkab688)。植物注释研究应记录家族模型版本和参数。

## 植物案例
[芒果基因组研究](https://doi.org/10.1002/tpg2.20441)将 rRNA 序列用于检查部分 contig 中的核糖体重复。该例说明植物组装和注释中需要关注 rRNA 重复区；论文此处并未声称使用 Infernal。
