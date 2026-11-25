---
title: "Resequencing of 31 wild and cultivated soybean genomes identifies patterns of genetic diversity and selection"
summary: "比较野生和栽培大豆基因组多样性及选择相关模式。"
authors: "Lam HM, Xu X, Liu X, et al."
year: 2010
journal: Nature Genetics
doi: 10.1038/ng.715
type: application
methodIds: []
domainIds: [population-genetics]
speciesIds: [soybean]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
大豆（*Glycine max*）从野生大豆（*Glycine soja*）驯化而来，伴随遗传瓶颈与连锁不平衡（LD）格局的重塑。Lam 等（2010）对 **17 份野生大豆和 14 份栽培大豆**（共 31 份材料）使用 Illumina Genome Analyzer II 进行全基因组重测序（平均深度约 $5\times$，基因组覆盖率超过 90%），系统比较野生与栽培大豆的遗传多样性及选择模式。

## 分析流程
1. **浅层全基因组重测序与变异检测**：将 31 份材料的短读段比对至大豆参考基因组，检测全基因组 SNP 与小片段插入缺失。
2. **遗传多样性与连锁不平衡（LD）分析**：比较野生大豆与栽培大豆群体的核苷酸多样性（$\pi$）、等位基因频率分布及全基因组 LD 衰减距离。
3. **Tag SNP 筛选**：基于 LD 单倍型区块结构筛选高代表性标签 SNP（tag SNP），构建用于大豆 QTL 定位与 GWAS 的标记资源。

## 软件明细表格
| 方法 / 分析模块 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **全基因组重测序比对** | 31 份野生与栽培大豆 SNP 鉴定 | 在 $5\times$ 深度下覆盖超过 90% 基因组，揭示野生大豆更高的等位基因多样性 |
| **LD 与 Tag SNP 筛选** | 评估大豆基因组连锁不平衡并提取标签位点 | 鉴定出 205,614 个可用于下游 QTL 定位和关联分析的 tag SNP |

## 主要科研发现
- 证实野生大豆的等位基因多样性显著高于栽培大豆，且大豆基因组整体呈现较高的连锁不平衡（LD）水平。
- 提供了 **205,614 个 tag SNP** 资源，为后续大豆复杂农艺性状遗传定位奠定了重要基础。

## 阅读与数据复现资源
- **原始论文**：[Nature Genetics (2010)](https://doi.org/10.1038/ng.715)
- **PubMed**：[PMID: 21076406](https://pubmed.ncbi.nlm.nih.gov/21076406/)
- **相关站内资源**：[M05-07 驯化与环境适应专题](../../topics/population-genetics/m05-topic-07/)
- **数据复现**：原始重测序数据详见原文 Data Availability 部分（NCBI SRA）。
