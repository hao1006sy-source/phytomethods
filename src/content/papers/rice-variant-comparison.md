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
status: published
updatedAt: 2026-11-22
---
## 研究问题与设计

Balimponya 等研究如何从 Illumina 短读段中减少水稻杂合 SNP 的假阳性，并用同 DNA 的独立测序试验评估比对与变异调用流程的一致性。论文包括 Nipponbare、Kitaake 和 Hinohikari 材料；方法部分的同 DNA 重复试验用于比较候选流程，后续样本分析、亲本—子代设计和 Sanger 验证分别回答不同问题。正文提及的材料数按各分析步骤区分，不将不同样本组混成一个统一分母。

研究比较 Bowtie2 或 BWA-MEM2 与 GATK4.3 HaplotypeCaller 或 BCFtools mpileup 的四种组合，并另用 CLC Genomics Workbench 进行验证。试验读长为 150 bp；用于杂合变异筛选的深度范围为 8–100 reads，杂合等位基因比例设为 0.41–0.59。该比例阈值针对研究中杂合 SNP 的定义与验证设计，不是通用基因型过滤阈值。

## 结果与解释范围

在相同 gDNA 的独立测序组合比较中，BWA-MEM2 与 GATK4.3 HaplotypeCaller 获得最高的跨重复相似度，四项比较为 99.74%、99.63%、99.02% 和 99.37%。BWA-MEM2 与 BCFtools mpileup 的相应相似度为 71.52%、71.43%、70.97% 和 66.51%。论文后续采用 BWA-MEM2 与 GATK4.3 HaplotypeCaller，并结合多轮调用、IGV 检视及 Sanger 测序验证杂合位点。

这些结果是特定材料、测序深度、调用版本、过滤定义与重复设计下的比较。论文展示的是一项水稻杂合位点识别流程研究，不能据此推断所有作物、遗传背景、深度和变异类型都由同一调用器取得相同排序。本站关联 BCFtools 是因为原文将 `mpileup` 纳入比较；文章结论没有将 BCFtools 选为最终组合。

## 来源与工具关系

[出版方全文](https://doi.org/10.1186/s13007-025-01437-x)；[Plant Methods 页面](https://link.springer.com/article/10.1186/s13007-025-01437-x)。本文与[BCFtools 工具页](../../methods/bcftools/)及[SNP 检测、过滤与 VCF 专题](../../topics/population-genetics/m05-topic-02/)关联。原始流程中用于最终分析的 BWA-MEM2 与 GATK 不代表本站已验证或运行相应软件。
