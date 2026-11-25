---
title: "Genome resequencing reveals demographic history and genetic architecture of seed salinity tolerance in Populus euphratica"
summary: "以全基因组重测序研究胡杨群体结构、PSMC 历史轨迹和种子耐盐性。"
authors: "Jia H, Liu G, Li J, et al."
year: 2020
journal: Journal of Experimental Botany
doi: 10.1093/jxb/eraa172
type: application
methodIds: [psmc]
domainIds: [population-genetics]
speciesIds: [populus-euphratica]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
胡杨（*Populus euphratica*）是分布于西北干旱荒漠区的极端耐盐乔木，是研究林木环境适应与群体历史的理想模型。Jia 等（2020）对我国西北天然胡杨群体开展全基因组重测序，鉴定出约 **315 万个高质量 SNP**，系统解析其群体遗传结构、历史有效群体大小（$N_e$）动态以及种子耐盐性的遗传基础。

## 分析流程
1. **群体结构划分**：基于全基因组 SNP 分析天然胡杨群体的遗传分化，划分出具有显著地理结构的 **4 个遗传支系**。
2. **历史有效群体大小与迁移模拟**：使用 **PSMC** 分别重建 4 个遗传支系的历史 $N_e$ 变化轨迹；同时独立使用 `fastsimcoal26` 拟合包含群体间基因流（迁移）的群体历史模型。
3. **种子耐盐性关联分析**：结合种子萌发耐盐表型开展关联分析，筛选并验证耐盐候选基因。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **PSMC** | 重建胡杨 4 个遗传支系的单倍体基因组历史 $N_e$ 轨迹 | 揭示第四纪冰期气候波动对荒漠胡杨群体扩张与收缩的影响 |
| **fastsimcoal26** | 拟合多群体分歧时间与群体间迁移率模型 | 量化 4 个地理支系间的历史基因流强度（与 PSMC 回答不同问题） |

## 主要科研发现
- 明确了中国西北天然胡杨群体划分为具有清晰地理边界的 4 个遗传支系，并刻画了其响应古气候变化的有效群体大小动态。
- 鉴定出一批与胡杨种子耐盐性显著相关的遗传位点与候选基因。

## 阅读与数据复现资源
- **原始论文**：[Journal of Experimental Botany (2020)](https://doi.org/10.1093/jxb/eraa172) | [PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC7475257/)
- **PubMed**：[PMID: 32242238](https://pubmed.ncbi.nlm.nih.gov/32242238/)
- **相关站内资源**：[PSMC 方法页](../../methods/psmc/)、[群体历史动态专题](../../topics/population-genetics/m05-topic-06/)
- **数据复现**：原始重测序数据详见原文 Data Availability 部分。
