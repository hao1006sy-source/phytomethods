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
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
杂草稻（weedy rice）是稻田恶性杂草，其起源与快速适应性演化机制备受关注。He 等（2017）对 **30 份韩国杂草稻、30 份地方稻和 10 份野生稻**（共 70 份材料）进行全基因组重测序，鉴定出超过 **800 万个 SNP**，系统解析韩国杂草稻的遗传起源与受选择基因组区域。

## 分析流程
1. **群体结构与连锁不平衡分析**：过滤缺失与低频位点后，使用 **PLINK** 计算不同稻群体间的 SNP 连锁不平衡（LD $r^2$）衰减速率，结合系统发育与群体结构推断杂草稻起源。
2. **多方法互补选择性清除扫描**：在 100 kb 滑动窗口或逐位点水平，分别运行 **XP-CLR**（跨群体多位点频率差异）、**selscan**（XP-EHH 与 iHS 单倍型扫描）以及 **ROD / $F_{ST}$**。
3. **离群区域交叉验证**：取各方法统计量经验分布的 **前 2.5%** 作为离群区域，将至少被两种扫描方法共同支持的基因列为高置信度受选择候选基因。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **PLINK** | 计算杂草稻、地方稻与野生稻群体的 LD $r^2$ 衰减 | 量化不同群体的重组历史与群体瓶颈效应 |
| **XP-CLR** | 检测杂草稻与地方稻之间的跨群体多位点等位基因频率分化 | 识别出经历强正选择的基因组分化区间 |
| **selscan** | 计算单倍型扫描统计量 XP-EHH 与 iHS | 捕捉杂草稻近期适应性选择留下的长单倍型扩展信号 |
| **ROD / $F_{ST}$** | 评估群体内核苷酸多样性降低与群体间遗传分化 | 与 XP-CLR、selscan 形成多维度互补证据 |

## 主要科研发现
- 系统发育与群体遗传分析将韩国杂草稻的遗传起源明确关联至当地地方稻与现代栽培稻（去驯化演化路径）。
- 通过多统计量交叉筛选鉴定出一批与落粒性、休眠性及除草剂/逆境适应相关的候选受选择基因。

## 阅读与数据复现资源
- **原始论文**：[Plant Biotechnology Journal (2017)](https://doi.org/10.1111/pbi.12630) | [PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC5316921/)
- **PubMed**：[PMID: 27589078](https://pubmed.ncbi.nlm.nih.gov/27589078/)
- **相关站内资源**：[M05-05 专题](../../topics/population-genetics/m05-topic-05/)、[XP-CLR 工具页](../../methods/xpclr/)、[selscan 工具页](../../methods/selscan/)、[PLINK](../../methods/plink/)
- **数据复现**：原始重测序数据详见原文 Data Availability 部分。
