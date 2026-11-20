---
title: DNA 与蛋白质序列基础模型
summary: 理解序列分词、表示学习、预训练及植物模型的架构差异。
domain: regulatory-genomics-ai
methods: []
status: draft
updatedAt: 2026-11-21
---
## 研究问题
大量植物基因组序列具有丰富但尚未完全标注的模式。序列基础模型利用大量序列进行自监督预训练，学习可迁移的序列表示，再用于启动子、染色质或变异等特定任务。预训练能利用无标签序列，模型性能仍取决于训练物种、输入上下文、标注质量和评估设计。

## 分词与表示
DNA 序列可以按单碱基或 k-mer 切分为 token；蛋白质模型常使用氨基酸序列。模型把 token 映射成向量（embedding），再结合上下文得到包含序列信息的表示。分词决定序列长度及位置对应关系，重叠 k-mer 与单碱基方案在计算和定位上不同。

Transformer 常使用注意力机制根据输入计算位置之间的信息组合权重；注意力矩阵是模型内部计算量，不能直接等同于真实分子结合或因果作用。常见自监督任务包括遮盖部分 token 后预测其内容。预训练表示可通过任务头和微调适配带标签数据，评估时应独立划分样本并防止同源和位置泄漏。

## 植物模型的具体例子
AgroNT（Agronomic Nucleotide Transformer）是基于 Transformer 的植物 DNA 序列模型，其论文介绍了来自 48 种植物基因组的预训练与下游任务；物种、数据集与表现以[原论文](https://doi.org/10.1038/s42003-024-06465-2)及[官方文档](https://github.com/instadeepai/nucleotide-transformer/blob/main/docs/agro_nucleotide_transformer.md)为准。

PlantCaduceus（PlantCAD）系列以植物跨物种序列建模为目标；其模型系列和版本应按[项目官方仓库](https://github.com/plantcad/plantcad)区分。PlantCAD 与 AgroNT 采用不同架构，不能把所有序列基础模型都称为 Transformer。具体模型权重、许可证、预训练物种、输入长度和下游模型应分别核对。

## 应用与评估步骤
1. 根据任务确定 DNA 或蛋白质序列、物种及坐标来源。
2. 记录模型名称、权重版本、输入长度、分词与许可证。
3. 按物种、染色体或同源簇设计训练和独立测试划分。
4. 与简单序列特征模型和适当已有方法比较，并报告不确定性。
5. 针对候选序列或变异进行独立实验验证。

## 延伸阅读
[AgroNT 原论文](https://doi.org/10.1038/s42003-024-06465-2)、[PlantCAD 官方项目](https://plantcad.github.io/)。
