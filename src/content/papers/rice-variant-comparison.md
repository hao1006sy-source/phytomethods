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
updatedAt: 2026-11-25
---
## 研究问题与材料范围
准确检测水稻自交系或亲本—子代中的杂合 SNP 与 *de novo* 自发突变率，极易受短读段比对错误和假阳性干扰。Balimponya 等（2025）以 **Nipponbare、Kitaake 和 Hinohikari** 为材料，利用同一份基因组 DNA（gDNA）的独立重复测序（150 bp paired-end reads）评估不同比对器与变异检测器组合在杂合 SNP 识别中的重复性与准确度。

## 分析流程
1. **比对与变异检测组合基准测试**：交叉比较 **Bowtie2 / BWA-MEM2** 与 **GATK4.3 HaplotypeCaller / BCFtools mpileup** 四种组合，并辅以 CLC Genomics Workbench 进行独立核验。
2. **杂合位点严格过滤**：限定覆盖深度为 **8–100 reads**，杂合等位基因比例（allele balance）为 **0.41–0.59**（针对本研究设计的专用过滤标准）。
3. **多轮验证与自发突变率估算**：基于最优组合开展多轮调用、IGV 可视化人工核查及 Sanger 测序验证，最终估算水稻 *de novo* 自发突变率。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **BWA-MEM2 + GATK4.3 HaplotypeCaller** | 短读段比对与局部单倍型重组装变异检测 | 在 4 组同 DNA 重复比较中跨重复相似度达 99.02%–99.74%，被选为最终主流程 |
| **BWA-MEM2 + BCFtools mpileup** | 作为对照流程评估杂合 SNP 检测一致性 | 同 DNA 重复相似度为 66.51%–71.52%，在本研究严格杂合过滤下假阳性/漏检率较高 |

## 主要科研发现
- 在水稻杂合 SNP 检测基准测试中，**BWA-MEM2 + GATK4.3 HaplotypeCaller** 表现出显著高于 BCFtools mpileup 组合的跨重复一致性（>99% vs ~70%）。
- 明确了该排序受限于特定材料、深度范围（8–100×）与等位基因比例阈值（0.41–0.59），不可直接外推至所有倍性或群体遗传学场景。

## 阅读与数据复现资源
- **原始论文**：[Plant Methods (2025)](https://doi.org/10.1186/s13007-025-01437-x) | [SpringerLink](https://link.springer.com/article/10.1186/s13007-025-01437-x)
- **相关站内资源**：[BCFtools 工具页](../../methods/bcftools/)、[SNP 检测、过滤与 VCF 专题](../../topics/population-genetics/m05-topic-02/)
- **数据复现**：原始测序数据与验证信息详见原文 Data Availability 部分。
