---
title: "Phylogenomics and the rise of the angiosperms"
summary: "以 Angiosperms353 核基因数据研究被子植物深层系统发育和分化时间。"
authors: "Zuntini AR, Carruthers T, Maurin O, et al."
year: 2024
journal: Nature
doi: 10.1038/s41586-024-07324-0
type: application
methodIds: [iqtree2]
domainIds: [comparative-genomics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
重建被子植物（开花植物）深层系统发育关系与分化时间一直是演化生物学的核心难题。Zuntini 等（2024）整合 **Angiosperms353** 靶向富集核基因探针数据，覆盖被子植物 **64 个目、416 个科、7,923 个属（共 9,506 个物种）**，构建了迄今最全面的被子植物生命之树，并重估其起源与辐射演化时间表。

## 分析流程
1. **核基因树并行推断**：对 353 个直系同源核基因分别进行多序列比对与去冗余过滤，使用 **IQ-TREE** 进行最大似然法单基因树构建及枝长估计。
2. **多物种共祖物种树汇总**：将单基因树集合输入 **ASTRAL-III**，在不完全谱系分选（ILS）模型下汇总推断全被子植物物种树。
3. **化石校准分子钟定年**：在独立的时间定标分析中整合 **200 项化石校准点** 与 **treePL**，估算各主要分支的绝对分化时间。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **IQ-TREE** | 353 个核基因的单基因树推断与枝长估计 | 为下游共祖物种树与时间定标提供高置信度局部拓扑与替代率估计 |
| **ASTRAL-III** | 基于多物种共祖模型汇总物种树 | 有效缓解深层辐射演化中不完全谱系分选导致的基因树冲突 |
| **treePL** | 结合 200 项化石校准点进行惩罚似然定年 | 揭示被子植物早期快速辐射与白垩纪—古近纪大灭绝后的多样性爆发 |

## 主要科研发现
- 解析了被子植物深层节点（包括真双子叶、单子叶及木兰类早期分歧）的高支持度系统发育框架。
- 识别出早白垩世与古新世两次关键的多样化速率跃升事件，软件分工明确（IQ-TREE 不直接替代 ASTRAL-III 与 treePL）。

## 阅读与数据复现资源
- **原始论文**：[Nature (2024)](https://doi.org/10.1038/s41586-024-07324-0)
- **PubMed**：[PMID: 38658746](https://pubmed.ncbi.nlm.nih.gov/38658746/)
- **相关站内资源**：[IQ-TREE2 方法页](../../methods/iqtree2/)
- **数据复现**：Angiosperms353 比对矩阵、基因树与物种树文件详见原文 Data Availability 部分。
