---
title: "The Cycas genome and the early evolution of seed plants"
summary: "构建攀枝花苏铁基因组并比较种子植物的基因组与演化。"
authors: "Liu Y, Wang S, Li L, et al."
year: 2022
journal: Nature Plants
doi: 10.1038/s41477-022-01129-7
type: application
methodIds: [orthofinder]
domainIds: [comparative-genomics]
speciesIds: [cycas]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
裸子植物苏铁类是现存最古老的种子植物谱系之一，对理解种子植物共同祖先及被子植物起源具有不可替代的演化地位。Liu 等（2022）完成了 **攀枝花苏铁（*Cycas panzhihuaensis*）** 染色体级参考基因组组装，并结合代表性陆生植物基因组开展比较基因组学研究，揭示种子植物早期演化的关键基因组事件。

## 分析流程
1. **苏铁超大基因组组装与注释**：整合长读段与 Hi-C 数据组装攀枝花苏铁约 10.5 Gb 的超大基因组，并注释蛋白编码基因与大量长末端重复（LTR）转座子。
2. **跨物种同源基因家族聚类**：使用 **OrthoFinder** 对苏铁及多个代表性被子植物、裸子植物、蕨类与苔藓基因组进行全基因组直系同源基因家族（orthogroups）聚类。
3. **基因家族扩张/收缩与 WGD 分析**：基于 OrthoFinder 基因家族构建系统发育树，结合全基因组加倍（WGD）与关键发育基因（如 MADS-box）演化分析解析种子植物创新特征。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **OrthoFinder** | 多植物基因组直系同源基因家族聚类 | 为跨裸子植物与被子植物的基因家族扩张/收缩及共线性比较提供同源锚点 |

## 主要科研发现
- 解析了攀枝花苏铁超大基因组主要由古老转座子长期积累而非近期全基因组加倍驱动。
- 结合比较基因组学揭示了种子植物共同祖先在胚珠发育、抗逆及次生代谢通路中的关键基因家族起源。

## 阅读与数据复现资源
- **原始论文**：[Nature Plants (2022)](https://doi.org/10.1038/s41477-022-01129-7) | [PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC9023351/)
- **相关站内资源**：[OrthoFinder 方法页](../../methods/orthofinder/)
- **数据复现**：苏铁基因组组装、注释与原始测序数据详见原文 Data Availability 部分（CNGB / NCBI）。
