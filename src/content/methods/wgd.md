---
title: wgd v2
name: wgd
summary: 结合 Ks、共线性和系统发育线索分析古代全基因组复制。
dataType: 编码序列 / 蛋白 / 基因注释
principle: Ks 分布与共线性分析
domainIds: [comparative-genomics]
topicIds: [m04-topic-06]
principleIds: [collinearity, phylogenetics]
dataIds: [assembly, proteins]
paper: wgd-v2-paper
repository: https://github.com/heche-psb/wgd
status: draft
updatedAt: 2026-11-21
---
## 研究问题与开发背景
wgd v2 是陈恒驰、Arthur Zwaenepoel、Yves Van de Peer 等提出的古多倍化分析工具集。它围绕重复基因、同义替换率（Ks）、共线性和事件时间等证据，帮助研究者提出并比较 WGD 假设。[方法论文](https://doi.org/10.1093/bioinformatics/btae272)。仓库标示 GPL-3.0 许可。

## 核心思想与计算步骤
从候选重复基因出发，构建序列比对和 Ks 分布；结合基因位置寻找同源区块，并比较物种内与物种间信号。工具包含峰值或混合模型分析、跨谱系速率差异处理和年代估计等功能。Ks 峰是待解释的基因分化聚集，单个峰不能独立证明 WGD；局部重复、低质量比对、基因丢失及不同谱系速率都可能影响结果。

## 输入、输出与参数
数据可以包括编码序列、蛋白、基因位置及物种信息；不同子命令所需输入不同。官方文档列出 `wgd syn` 用于共线性分析、`wgd mix` 用于 Ks 分布的混合模型分析；`--ks_range`、分箱数量和拟合组分等设置会影响展示和推断。运行前应查阅实际版本帮助，记录过滤、取样、随机种子和统计模型；输出的数据表与图应保留坐标、区间及组分信息。[官方项目](https://github.com/heche-psb/wgd)。本机尚未执行工具。

## 方法比较与植物案例
共线区块提供基因位置与顺序证据，Ks 分布概括序列分化，基因树和物种树用于评估事件与谱系分化的关系。方法论文以海草 *Posidonia oceanica* 和其他植物基因组展示 wgd v2；具体结果应按论文所用样本和校准条件阅读。[原文](https://pmc.ncbi.nlm.nih.gov/articles/PMC11078771/)。

## 上下游与研究边界
上游包括序列注释、同源基因识别和质量控制；下游结合共线深度、系统发育、外群和可能的化石校准评估事件。输出中的峰值或拟合成分是模型结果，其生物学含义需要独立证据。软件版本与参数需在真实流程中记录，实战教程仍待建设。
