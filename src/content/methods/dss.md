---
title: DSS
name: DSS
summary: 对 BS-seq 甲基化计数拟合 beta-binomial 模型，检测差异位点与区域。
dataType: 样本级胞嘧啶甲基化 reads 计数
principle: beta-binomial 回归与离散度收缩
domainIds: [epigenomics-3d-genome]
topicIds: [m07-topic-03]
principleIds: [beta-binomial]
dataIds: [methylation-counts]
paper: dss-paper
repository: https://bioconductor.org/packages/DSS/
version: "2.60.0 (Bioconductor 3.23)"
status: published
updatedAt: 2026-11-22
---
## 软件背景与统计问题
DSS（Dispersion shrinkage for sequencing data）用于测序计数数据的差异分析，其中 DNA 甲基化分析以每个样本的甲基化与总覆盖计数建模。方法论文提出从多个位点共享信息估计离散度的分层模型。[Feng、Conneely 与 Wu，2014](https://doi.org/10.1093/nar/gku154)；[Bioconductor 官方用户指南](https://bioconductor.org/packages/release/bioc/vignettes/DSS/inst/doc/DSS.html)。

## 原理与分析流程
对位点 $i$ 的样本 $j$，以总覆盖 $N_{ij}$ 为试验次数、甲基化 reads 数 $M_{ij}$ 为成功次数；不同样本的真实甲基化比例由条件和协变量解释，并允许额外样本间离散。beta-binomial 模型同时利用测序深度与生物学重复变异；DSS 的离散度估计通过贝叶斯层次模型的收缩获得。DMR 构建在位点检验和区域统计基础上进行，合并阈值、区域长度、最少位点数和多重校正都会改变结果。[方法论文](https://doi.org/10.1093/nar/gku154)。

实务流程先将甲基化提取工具生成的样本级计数组织成每个位点的总覆盖和甲基化数，再按实验设计选择两组比较或一般线性模型。CG、CHG 与 CHH 通常应分别分析；不能把 reads 当作生物学重复，也不应把低覆盖比例直接按无误差连续数据做 t 检验。报告样本数、过滤标准、背景类别、差异方向、效应量、区域化规则和 FDR。

## 输入、输出与应用边界
输入为染色体、坐标、总 reads、甲基化 reads，以及分组和可选协变量。输出可包含位点检验统计量和按阈值定义的 DMR。不同生物学设计要求相应模型；重复数量、覆盖度、序列背景和批次影响功效。DSS 是统计建模工具，不执行 BS-seq reads 比对；上游甲基化提取可由 Bismark 等完成。

## 版本和延伸资源
Bioconductor release 页面、用户指南和软件手册用于核对当前函数、输入类与支持模型；此工具未在本机运行。相关入口：[DMR 专题](../../topics/epigenomics-3d-genome/m07-topic-03/)、[DSS 方法论文](../../papers/dss-paper/)与[Bismark 工具页](../../methods/bismark/)。植物案例见[小麦甲基化研究](../../papers/wheat-methylome-2015/)，该文使用 methylKit，本站不将其归为 DSS 应用。
