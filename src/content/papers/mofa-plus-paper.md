---
title: "MOFA+: a statistical framework for comprehensive integration of multi-modal single-cell data"
summary: "提出用于多视图、多组多组学数据的变分贝叶斯潜在因子框架。"
authors: "Argelaguet R, Arnol D, Bredikhin D, et al."
year: 2020
journal: Genome Biology
doi: 10.1186/s13059-020-02015-1
type: method
methodIds: [mofa-plus]
domainIds: [regulatory-genomics-ai, single-cell-spatial-omics]
speciesIds: []
status: published
updatedAt: 2026-11-22
---
## 研究问题

同一细胞或样本可测得 RNA、染色质、蛋白等多类数据，每类视图的特征和噪声不同。MOFA+ 的目标是识别多视图之间共享及视图特有的主要变异，并支持多组样本建模及缺失数据整合。

## 方法贡献与模型

MOFA+ 将每个视图矩阵表示为低秩样本因子和视图特异特征权重的乘积加残差，并在因子及权重上引入稀疏/自动相关先验。模型允许按数据分布选择似然，通过随机变分推断扩展到多组和更大的样本集合。输出包括样本因子值、特征权重和解释方差摘要；因子可视化帮助发现潜在群体结构、批次或共变程序。

## 结果与适用边界

论文在模拟数据和单细胞多组学案例中展示模型的整合与解释能力。文章的展示数据不是植物基因组研究，不应标记为植物软件应用。植物使用者需先保证组学样本配对、ID 映射和预处理一致，选择与每个视图数据类型相容的似然，并检查因子对批次、组织或测序深度的敏感性。因子与表型的相关不能单独支持因果机制。

## 阅读重点与植物应用区分

阅读模型章节时关注 view/group 结构、先验、缺失数据和变分推断；阅读案例时区分模型演示与软件 benchmark。玉米多组学网络研究展示了植物研究中整合基因组、转录组、翻译组和蛋白质组的路径，但没有因此标记为 MOFA+ 应用：[玉米研究](https://doi.org/10.1038/s41588-022-01262-1)。[方法原文](https://doi.org/10.1186/s13059-020-02015-1)、[MOFA2 官方文档](https://biofam.github.io/MOFA2/)。
