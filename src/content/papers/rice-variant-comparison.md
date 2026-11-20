---
title: "Accurate detections of the heterozygous SNPs with rice genomic data and prediction of de novo spontaneous mutation rate"
summary: "比较水稻基因组中杂合变异检测流程的表现。"
authors: "Balimponya EG, Dwiyanti MS, Yamamori K, et al."
year: 2025
journal: Plant Methods
doi: 10.1186/s13007-025-01437-x
type: application
methodIds: [bcftools]
domainIds: [population-genetics]
speciesIds: [rice]
status: draft
updatedAt: 2026-11-21
---
## 研究与工具
研究比较水稻样本的多个比对和变异检测组合，包括 BCFtools mpileup，用于评估杂合位点检测。论文最终选择的组合是 BWA-MEM2 与 GATK HaplotypeCaller，不能误述为 BCFtools 为该研究的最优组合。[论文原文](https://doi.org/10.1186/s13007-025-01437-x)。
