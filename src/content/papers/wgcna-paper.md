---
title: "WGCNA: an R package for weighted correlation network analysis"
summary: "提出 WGCNA R 包，将表达相关转为加权网络并用于模块识别及性状关联。"
authors: "Langfelder P, Horvath S"
year: 2008
journal: BMC Bioinformatics
doi: 10.1186/1471-2105-9-559
type: method
methodIds: [wgcna]
domainIds: [regulatory-genomics-ai]
speciesIds: []
status: published
updatedAt: 2026-11-22
---
## 研究问题与方法贡献

高通量表达矩阵包含成千上万个基因，逐对相关性难以直接解释为模块或网络结构。该论文介绍 WGCNA R 包和加权相关网络分析流程，将基因间连续相关映射为边权，再利用拓扑重叠、层次聚类和动态剪切识别共表达模块，并把模块特征表达与外部性状关联。

## 计算原理与实现

输入通常为样本 × 基因表达矩阵。对基因对计算相关 $r_{ij}$，再按 signed/unsigned 约定和软阈值 $\beta$ 转换为邻接权重 $a_{ij}$。拓扑重叠将直接相邻程度与共同邻居纳入相似性；层次聚类形成树状结构，动态树切割得到模块。模块特征基因通常由模块表达第一主成分概括。包还包括模块合并、模块—性状关联、连接度和可视化等实现。

## 主要价值与限制

加权网络保留相关强弱的连续差异，软阈值避免硬阈值将边简单切为有/无。结果受到样本量、样本构成、归一化、网络类型和模块参数影响。模块—性状关联属于统计关联；共同表达可能由处理、组织比例或批次驱动，hub 排名也不能证明调控因果。应评估参数敏感性、模块稳定性和多重检验，并使用独立数据或实验验证。

## 植物应用与阅读重点

紫米籽粒灌浆研究将 WGCNA 用于表达模块和抗氧化相关性状分析，提供直接的植物软件案例；阅读时检查其实验样本、模块—性状关系和候选验证范围。[原始植物研究](https://doi.org/10.1038/s41598-024-73698-w)。另见[方法原文](https://doi.org/10.1186/1471-2105-9-559)与[官方 CRAN 包](https://cran.r-project.org/package=WGCNA)。模拟教程结果与该植物研究数据相互独立。
