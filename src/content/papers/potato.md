---
title: "Chromosome-scale and haplotype-resolved genome assembly of a tetraploid potato cultivar"
summary: "该研究提供四倍体马铃薯染色体尺度单倍型组装案例。"
authors: "Sun H et al."
year: 2022
journal: Nature Genetics
doi: 10.1038/s41588-022-01015-0
type: application
methodIds: []
domainIds: [genome-assembly]
speciesIds: [potato]
updatedAt: 2026-11-20
---

## 研究解读
该研究提供四倍体马铃薯染色体尺度单倍型组装案例。 原文包含实验与分析细节，可通过 DOI 查阅。

## 数据来源
[出版方原文](https://doi.org/10.1038/s41588-022-01015-0)。

## 研究背景与目标
栽培马铃薯常为高度杂合自源四倍体，四套同源染色体之间的相似性和重组使单倍型级参考组装具有挑战。Sun 等以 Otava 品种为材料，目标是构建四倍体全基因组的染色体尺度相位组装，并考察其育种与功能基因组学意义。

## 数据与计算策略
作者整合高质量长读段、717 个花粉单细胞测序数据和 Hi-C。单细胞花粉基因组为同源染色体重组/剂量识别提供信息，长读段支持连续序列，Hi-C 支持 chromosome-scale 排列。这个多源数据设计针对四倍体解析，不能简化成 Hifiasm 单独生成四条单倍型。

## 主要结果
论文报告 3.1 Gb 染色体级单倍型解析组装，精度为 99.6%；约 50% 基因组被判断为近期近交导致的 identical-by-descent，约 20% 涉及广泛结构重排。38,214 个基因中仅 54% 在四种单倍型中都出现，平均每基因 3.2 个拷贝。叶片转录组中 11% 基因至少在一种单倍型间差异表达，其中一部分与等位特异 DNA 甲基化相关。

## 解读边界与精读问题
这些数字是 Otava 材料及论文评估策略下的结果，不能代表全部马铃薯品种。精读应关注四倍体单倍型分型精度如何估计、单细胞花粉数据在相位中的作用、Hi-C scaffold 验证方式，以及 identical-by-descent 与结构变异的判定条件。该案例说明多倍体解析需要匹配倍性的数据策略。

