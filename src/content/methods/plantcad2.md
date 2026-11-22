---
title: PlantCAD2
name: PlantCAD2
summary: 基于 Caduceus/Mamba2 的长上下文植物 DNA 基础模型。
dataType: 单碱基分辨率 DNA 序列，最长 8192 bp 上下文
principle: 双向状态空间序列建模与反向互补等变性
domainIds: [regulatory-genomics-ai]
topicIds: [m09-topic-06, m09-topic-07]
principleIds: [bidirectional-state-space-model]
dataIds: [dna-sequence]
paper: plantcad2-paper
repository: https://github.com/plantcad/plantcad
status: published
updatedAt: 2026-11-22
---
## 一句话简介与开发背景
PlantCAD2 是用于开花植物基因组解释的长上下文 DNA 基础模型，论文报告在 65 个被子植物基因组上预训练，参数量 676M，窗口 8192 bp。[Cell Genomics 方法论文](https://doi.org/10.1016/j.xgen.2026.101329)。

## 生物学问题
远端顺式调控信号和植物基因组尺寸差异要求序列模型在跨物种迁移时兼顾碱基级定位与长上下文。PlantCAD2 论文评估保守性、染色质可及性、基因表达和翻译等任务；结果应按具体训练/测试划分和任务阅读。

## 架构与算法流程
该模型采用 Caduceus 架构并扩展 Mamba2 状态空间模型，以双向状态传递结合反向互补等变性处理 DNA 两条方向。序列以单碱基分辨率建模，使输出可映射到核苷酸位置；长窗口为远距离序列上下文提供输入。它并非 Transformer，架构不应与 AgroNT 混称。论文报告 zero-shot 保守性评估中 12 项任务有 10 项超过其比较的 Evo2 7B 模型；参数高效微调跨物种 7 项任务超过 AgroNT 1B；在其玉米开放染色质任务上，扩展上下文将 AUPRC 从 0.587 提高到 0.711。这些数字限于论文所述基准和方案。

## 输入输出与实际流程
输入为参考基因组区间序列，需保持组装版本、链方向、窗口边界和缺失碱基处理一致。推理输出取决于所选模型头/基准任务，包括位置级表示或任务分数。实际分析需确定公开权重与代码版本、许可证、显存需求、物种数据重叠、坐标转换及独立测试划分；将参考和变异等位基因置于匹配上下文时，分数差仍是模型输出而非实验因果效应。

## 植物案例与来源
原文用 65 个被子植物基因组开展预训练及多项基准评估，并分析玉米可及染色质和跨物种任务；本页只转述论文自身报告的数据和比较。[PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/42567165/)、[期刊全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC13576720/)。

## 版本、资源与关联
[官方仓库](https://github.com/plantcad/plantcad)标示 PlantCAD2 已发表；[Hugging Face 模型集合](https://huggingface.co/collections/kuleshov-group/plantcad2-67e437e241a382671371a572)及论文链接的 Zenodo 归档提供模型/评估资源。该模型未在本机运行。关联专题为 DNA 基础模型与 AI 功能预测，并链接论文和序列任务评估知识。
