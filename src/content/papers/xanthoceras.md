---
title: "Two haplotype-resolved telomere-to-telomere genome assemblies of Xanthoceras sorbifolium"
summary: "黄花木单倍型解析组装研究使用 Verkko 组装结果辅助填补缺口。"
authors: "Liu Y et al."
year: 2025
journal: Scientific Data
doi: 10.1038/s41597-025-05057-x
type: application
method: verkko
methodIds: [hifiasm, verkko]
domainIds: [genome-assembly]
speciesIds: [xanthoceras]
updatedAt: 2026-11-25
---
## 研究问题与材料范围
文冠果（*Xanthoceras sorbifolium*，又称黄花木）是我国重要的木本油料与生态树种。Liu 等（2025）利用多平台长读段测序数据，完成了文冠果 **两套单倍型解析的端粒到端粒（T2T）参考基因组组装**，为木本油料作物的比较基因组与分子育种提供了高质量遗传资源。

## 分析流程
1. **双组装器协同组装**：分别使用 **Hifiasm** 与 **Verkko** 处理 PacBio HiFi 及 ONT 超长读段，生成高连续性的单倍型解析组装草图。
2. **缺口闭合与端粒验证**：结合 Verkko 组装、Hifiasm 组装与 HiFi reads 相互填补残余缺口，完成两套单倍型染色体的端粒到端粒（T2T）闭合。
3. **组装质量与基因注释评估**：统计两套单倍型的 QV、BUSCO 完整度与端粒重复序列覆盖情况，并完成基因结构与功能注释。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **Hifiasm** | 基于 HiFi 与长读段构建单倍型解析初始组装 | 提供高碱基准确度的单倍型 contig 骨架 |
| **Verkko** | 协同 HiFi 与 ONT 超长读段辅助缺口闭合 | 跨越复杂重复区域，助力实现两套单倍型的 T2T 完整组装 |

## 主要科研发现
- 发布了文冠果两套单倍型解析的 T2T 完整基因组组装数据集，完整覆盖端粒与着丝粒区域。
- 展示了 Hifiasm 与 Verkko 在植物 T2T 组装中互补填补缺口（gap closing）的实用策略。

## 阅读与数据复现资源
- **原始论文**：[Scientific Data (2025)](https://doi.org/10.1038/s41597-025-05057-x)
- **相关站内资源**：[Hifiasm 方法页](../../methods/hifiasm/)、[Verkko 方法页](../../methods/verkko/)
- **数据复现**：原始测序与 T2T 组装数据详见原文 Data Records 部分（NCBI / NGDC）。

