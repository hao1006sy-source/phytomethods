---
title: GRNBoost2
name: GRNBoost2 / Arboreto
summary: 基于梯度提升树和可扩展任务调度的基因调控候选边推断。
dataType: 基因表达矩阵与候选调控因子列表
principle: 梯度提升树回归特征重要性
domainIds: [regulatory-genomics-ai]
topicIds: [m09-topic-03]
principleIds: [tree-ensemble-regression]
dataIds: [expression-matrix]
paper: grnboost2-paper
repository: https://github.com/aertslab/arboreto
status: published
updatedAt: 2026-11-22
---
## 方法与实现定位
GRNBoost2 是基于梯度提升回归树的调控网络推断方法；Arboreto 提供将每个靶基因模型分派并聚合为加权连接的执行框架。方法论文强调可扩展实现。与 GENIE3 共用表达矩阵到有向候选边排序的输入/输出形式，内部使用的树学习方法不同。[方法论文](https://doi.org/10.1093/bioinformatics/bty916)。

## 计算流程
输入表达矩阵和候选调控因子集合后，按目标基因拟合梯度提升模型，提取预测特征重要性作为候选调控连接权重，再汇总并按权重排序。目标因子集合、表达过滤、学习器参数和 early stopping 会影响结果。高权重是模型中预测表达的重要性，不构成直接结合、激活/抑制或因果的实验结论。

## 植物应用、资源和局限
本轮核查的 M09 植物案例没有明确报告使用 GRNBoost2，故不挂接未经确认的植物论文。[Arboreto 官方仓库](https://github.com/aertslab/arboreto)提供 Python 实现、输入格式和接口说明；本机未运行真实植物数据。使用时记录软件版本、随机种子、候选 TF 集和数据划分，并用独立样本/扰动证据验证边。
