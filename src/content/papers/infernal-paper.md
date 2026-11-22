---
title: "Infernal 1.1: 100-fold faster RNA homology searches"
summary: "介绍使用协方差模型进行 RNA 家族同源搜索的 Infernal 1.1。"
authors: "Nawrocki EP and Eddy SR"
year: 2013
journal: Bioinformatics
doi: 10.1093/bioinformatics/btt509
type: method
methodIds: []
domainIds: [genome-annotation]
speciesIds: []
updatedAt: 2026-11-22
---
## 研究问题与方法贡献

RNA 同源检测需要同时考虑一级序列与保守二级结构。Infernal 1.1 改进基于协方差模型（CM）的 RNA 家族搜索流程，使大规模数据库搜索更快，同时保留模型所表达的结构化序列约束。该软件与 Rfam 家族模型配合使用。

## 计算原理

CM 类似于包含序列和结构状态的概率模型，可对同源 RNA 的碱基配对与未配对位置进行评分。`cmsearch` 将模型搜索目标序列，输出显著性、坐标和链方向；`cmalign` 可将命中与模型对齐。数据库校准、模型复杂度、阈值与目标序列数量会影响资源消耗和命中集合。

## 结果、限制与植物应用

论文报告 Infernal 1.1 相对先前版本显著加速，标题中的倍数反映作者的测试设置，不应直接当作任何硬件和数据库上的固定加速比。CM 搜索适合已有家族模型的同源检测，不能替代从头发现所有物种特异 ncRNA。植物分析中可借助 Rfam 搜索保守 RNA 家族，并结合 tRNA 专用工具、转录证据和人工检查。

## 阅读重点

阅读时关注 CM 模型、过滤/加速策略及作者采用的数据集和比较版本；运行时记录 Infernal 与 Rfam 版本、阈值和命令。植物 T2T ncRNA 流程案例：[番茄研究](https://doi.org/10.1093/gigascience/giaf058)。

原始论文：[Bioinformatics](https://doi.org/10.1093/bioinformatics/btt509)；[Infernal 官方文档](http://eddylab.org/infernal/)。
