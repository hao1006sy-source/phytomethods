---
title: GENIE3
name: GENIE3
summary: 用树集成回归为候选调控因子—靶基因关系排序。
dataType: 基因表达矩阵与候选调控因子列表
principle: 随机森林或 Extra-Trees 回归特征重要性
domainIds: [regulatory-genomics-ai]
topicIds: [m09-topic-03]
principleIds: [tree-ensemble-regression]
dataIds: [expression-matrix]
paper: genie3-paper
repository: https://github.com/aertslab/GENIE3
status: published
updatedAt: 2026-11-22
---
## 一句话简介与开发背景
GENIE3（GEne Network Inference with Ensemble of trees）由 Huynh-Thu 等提出，将基因调控网络推断转换为逐靶基因的树集成回归任务，最初在 DREAM4 挑战和大肠杆菌表达数据上评估。它输出候选边的相对重要性排序，不直接证明分子结合或因果调控。[方法论文](https://doi.org/10.1371/journal.pone.0012776)。

## 生物学与计算问题
表达数据中共变的基因可能共享调控、细胞组成变化或环境响应。研究者希望在给定候选转录因子集合后，排序哪些因子可能预测各靶基因表达。若无时间序列或扰动设计，模型无法单凭表达关联确定因果方向。

## 原理与算法流程
对每个候选靶基因 $g_i$，使用其他候选调控因子的表达值作为特征，拟合 Random Forest 或 Extra-Trees 回归器预测 $g_i$。每个特征对预测的贡献形成重要性分数；将所有靶基因模型的分数汇总为有向候选边列表。软件允许选择候选调控因子集合、树算法、树数量及每次分裂考虑的特征数。重要性分数是模型依赖的排序量，不能当作结合强度或激活/抑制符号。

## 输入、输出与参数
输入通常为基因 × 样本的数值表达矩阵，并可提供 TF ID 列表以限制候选调控因子。输出为候选调控因子到目标基因的权重矩阵或排序边表。分析应固定并记录树算法、树数、特征数、随机种子、基因过滤及表达变换。矩阵的行列方向须按 R 包接口确认。

## 植物案例与适用边界
拟南芥 iGRN 论文将 motif、开放染色质、TF 结合与表达来源的输入网络通过监督学习整合；该研究用于说明植物网络推断需要多源证据，并未据此宣称其核心方法是 GENIE3。[原始论文](https://doi.org/10.1038/s41477-021-00894-1)。本方法页面未确认到在所列植物案例中直接运行 GENIE3 的报告，因此不把该案例标作 GENIE3 应用。

## 方法比较、教程与关联
GENIE3 以树集成模型的特征重要性建立候选方向边；WGCNA 构建基于表达相关的加权共表达模块，通常不提供方向；多源监督网络还需整合 motif、染色质和结合证据。[官方 R 包仓库](https://github.com/aertslab/GENIE3)提供实现与示例；本地没有真实植物表达数据的运行验证。本工具关联 M09-03、GENIE3 方法论文和 M09 的 WGCNA 共表达专题。
