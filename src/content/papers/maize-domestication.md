---
title: "Comparative population genomics of maize domestication and improvement"
summary: "比较野生、地方和改良玉米材料的群体基因组变化。"
authors: "Hufford MB, Xu X, van Heerwaarden J, et al."
year: 2012
journal: Nature Genetics
doi: 10.1038/ng.2309
type: application
methodIds: [xpclr]
domainIds: [population-genetics]
speciesIds: [maize]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
玉米（*Zea mays*）经历了从墨西哥大刍草（teosinte）到地方品种（landrace）的驯化，以及随后向现代自交系的遗传改良。Hufford 等（2012）对 **75 份材料**（包括 35 份改良自交系、23 份地方品种、14 份 *Z. mays* ssp. *parviglumis*、2 份 *Z. mays* ssp. *mexicana* 和 1 份 *Tripsacum dactyloides*）进行全基因组重测序（平均深度 >5×），解析玉米驯化与改良两个阶段的群体基因组选择特征。

## 分析流程
1. **参考比对与变异检测**：将重测序读段比对至玉米 B73 参考基因组（release 4a.53），最终获得 **21,141,953 个高质量 SNP**。
2. **分阶段选择性清除扫描**：分别在"野生—地方品种"（驯化阶段）与"地方品种—改良系"（改良阶段）比较中运行 **XP-CLR** 复合似然比扫描，合并连续高分窗口形成候选区域。
3. **转录组与渗透模式整合**：结合核苷酸多样性（$\pi$）、分化度（$F_{ST}$）、衍生等位基因频率及转录组表达数据，评估选择对基因表达与野生近缘种基因渗透（introgression）的影响。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **XP-CLR** | 跨群体多位点等位基因频率复合似然扫描 | 分别鉴定出 484 个驯化候选特征区与 695 个改良候选特征区 |
| **群体遗传统计（$\pi$ / $F_{ST}$）** | 评估驯化瓶颈与改良阶段的多样性变化 | 揭示驯化阶段总体选择强度高于现代改良阶段，且地方品种存在部分多样性恢复 |

## 主要科研发现
- 鉴定出 **484 个驯化特征区域** 与 **695 个改良特征区域**，并发现驯化阶段伴随显著的基因表达重编程。
- 观察到地方品种中部分遗传多样性恢复，且与野生近缘种 *mexicana* 的基因渗透模式相容。

## 阅读与数据复现资源
- **原始论文**：[Nature Genetics (2012)](https://doi.org/10.1038/ng.2309) | [PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC5531767/)
- **相关站内资源**：[XP-CLR 方法页](../../methods/xpclr/)、[M05-05 选择性清除](../../topics/population-genetics/m05-topic-05/)、[M05-07 驯化与环境适应](../../topics/population-genetics/m05-topic-07/)
- **数据复现**：原始重测序数据详见原文 Data Availability 部分（NCBI SRA）。
