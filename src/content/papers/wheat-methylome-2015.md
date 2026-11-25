---
title: "A genome-wide survey of DNA methylation in hexaploid wheat"
summary: "采用亚硫酸氢盐处理和靶向基因富集研究六倍体小麦亚基因组甲基化。"
authors: "Gardiner LJ, Quinton-Tulloch M, Olohan L, et al."
year: 2015
journal: Genome Biology
doi: 10.1186/s13059-015-0838-3
type: application
methodIds: [bismark]
domainIds: [epigenomics-3d-genome]
speciesIds: [wheat]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
普通小麦（*Triticum aestivum*）是异源六倍体（AABBDD，基因组约 17 Gb），全基因组亚硫酸氢盐测序成本极高，且 A、B、D 亚基因组高度同源。Gardiner 等（2015）采用 **基因区靶向富集结合亚硫酸氢盐测序**，在六倍体小麦中系统调查亚基因组特异的 DNA 甲基化模式。

## 分析流程
1. **靶向捕获与亚硫酸氢盐测序**：利用小麦基因区捕获探针富集编码与调控区域，随后进行亚硫酸氢钠转化与高通量测序，大幅降低 17 Gb 基因组的测序成本。
2. **亚硫酸氢盐读段比对与状态提取**：使用 **Bismark** 将转化后的短读段比对至小麦参考序列，区分 A、B、D 亚基因组同源拷贝并提取单碱基甲基化状态（CG、CHG、CHH）。
3. **亚基因组间甲基化差异比较**：比较同源三拷贝（homoeologs）在三个亚基因组间的甲基化保守性与分化模式。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **Bismark** | 亚硫酸氢盐测序读段比对与 5mC 状态提取 | 在高度同源的六倍体小麦亚基因组间实现单碱基甲基化定量 |

## 主要科研发现
- 示范了"靶向基因富集 + Bismark"在超大复杂多倍体作物（六倍体小麦）表观基因组研究中的可行性。
- 揭示了六倍体小麦 A、B、D 亚基因组间同源基因的甲基化分化特征。

## 阅读与数据复现资源
- **原始论文**：[Genome Biology (2015)](https://doi.org/10.1186/s13059-015-0838-3)
- **PubMed**：[PMID: 26653535](https://pubmed.ncbi.nlm.nih.gov/26653535/)
- **相关站内资源**：[Bismark 方法页](../../methods/bismark/)
- **数据复现**：原始测序数据详见原文 Data Availability 部分（ENA / NCBI SRA）。
