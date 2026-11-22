---
title: "Haplotype-resolved de novo assembly using phased assembly graphs with hifiasm"
summary: "提出相位感知组装图，用高准确度长读长构建单倍型解析组装。"
authors: "Cheng H et al."
year: 2021
journal: Nature Methods
doi: 10.1038/s41592-020-01056-5
type: method
method: hifiasm
methodIds: [hifiasm]
domainIds: [genome-assembly]
speciesIds: []
updatedAt: 2026-11-20
---

## 研究解读
提出相位感知组装图，用高准确度长读长构建单倍型解析组装。 原文包含实验与分析细节，可通过 DOI 查阅。

## 数据来源
[出版方原文](https://doi.org/10.1038/s41592-020-01056-5)。

## 研究背景与问题
高杂合二倍体组装常在两个困难之间取舍：把等位序列压成一个共识，或保留杂合分支却难以将整套染色体路径连续分开。该研究提出以高准确度长读段构建 phased assembly graph，目标是保留多个单倍型的连续性。

## 方法创新
论文介绍 Hifiasm 以 HiFi reads 纠错并产生相位感知组装图，再借助图结构进行单倍型输出和图 trio binning。其关键概念是图中保留并利用不同单倍型路径，而不只维持某一条 primary 路径的连续性。trio 模式通过亲本来源信息为 read k-mer/路径分组提供额外相位证据。

## 主要结果与材料范围
作者在 3 个人类和 5 个非人类数据集上评估方法，其中包括约 30 Gb 的加州红杉六倍体组装；研究报告 Hifiasm 在这些测试中的相位组装表现。该方法论文展示的是跨物种基准，不等价于直接的农作物应用论文；本库的植物软件应用案例另见 Macadamia jansenii 研究。

## 方法限制与阅读重点
结果依赖 HiFi 质量、覆盖、重复的可跨越性和样本倍性。图路径不保证所有杂合区都已分相，也不代表多倍体所有同源拷贝自动正确分离。精读时关注算法图表示、错误纠正与图清理、trio-binning 的输入和输出定义、与基准工具比较的评估指标，以及原始数据的遗传结构。复现实操应固定软件 release 和参数。
