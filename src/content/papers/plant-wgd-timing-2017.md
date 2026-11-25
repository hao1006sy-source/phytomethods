---
title: "Constraining the timing of whole genome duplication in plant evolutionary history"
summary: "结合串联基因家族、化石校准与分子钟估计种子植物和被子植物古复制事件。"
authors: "Clark JW, Donoghue PCJ"
year: 2017
journal: Proceedings of the Royal Society B
doi: 10.1098/rspb.2017.0912
type: application
methodIds: [paml]
domainIds: [comparative-genomics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
种子植物祖先的 $\zeta$（zeta）与被子植物祖先的 $\varepsilon$（epsilon）古全基因组加倍（WGD）事件是植物演化的重要里程碑，但其绝对发生时间长期存在争议。Clark 与 Donoghue（2017）汇集包含 $\zeta$、$\varepsilon$ 复制信号的 **串联基因家族**，结合 **35 项化石校准点** 与贝叶斯分子钟方法，系统约束植物早期古多倍化事件的绝对时间区间。

## 分析流程
1. **WGD 旁系同源基因家族筛选**：收集保留 $\zeta$ 和 $\varepsilon$ 复制信号的核基因家族，构建密码子与氨基酸拼接比对矩阵。
2. **化石校准与拓扑约束**：在固定的物种/基因树拓扑框架下，为关键陆生植物节点设定 35 项严格的化石先验分布（最小/最大年龄约束）。
3. **贝叶斯分子钟定年**：使用 **PAML MCMCTree** 的正态近似（normal approximation）似然方法，在宽松分子钟模型下估算 $\zeta$ 与 $\varepsilon$ 复制节点的后验年龄区间。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **PAML (`MCMCTree`)** | 基于正态近似法与 35 项化石校准估算 WGD 节点年龄 | 在大规模串联基因家族上实现计算可行的贝叶斯宽松分子钟定年 |

## 主要科研发现
- 为种子植物祖先 $\zeta$ 与被子植物祖先 $\varepsilon$ 古全基因组加倍事件提供了受化石校准严格约束的分子钟年龄区间。
- 强调 WGD 定年结果高度依赖于基因家族选择、化石校准先验分布及分子钟模型假设。

## 阅读与数据复现资源
- **原始论文**：[Proceedings of the Royal Society B (2017)](https://doi.org/10.1098/rspb.2017.0912) | [PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC5524505/)
- **PubMed**：[PMID: 28679730](https://pubmed.ncbi.nlm.nih.gov/28679730/)
- **相关站内资源**：[PAML 方法页](../../methods/paml/)
- **数据复现**：基因家族比对矩阵与 MCMCTree 控制文件详见原文补充材料。
