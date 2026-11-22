---
title: "BRAKER3: Fully automated genome annotation using RNA-Seq and protein evidence with GeneMark-ETP, AUGUSTUS, and TSEBRA"
summary: "方法论文介绍 BRAKER3 如何整合 RNA-seq 与同源蛋白证据，并在多物种基因组上评估基因预测。"
authors: "Gabriel L et al."
year: 2024
journal: Genome Research
doi: 10.1101/gr.278090.123
type: method
methodIds: [braker3]
domainIds: [genome-annotation]
speciesIds: [arabidopsis, tomato]
updatedAt: 2026-11-22
---
## 研究问题

真核基因预测依赖统计模型和外部证据，单一 RNA-seq 或同源蛋白来源难以覆盖完整基因组。本文提出 BRAKER3 工作流，目标是在用户提供 RNA-seq 和蛋白证据时自动训练并整合基因结构预测。

## 方法创新

流程组合 GeneMark-ETP、AUGUSTUS 和 TSEBRA。RNA-seq 与同源蛋白用于候选模型训练、提示生成及模型选择；TSEBRA 根据候选转录本的异质证据支持进行筛选。文章将这一套工作流与既有自动化预测方案在多种真核物种上比较。

## 主要结果与适用边界

论文在多个物种和参考注释上进行 benchmark，植物基因组也包含在测试范围内。结果支持联合两类证据有助于提升预测表现；具体数值应连同物种、基准注释、评价单位和匹配规则一起解读。benchmark 的平均结果不构成新物种上的保证，输入证据质量、组装连续性、基因家族复杂度都会改变表现。官方仓库后续发布状态已变化，阅读时需区分论文描述的 BRAKER3 与当前维护版本。

## 阅读重点

建议先看流程图中证据如何进入 GeneMark-ETP/AUGUSTUS，再阅读 TSEBRA 对重叠候选模型的支持规则和 benchmark 设置。复现实验时关注物种列表、参考注释质量、RNA/protein 数据来源、各工具版本及指标定义。

原始论文：[Genome Research](https://doi.org/10.1101/gr.278090.123)；[官方 BRAKER 仓库](https://github.com/Gaius-Augustus/BRAKER)。
