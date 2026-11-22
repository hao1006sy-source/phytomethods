---
title: "CAFE 5 models variation in evolutionary rates among gene families"
summary: "用生灭模型研究基因家族大小变化，并考虑家族间演化速率差异。"
authors: "Mendes FK, Vanderpool D, Fulton B, Hahn MW"
year: 2020
journal: Bioinformatics
doi: 10.1093/bioinformatics/btaa1022
type: method
methodIds: [cafe5]
domainIds: [comparative-genomics]
speciesIds: []
status: published
updatedAt: 2026-11-22
---
## 方法问题与计算模型
CAFE 5 使用物种树和基因家族大小，建模基因家族获得与丢失，并允许家族之间存在不同演化速率。其离散 Gamma 类别模型估计家族所属速率类别与相关后验概率；方法也处理基因组组装、注释和家族聚类产生的计数误差。模型输出是在给定树、计数和设置下的统计推断，需结合数据质量解释。[论文原文](https://doi.org/10.1093/bioinformatics/btaa1022)。

工具参数、模型和植物茶树应用分别见 [CAFE5 工具页](../../methods/cafe5/)及[茶树案例](../../papers/tea-comparative/)；本论文解释软件统计框架，不等同于个别植物研究的参数配置。
