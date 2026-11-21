---
title: CellRank
name: CellRank
summary: 以细胞间转移概率和状态估计器分析单细胞动态、终末状态与命运概率。
dataType: 单细胞表达、邻居图、RNA velocity 或实验时间
principle: Markov 转移矩阵、转移核与命运估计
domainIds: [single-cell-spatial-omics]
topicIds: [m08-topic-05]
principleIds: [pseudotime, transition-probability]
dataIds: [single-cell-matrix, expression-matrix]
paper: cellrank2-paper
repository: https://github.com/scverse/cellrank
version: "2.x (official documentation)"
status: published
updatedAt: 2026-11-22
---
## 方法定位
CellRank 面向单细胞状态动态与命运推断。CellRank 2 将 transition kernel（建立细胞间转移矩阵）与 estimator（识别初始/终末宏状态、命运概率和基因趋势）解耦，支持从 RNA velocity、pseudotime、实验时点或开发潜能构造转移模型。[CellRank 2 方法论文](../../papers/cellrank2-paper/)；[官方文档](https://cellrank.readthedocs.io/en/stable/)。

## 算法流程
首先从 AnnData 中选取已有表达表示、邻近图、velocity 向量、pseudotime 或时间标签，按相应 kernel 为邻近细胞边赋予方向和权重，形成稀疏转移概率矩阵。随后 estimator 对该矩阵进行谱或马尔可夫链分析，估计宏状态、终末状态及每个细胞到不同终末状态的命运概率；基因趋势模型再沿状态/命运轴总结表达变化。[官方 kernel API](https://cellrank.readthedocs.io/en/stable/api/kernels.html)。

## 结果和解释
输出包括 kernel/transition matrix、初始/终末状态、fate probabilities 和轨迹相关基因趋势。结论依赖输入图、root 或真实时间标签、kernel 类型和聚类状态；snapshot pseudotime 并未直接测量真实时间。命运概率是给定模型和观测状态下的统计推断，不是谱系追踪实验。

## 植物应用和关联
CellRank 2 原论文示例为人类造血、胚层发育和肠道类器官；本站记录的水稻根与拟南芥图谱使用 Palantir、DPT 或 StationaryOT 等方法，未把这些论文归为 CellRank 应用。CellRank 未在本站环境运行。[拟时序专题](../../topics/single-cell-spatial-omics/m08-topic-05/)及[官方代码仓库](https://github.com/scverse/cellrank)。
