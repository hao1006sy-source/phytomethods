---
title: Scanpy
name: Scanpy
summary: 用 Python 对单细胞表达矩阵进行质控、降维、聚类和可视化。
dataType: 单细胞 × 基因表达矩阵
principle: 特征处理、邻近图与社区聚类
domainIds: [single-cell-spatial-omics]
topicIds: [m08-topic-01, m08-topic-02, m08-topic-03, m08-topic-04, m08-topic-05]
principleIds: [single-cell-graph]
dataIds: [single-cell-matrix]
paper: scanpy-paper
repository: https://github.com/scverse/scanpy
status: draft
updatedAt: 2026-11-21
---
## 研究问题和定位
Scanpy 是 F. Alexander Wolf、Philipp Angerer、Fabian Theis 等开发的 Python 单细胞分析工具包，围绕 AnnData 组织表达矩阵、细胞和基因元数据。[原始论文](https://doi.org/10.1186/s13059-017-1382-0)。它集成不同分析方法；使用时应分别说明所选质控、归一化、降维和聚类模型。

## 计算流程
常见流程按样本检查每细胞计数、检测基因数和其他质量指标；保存原始计数后进行适当归一化与变换，选择特征并计算 PCA。随后根据 PCA 或其他表示构建邻近图，使用 Leiden 等方法划分图社区，并用 UMAP 等展示。聚类结果受输入、邻居数、分辨率与随机性影响；UMAP 是低维展示，坐标不直接代表物理位置或细胞发育时间。

## 输入、输出与参数
输入可以是经转换的 AnnData 对象或工具支持的表达矩阵；AnnData 的细胞、基因、矩阵和元数据应保持对应。输出可以保存 `.h5ad`、表格及图像。参数包括质控阈值、归一化目标、特征集合、PCA 维度、邻居数、聚类分辨率及随机种子。原始 counts 和分析用变换矩阵应区分；对不同处理的统计推断需要独立生物学重复。

## 植物应用
水稻根单细胞研究使用 Scanpy 进行归一化、变换、特征选择、PCA 和邻近图等步骤，结合细胞分化和染色质可及性研究。[Zhang 等，2021](https://doi.org/10.1038/s41467-021-22352-4)。具体过程与版本以论文方法为准，不将本文教学模拟数据描述成该研究的实验数据。

## 版本、许可及教程
本机隔离环境使用 Scanpy 1.13.0，已完成模拟计数矩阵的质控、PCA、Leiden 和 UMAP 验证；尚未运行植物实验数据。项目使用 BSD 3-Clause 许可，详见[官方仓库](https://github.com/scverse/scanpy)；具体代码及输入输出解释见关联教程。
