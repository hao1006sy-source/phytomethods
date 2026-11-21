---
title: "Protocol for fast scRNA-seq raw data processing using scKB and non-arbitrary quality control with COPILOT"
summary: "介绍 kallisto/bustools 计数、scKB 矩阵生成和 COPILOT 分布式单细胞质控流程。"
authors: "Hsu CW, Shahan R, Nolan TM, Benfey PN, Ohler U"
year: 2022
journal: STAR Protocols
doi: 10.1016/j.xpro.2022.101729
type: method
methodIds: [sc-kb-copilot]
domainIds: [single-cell-spatial-omics]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-22
---
## 方法协议
该 protocol 描述 scKB 如何包装 kallisto 与 bustools 生成基因×细胞 UMI 矩阵，以及 COPILOT 如何依据低质量背景和高质量细胞分布进行数据驱动过滤。原文给出拟南芥数据示例、输入格式和预期结果。[STAR Protocols 原文](https://doi.org/10.1016/j.xpro.2022.101729)；[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC9530667/)。
