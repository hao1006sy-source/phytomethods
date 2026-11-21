---
title: Squidpy
name: Squidpy
summary: 为空间分子数据建立空间图并执行空间统计、图像分析和可视化。
dataType: 空间坐标、AnnData 表达矩阵与组织图像
principle: 空间邻居图、置换检验与空间自相关
domainIds: [single-cell-spatial-omics]
topicIds: [m08-topic-06]
principleIds: [spatial-neighborhood]
dataIds: [single-cell-matrix, spatial-coordinates, tissue-image]
paper: squidpy-paper
repository: https://github.com/scverse/squidpy
version: "1.8.4 stable documentation"
status: published
updatedAt: 2026-11-22
---
## 定位与科学问题
Squidpy 以 AnnData/SpatialData 生态中的空间坐标、细胞或 spot 标注和组织图像为输入，分析空间邻近、细胞类型共现、基因空间自相关及图像特征。它不估计混合 spot 的细胞丰度；后者由 cell2location 等参考映射模型处理。[方法论文](../../papers/squidpy-paper/)；[官方文档](https://squidpy.readthedocs.io/en/stable/)。

## 图构建和统计
空间邻居函数按坐标、网格或三角剖分建立图，节点代表 cell/spot、边代表空间关系。邻域富集在保持空间图不变的情况下置换类别标签，比较观察到的相邻类型计数和置换分布；Moran’s I 衡量基因表达在空间图上的自相关。结果依赖邻域定义、置换方案、样本组织形态和多重检验，空间相关不能单独证明细胞间信号传导。[官方 Quickstart](https://squidpy.readthedocs.io/en/latest/quickstart.html)。

## 输入输出与流程
输入通常包含 `AnnData`、`obsm['spatial']` 坐标、细胞类型标签及可选组织图像；流程为检查坐标与图像配准、建立邻接图、运行空间统计，再以空间散点图或图像叠加检查结果。输出储存在 AnnData 的图结构和 `uns` 统计对象中，并可导出图形。点位、像素和物理单位需保持同一坐标系。

## 植物案例及工具边界
水稻土壤胁迫研究使用 Molecular Cartography 进行靶向 mRNA 原位检测，结果可用于空间表达解释；其原文没有报告 Squidpy，因此该工具页不将其作为 Squidpy 植物应用。[水稻原文](../../papers/rice-root-soil-single-cell-2025/)。软件本机未运行。上游可接空间转录组矩阵、细胞注释与图像配准；下游可与 cell2location 丰度估计、组织学验证或多组学结果并列解释。[空间专题](../../topics/single-cell-spatial-omics/m08-topic-06/)；[cell2location](../../methods/cell2location/)。
