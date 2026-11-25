---
title: "Telomere-to-telomere Citrullus super-pangenome provides direction for watermelon breeding"
summary: "构建涵盖七个西瓜属物种的 27 个基因型 T2T super-pangenome，并用于研究演化和育种相关变异。"
authors: "Zhang Y et al."
year: 2024
journal: Nature Genetics
doi: 10.1038/s41588-024-01823-6
type: application
methodIds: []
domainIds: [genome-assembly, pangenomics-structural-variation]
speciesIds: [watermelon]
updatedAt: 2026-11-25
---
## 研究问题与材料范围
单一参考基因组难以完整代表西瓜属（*Citrullus*）丰富的野生与栽培遗传多样性。Zhang 等（2024）生成了涵盖 **西瓜属全部 7 个物种、共 27 个基因型** 的端粒到端粒（T2T）完整基因组组装，并构建了西瓜属超级泛基因组（super-pangenome），系统解析西瓜演化、驯化与育种相关变异。

## 分析流程
1. **多基因型 T2T 组装**：整合 PacBio HiFi、ONT 超长读段与 Hi-C 互作数据完成 27 份西瓜属材料的 T2T 级别组装与端粒/着丝粒闭合验证。
2. **超级泛基因组构建与非参考序列提取**：将 27 个 T2T 基因组与此前 T2T-G42 参考基因组进行全基因组共线性比对，提取非参考新序列与新基因集。
3. **驯化与育种性状变异关联**：整合重测序群体与表型数据，解析与果实品质、抗病性及驯化选择相关的结构变异（SV）。

## 软件明细表格
| 方法 / 分析模块 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **T2T 混合组装与端粒验证** | 构建 27 份西瓜属 T2T 完整基因组 | 跨越高度重复的着丝粒与 rDNA 区域，实现属水平无缺口参考 |
| **超级泛基因组比较** | 对比 T2T-G42 提取非参考序列与 SV | 新增 399.2 Mb 序列与 11,225 个基因，显著拓展西瓜育种可用变异库 |

## 主要科研发现
- 相对此前 T2T-G42 参考，该超级泛基因组新增 **399.2 Mb 序列** 与 **11,225 个基因**。
- 揭示了西瓜属演化、驯化及现代育种性状背后的关键结构变异与等位基因。

## 阅读与数据复现资源
- **原始论文**：[Nature Genetics (2024)](https://doi.org/10.1038/s41588-024-01823-6)
- **数据复现**：27 份 T2T 组装、注释与原始测序数据详见原文 Data Availability 部分。
