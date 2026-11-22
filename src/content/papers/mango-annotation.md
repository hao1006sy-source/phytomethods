---
title: "A chromosome-level genome of mango exclusively from long-read sequence data"
summary: "芒果染色体级基因组应用研究，报告重复屏蔽、BRAKER3 结构预测及蛋白功能注释流程。"
authors: "Wijesundara UK et al."
year: 2024
journal: The Plant Genome
doi: 10.1002/tpg2.20441
type: application
methodIds: [braker3, interproscan]
domainIds: [genome-annotation, genome-assembly]
speciesIds: [mango]
updatedAt: 2026-11-22
---
## 研究背景

芒果基因组研究的目标之一是建立染色体级参考资源，以支持基因组结构和基因功能研究。该研究使用长读长数据构建基因组，并报告结构注释和功能注释步骤，为植物注释方法在真实项目中的组合提供案例。

## 方法流程与工具角色

论文方法部分报告以 RepeatModeler2/RepeatMasker 处理重复序列，使用叶和花 RNA-seq 证据，并采用 BRAKER3 v3.0.3 预测基因结构；预测蛋白的功能注释使用 InterProScan 与其他资源。工具分别承担重复序列识别、结构预测和蛋白功能分类任务。该研究没有报告 EDTA 作为其重复序列流程，故不作为 EDTA 应用证据。

## 主要结果与限制

文章提供芒果染色体级基因组及相应注释资源。其完整度和基因模型统计属于该样本、组装版本和流程设置。长读长组装本身不能消除全部重复解析和结构注释误差；功能注释来自计算证据，不等同于功能实验。复用时应核对论文补充材料中的数据、版本、样本和参数，并将组装评估与注释评估分开。

## 阅读重点

阅读时沿着重复屏蔽、转录证据、BRAKER3 预测、蛋白功能映射的顺序追踪输入输出，并查看文章如何报告组装与基因集完整性。方法页面分别链接 [BRAKER3](../../methods/braker3/) 与 [InterProScan](../../methods/interproscan/)。

原始论文：[The Plant Genome](https://doi.org/10.1002/tpg2.20441)。
