---
title: "Genomic analyses of agronomic traits in tea plants and related Camellia species"
summary: "结合山茶属基因组与群体数据研究农艺性状及基因家族演化。"
authors: "Duan S, Yan L, Shen Z, et al."
year: 2024
journal: Frontiers in Plant Science
doi: 10.3389/fpls.2024.1449006
type: application
methodIds: [orthofinder, mcscanx, cafe5, paml]
domainIds: [comparative-genomics]
speciesIds: [tea]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
茶树（*Camellia sinensis*）及山茶属近缘植物在次生代谢（如茶多酚、咖啡因、茶氨酸合成）与农艺性状上具有高度多样性。Duan 等（2024）整合 **茶树及多个山茶属代表性物种** 的基因组与群体数据，系统解析山茶属基因家族扩张/收缩、物种分化时间以及关键农艺性状的演化基础。

## 分析流程
1. **直系同源基因家族聚类**：使用 **OrthoFinder** 对茶树及近缘山茶属物种蛋白组进行全基因组同源聚类。
2. **物种分化时间估计**：基于单拷贝直系同源基因拼接矩阵，使用 **PAML (`MCMCTree`)** 估算山茶属主要谱系的分化时间。
3. **基因家族扩张/收缩与共线性分析**：将时间标定树与基因家族计数输入 **CAFE5** 检验显著扩张/收缩家族，并结合 **MCScanX** 识别基因组共线性区块与重复模式。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **OrthoFinder** | 山茶属多物种基因家族聚类 | 为下游系统发育、时间定年与家族演化提供直系同源基石 |
| **PAML (`MCMCTree`)** | 估算山茶属物种分化时间树 | 生成 CAFE5 必需的超度量时间校准系统发育树 |
| **CAFE5** | 统计检验基因家族扩张与收缩 | 识别茶树次生代谢与抗逆相关基因家族的显著扩张事件 |
| **MCScanX** | 识别山茶属基因组间共线性区块 | 辅助解析基因家族拷贝数变化背后的全基因组加倍与串联重复贡献 |

## 主要科研发现
- 厘清了茶树与山茶属近缘物种的系统发育关系与分化时间框架。
- 鉴定出在茶树演化过程中显著扩张的次生代谢与农艺性状相关基因家族。

## 阅读与数据复现资源
- **原始论文**：[Frontiers in Plant Science (2024)](https://doi.org/10.3389/fpls.2024.1449006)
- **相关站内资源**：[OrthoFinder](../../methods/orthofinder/)、[PAML](../../methods/paml/)、[CAFE5](../../methods/cafe5/)、[MCScanX](../../methods/mcscanx/)
- **数据复现**：原始基因组与群体数据详见原文 Data Availability 部分。
