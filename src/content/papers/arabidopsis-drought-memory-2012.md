---
title: "Multiple exposures to drought 'train' transcriptional responses in Arabidopsis"
summary: "研究拟南芥重复干旱处理后的转录响应记忆。"
authors: "Ding Y, Fromm M, Avramova Z"
year: 2012
journal: Nature Communications
doi: 10.1038/ncomms1732
type: application
methodIds: []
domainIds: [epigenomics-3d-genome]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
植物在经历一次干旱胁迫后，再次遭遇干旱时往往表现出更强或更快速的转录响应，即"胁迫转录记忆"（transcriptional memory）。Ding 等（2012）以 **拟南芥（*Arabidopsis thaliana*）** 为材料，通过重复脱水—复水循环处理，结合全基因组转录谱分析与染色质免疫共沉淀（ChIP），系统解析干旱胁迫记忆的基因分类与表观遗传维持机制。

## 分析流程
1. **重复干旱胁迫处理设计**：对拟南芥幼苗施加多次脱水胁迫与复水恢复循环，采集首次胁迫（S1）、恢复期（R1）与再次胁迫（S2）样本。
2. **转录组动力学分类**：比较 S1 与 S2 的基因表达幅度，将干旱响应基因划分为"记忆基因"（如 *RD29B*、*RAB18*，在 S2 中表达显著增强）与"非记忆基因"（如 *RD29A*）。
3. **ChIP 染色质标记追踪**：检测记忆基因启动子区在复水恢复期（R1）的 **H3K4me3** 组蛋白甲基化与 **RNA 聚合酶 II（Pol II）** 滞留水平。

## 软件明细表格
| 实验 / 分析方法 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **重复胁迫转录谱分析** | 区分干旱"记忆基因"与"非记忆基因" | 发现记忆基因在复水后表达回落至基线，但再次胁迫时响应大幅增强 |
| **ChIP (H3K4me3 / Pol II)** | 追踪恢复期染色质修饰与 Pol II 滞留 | 证明持续的 H3K4me3 与停滞的 Pol II 是维持干旱转录记忆的关键表观标记 |

## 主要科研发现
- 首次系统定义了拟南芥干旱胁迫转录记忆基因集，揭示即使在复水恢复期转录水平已恢复正常，**H3K4me3 修饰与停滞的 RNA Pol II** 仍可在记忆基因上持续保留。
- 这种表观遗传"预备状态"使植物在再次遭遇干旱时能够实现更快速、更强烈的转录激活。

## 阅读与数据复现资源
- **原始论文**：[Nature Communications (2012)](https://doi.org/10.1038/ncomms1732)
- **数据复现**：转录组与 ChIP 相关数据详见原文 Data Availability 部分。
