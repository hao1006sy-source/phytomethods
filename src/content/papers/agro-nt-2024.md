---
title: "A foundational large language model for edible plant genomes"
summary: "介绍以 48 种植物基因组预训练的 AgroNT，并评估植物 DNA 序列功能相关任务。"
authors: "Mendoza-Revilla J, Trop E, Gonzalez L, et al."
year: 2024
journal: Communications Biology
doi: 10.1038/s42003-024-06465-2
type: method
methodIds: [agront]
domainIds: [regulatory-genomics-ai]
speciesIds: []
status: published
updatedAt: 2026-11-22
---
## 研究背景与模型设计

植物功能元件和表达标签在物种间分布不均，研究者希望利用未标注序列预训练得到可迁移表示。AgroNT 以多个可食用植物基因组构建 DNA 序列基础模型；论文报告预训练语料覆盖 48 种植物基因组。模型采用 Transformer 架构和掩码 token 预测预训练，输入按 6-mer token 化，再将表示用于多个下游任务。

## 主要任务和结果

论文评估序列功能注释、启动子/终止子相关任务、表达预测和变异优先级等应用，并报告对木薯调控序列进行计算饱和突变分析。结果对应论文所用数据、切分策略和任务定义；启动子预测分数不能直接解释为生理条件下的绝对表达或因果效应。阅读具体结果时区分跨物种迁移、模型微调和基线对比。

## 方法限制与复现要点

预训练物种覆盖广度不保证对所有作物和组织泛化。评估需检查训练语料与测试区域/物种重叠，避免近同源序列泄漏；模型的 6-mer 分词会影响边界定位与变异输入方式。论文说明预训练代码未公开，本站未运行模型权重。复现实验应核对 checkpoint、序列长度、任务头、许可和版本。

## 阅读重点与资源

重点跟踪语料物种、预训练目标、tokenization、下游任务标签和物种级数据划分。与 PlantCAD2 对比时注意其单碱基分辨率和 Caduceus/Mamba2 架构不同。[原始论文](https://doi.org/10.1038/s42003-024-06465-2)、[模型/仓库文档](https://github.com/instadeepai/nucleotide-transformer)、[AgroNT 使用说明](https://github.com/instadeepai/nucleotide-transformer/blob/main/docs/agro_nucleotide_transformer.md)。
