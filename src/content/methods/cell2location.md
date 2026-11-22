---
title: cell2location
name: cell2location
summary: 以参考单细胞表达签名分解空间转录组 counts，估计每个位置的细胞类型丰度。
dataType: 单细胞参考表达矩阵与空间 spot/gene counts
principle: 层次贝叶斯负二项模型与细胞丰度推断
domainIds: [single-cell-spatial-omics]
topicIds: [m08-topic-06]
principleIds: [bayesian-deconvolution]
dataIds: [single-cell-matrix, spatial-count-matrix]
paper: cell2location-paper
repository: https://github.com/BayraktarLab/cell2location
status: published
updatedAt: 2026-11-22
---
## 研究问题与模型背景
cell2location 将解离单细胞数据提供的细胞类型表达签名映射到空间转录组位置，估计混合 spot 中不同参考细胞类型的相对丰度。论文提出层次贝叶斯模型，以负二项计数建模空间表达，并为技术平台效应、背景 RNA 和位置间细胞组成变化提供参数化表示。[方法论文](../../papers/cell2location-paper/)；[官方代码与文档](https://github.com/BayraktarLab/cell2location)。

## 计算流程
第一阶段以标注的 scRNA-seq 参考矩阵训练 cell-type signature 模型；第二阶段将参考签名与空间 counts 对齐到共同基因集合，拟合每个位置的细胞类型丰度及技术效应。输出后验丰度估计和不确定性摘要。实际工作需按技术平台评估共同基因、参考细胞类型覆盖和 `N_cells_per_location` 等先验；默认参数不等于组织的已知细胞数。[官方教程](https://cell2location.readthedocs.io/en/latest/notebooks/cell2location_tutorial.html)。

## 输入、输出及解释
输入应保留原始或适合模型的空间 UMI counts、匹配基因标识、细胞注释参考与位置元数据；输出为各位置的细胞类型丰度估计及模型结果文件。丰度取决于参考组成、捕获技术、基因集合和先验，低置信度结果需通过组织学、原位标记或参考敏感性分析检查。该结果是模型估计，不是显微镜细胞计数。

## 植物研究与关联
原始方法论文应用于人和小鼠组织。本站水稻根土壤研究使用 Molecular Cartography 靶向原位分子检测，没有报告 cell2location，因此不建立该论文的软件应用关系。[水稻空间研究](../../papers/rice-root-soil-single-cell-2025/)；[空间转录组专题](../../topics/single-cell-spatial-omics/m08-topic-06/)。本软件尚未在本站环境运行。
