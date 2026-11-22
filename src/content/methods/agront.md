---
title: AgroNT
name: AgroNT
summary: 基于植物基因组序列预训练的 Agronomic Nucleotide Transformer。
dataType: DNA 序列
principle: Transformer 与遮盖序列预测
domainIds: [regulatory-genomics-ai]
topicIds: [m09-topic-06, m09-topic-07]
principleIds: [sequence-transformer]
dataIds: [dna-sequence]
paper: agro-nt-2024
repository: https://github.com/instadeepai/nucleotide-transformer
status: published
updatedAt: 2026-11-22
---
## 模型定位
AgroNT 是基于 Transformer 的 DNA 序列基础模型，论文使用 48 种植物参考基因组进行预训练，评估调控注释、启动子与终止子强度、表达及变异优先排序等任务。[方法与应用论文](https://doi.org/10.1038/s42003-024-06465-2)。

## 计算原理
论文所述模型将序列分为不重叠 6-mer token，以遮盖语言模型任务预测被遮盖的 token。编码器 Transformer 通过注意力层学习上下文表示；下游研究可在预训练表示之上添加任务头并按任务微调。模型输出是统计预测，实验测得的调控活性和因果效应需要独立验证。

## 输入、输出与评估
输入为符合模型分词和长度约束的 DNA 序列。预训练权重可生成序列表示，具体任务头决定分类、回归或变异评分输出。研究应记录参考基因组版本、序列方向、坐标、模型权重及任务头，并采用按染色体、同源序列或物种划分的独立测试集，以评估分布转移和数据泄漏风险。不同数据与任务的预测分数不可直接视为相同的生物学量。

## 植物应用与资源
原论文使用植物基准任务评估模型，并对木薯调控区域开展计算饱和突变分析。[原论文](https://doi.org/10.1038/s42003-024-06465-2)提供实验条件、任务及结果；[模型权重](https://huggingface.co/InstaDeepAI/agro-nucleotide-transformer-1b)与[代码仓库](https://github.com/instadeepai/nucleotide-transformer)提供使用资源。论文说明预训练代码未公开；本条目未在本机运行权重或验证预测结果。
