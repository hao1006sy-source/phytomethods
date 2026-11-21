---
title: MOFA+
name: MOFA+
summary: 以多视图潜在因子分解整合多组学样本和群组。
dataType: 对齐样本的多组学矩阵（多个 views，可含多个 groups）
principle: 贝叶斯多视图因子分析与变分推断
domainIds: [regulatory-genomics-ai]
topicIds: [m09-topic-05]
principleIds: [latent-factor-integration]
dataIds: [multi-omics-view-matrix]
paper: mofa-plus-paper
repository: https://github.com/bioFAM/MOFA2
status: published
updatedAt: 2026-11-22
---
## 一句话简介与开发背景
MOFA+（Multi-Omics Factor Analysis v2）是用于多视图、多组数据的无监督潜在因子模型，通过变分推断扩展早期 MOFA 框架，以识别跨组学共享及视图特有的主要变异来源。[方法论文](https://doi.org/10.1186/s13059-020-02015-1)。

## 生物学问题与输入设计
植物研究常对相同实验单位测量 RNA、蛋白、代谢或表观层。MOFA+ 以相同样本为行、分子特征为列，按组学划分 views，并可将样本划分为 groups。样本配对、批次、组织和缺失模式影响因子解释；样本映射应在拟合前检查。

## 计算原理与算法流程
模型将每个 view 表示为低秩因子与特征权重的组合加残差。潜在因子刻画样本间变异，view-specific 权重指示各特征与因子的关系；自动相关性确定先验及稀疏先验用于降低无关因子/权重贡献。MOFA+ 采用随机变分推断处理多组和较大数据。每个 view 的观测似然应匹配数据类型；常用连续数据需要适当变换。因子的正负方向本身可翻转，解释应结合权重、样本得分和实验设计。

## 输入、输出与参数
输入是按样本对齐的矩阵列表、view 标签、group 标签及各 view 的数据类型。需记录缺失数据处理、特征过滤、似然、初始因子数、迭代和收敛设置。输出包括样本因子值、各 view 的特征权重和方差解释结果。初始因子数不是最终保留因子数，训练后需检查低解释度因子并进行稳定性分析。

## 植物应用和边界
玉米多组学网络研究整合基因组、转录组、翻译组与蛋白质组信息，提出功能模块及候选基因；此处作为植物多组学研究案例，不表示该论文使用 MOFA+。[研究原文](https://doi.org/10.1038/s41588-022-01262-1)。当前登记的植物应用论文没有核实到直接使用 MOFA+ 的案例，因此方法与植物案例分开标注。

## 官方资源与上下游
[MOFA2 官方代码库](https://github.com/bioFAM/MOFA2)含 R/Python 接口及示例；[官方文档](https://biofam.github.io/MOFA2/)说明模型输入和解释。上游是各组学质控、归一化和样本配对，下游可关联表型、通路及候选分子并以独立实验验证。本页不宣称本地已运行真实植物数据。
