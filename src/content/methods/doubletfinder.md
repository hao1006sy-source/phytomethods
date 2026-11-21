---
title: DoubletFinder
name: DoubletFinder
summary: 利用人工合成 doublet 与表达邻域识别单细胞 RNA-seq 混合捕获候选。
dataType: QC 后的单细胞表达矩阵
principle: 人工 doublet 合成、近邻分类与 pANN 排序
domainIds: [single-cell-spatial-omics]
topicIds: [m08-topic-02]
principleIds: [doublet-detection, synthetic-doublet-neighbor]
dataIds: [single-cell-matrix]
paper: doubletfinder-paper
repository: https://github.com/chris-mcginnis-ucsf/DoubletFinder
status: published
updatedAt: 2026-11-22
---
## 算法原理
DoubletFinder 在预处理后的表达低维空间中将真实细胞与人为合成的细胞对混合，计算每个观测的 pANN（其近邻中人工 doublet 所占比例）；按实验预期 multiplet 数筛选排名靠前的候选。合成 profile 来源和邻居数、PC 数、预期 doublet rate 与同型 doublet 组成都会影响结果。[原始方法论文](../../papers/doubletfinder-paper/)；[官方仓库](https://github.com/chris-mcginnis-ucsf/DoubletFinder)。

## 实际流程及输出
先完成条形码识别、低质量细胞过滤和基础归一化/降维，再依据平台装载量估计候选 doublet 数，选择人工 doublet 比例与邻居参数，输出 pANN 分数及分类标签。该方法以细胞表达矩阵为输入，不处理 FASTQ，也不替代空液滴去除。候选结果应结合总 UMI、marker 共表达、已知混合样本标签和实验上样量审阅。

## 植物案例与关系
水稻根土壤胁迫论文明确报告用 DoubletFinder 识别并移除 putative doublets；软件页面不推断其余数据处理均由该工具完成。[原文](../../papers/rice-root-soil-single-cell-2025/)。植物细胞类型、倍性和组织状态会改变表达近邻分布，参数应按样本及平台复核。本软件未在本站环境运行。[质控专题](../../topics/single-cell-spatial-omics/m08-topic-02/)。
