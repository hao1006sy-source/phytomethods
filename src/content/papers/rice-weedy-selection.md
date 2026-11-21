---
title: "Population genomics identifies the origin and signatures of selection of Korean weedy rice"
summary: "使用重测序和多种互补扫描统计分析韩国杂草稻的群体来源与选择候选。"
authors: "He Q, Kim K-W, Park Y-J"
year: 2017
journal: Plant Biotechnology Journal
doi: 10.1111/pbi.12630
type: application
methodIds: [xpclr, selscan, plink]
domainIds: [population-genetics]
speciesIds: [rice]
status: draft
updatedAt: 2026-11-21
---
## 研究设计与软件任务

He 等对 30 份韩国杂草稻、30 份地方稻和 10 份野生稻开展全基因组重测序，比较材料间的系统关系、群体结构和适应性候选区域。论文报告 70 份材料中超过 800 万个杂草稻/地方稻 SNP，并在后续群体分析中过滤缺失和低频位点。

| 方法或工具 | 原文报告的任务 |
| --- | --- |
| PLINK | 计算不同稻群体间的 SNP 基因型 LD $r^2$ 衰减。 |
| XP-CLR | 比较杂草稻与地方稻的跨群体多位点频率差异。 |
| `selscan` | 计算 XP-EHH 和 iHS 单倍型扫描统计量。 |
| ROD、FST | 分析群体内多样性降低与分化信号。 |

研究用 100 kb 滑动窗或逐位点统计的经验前 2.5%界定各方法离群区，再将至少被两种扫描方法支持的基因作为候选集合之一；论文列出的各方法命中基因数不同。此阈值是原研究的分析选择，候选基因不是经功能实验确认的因果基因。[PubMed 书目与摘要](https://pubmed.ncbi.nlm.nih.gov/27589078/)；[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC5316921/)；[DOI](https://doi.org/10.1111/pbi.12630)。

论文正文将韩国杂草稻的遗传来源与地方稻及现代栽培稻联系起来。群体结构、选择扫描和因果功能判断是不同证据层次。该论文实际使用的 XP-CLR 程序与 `hardingnj/xpclr` Python 实现应分开记录。

相关资源：[M05-05 专题](../../topics/population-genetics/m05-topic-05/)、[XP-CLR 工具页](../../methods/xpclr/)、[selscan 工具页](../../methods/selscan/)、[PLINK](../../methods/plink/)、[XP-CLR 方法论文](../xpclr-paper/)、[XP-EHH 方法论文](../xpehh-paper/)。
