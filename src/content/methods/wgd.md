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
status: published
updatedAt: 2026-11-22
---
## 研究问题与开发背景
wgd v2 是陈恒驰、Arthur Zwaenepoel、Yves Van de Peer 等提出的古多倍化分析工具集。它围绕重复基因、同义替换率（Ks）、共线性和事件时间等证据，帮助研究者提出并比较 WGD 假设。[方法论文](https://doi.org/10.1093/bioinformatics/btae272)。仓库标示 GPL-3.0 许可。

## 核心思想与计算步骤
从候选重复基因出发，构建序列比对和 Ks 分布；结合基因位置寻找同源区块，并比较物种内与物种间信号。wgd v2 包含重复基因集划分、Ks 年龄分布、共线锚点 Ks、混合模型、谱系替换速率校正及 WGD 年代估计流程。年代流程需提供起始树和化石校准，可调用 MCMCTree、BEAST 或 r8s；这些是不同的时间推断后端。Ks 峰是待解释的基因分化聚集，单个峰不能独立证明 WGD；局部重复、低质量比对、基因丢失及不同谱系速率都可能影响结果。

## 输入、输出与参数
数据可以包括编码序列、蛋白、基因位置及物种信息；不同子命令所需输入不同。官方 v2 流程中 `wgd dmd` 生成重复基因家族 TSV，`wgd ksd` 计算 Ks 表，`wgd syn` 结合基因注释、家族与 Ks 识别共线锚点及区块，`wgd peak` 从锚点 Ks 分布提取候选峰和用于定年的锚点集合。输出目录及列名随命令和版本变化，需保留实际版本帮助、完整命令、过滤规则和日志。[官方 Recipes](https://github.com/heche-psb/wgd-v2-docs/blob/main/docs/source/recipes.rst)。本机尚未执行工具。

## 方法比较与植物案例
共线区块提供基因位置与顺序证据，Ks 分布概括序列分化，基因树和物种树用于评估事件与谱系分化的关系。方法论文以海草 *Posidonia oceanica* 和其他植物基因组展示 wgd v2 的跨谱系速率校正、共线锚点、混合模型及复制事件定年；结果应按论文的样本和校准条件阅读。[原文](https://pmc.ncbi.nlm.nih.gov/articles/PMC11078771/)，[官方安装文档](https://wgdv2.readthedocs.io/en/latest/installation.html)给出的版本示例为 2.0.19。

## 上下游与研究边界
上游包括序列注释、同源基因识别和质量控制；下游结合共线深度、系统发育、外群和可能的化石校准评估事件。输出中的峰值或拟合成分是模型结果，其生物学含义需要独立证据。软件版本与参数需在真实流程中记录，实战教程仍待建设。
