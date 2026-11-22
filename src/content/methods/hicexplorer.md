---
title: HiCExplorer
name: HiCExplorer
summary: 从 Hi-C 配对数据构建接触矩阵，并执行归一化、结构分析和可视化。
dataType: Hi-C paired-end reads 或接触矩阵
principle: 接触矩阵构建、校正与多尺度结构识别
domainIds: [epigenomics-3d-genome]
topicIds: [m07-topic-06]
principleIds: [hic-contact-matrix]
dataIds: [hic-contact-matrix]
paper: hicexplorer-paper
repository: https://github.com/deeptools/HiCExplorer
version: "4"
status: published
updatedAt: 2026-11-22
---
## 背景与研究问题
HiCExplorer 是处理、校正、分析与可视化 Hi-C、Micro-C 和 capture Hi-C 数据的命令行工具集合。该项目的流程覆盖 reads 预处理、接触矩阵、质量控制、归一化、compartment、结构域与 loop 分析。[HiCExplorer 3 方法论文](https://doi.org/10.1093/nar/gkaa220)；[当前官方文档](https://hicexplorer.readthedocs.io/en/latest/)。

## 算法流程
有效的成对比对片段由 `hicBuildMatrix` 按固定 bin 或限制性位点汇总为稀疏 contact matrix；随后 `hicCorrectMatrix` 等程序可校正覆盖偏差。`hicPCA` 和 `hicCompartmentalization` 支持大尺度 compartment 分析；`hicFindTADs` 使用多窗口 TAD-separation score 寻找局部分隔边界；`hicDetectLoops` 识别相对局部背景富集的接触候选。具体统计定义和默认参数以版本文档为准，不能把一个软件输出直接等同于确定的细胞结构。

## 输入输出与主要选项
输入可以是配对比对文件或受支持的矩阵格式；矩阵可采用 `.cool`、`.mcool` 等格式。关键选择包括 bin 大小、有效 pairs 过滤、矩阵平衡方法、最小与最大窗口深度、多重检验校正和重复合并。输出包括矩阵、分区/边界或候选互作表以及图。不同 bin 大小的稀疏程度不同，跨样本比较需保持处理流程和矩阵尺度一致。

## 植物案例与解释范围
拟南芥热胁迫研究先用 HiC-Pro 处理 Hi-C 配对数据，再使用 HiCExplorer 转换 contact matrix、归一化、检查距离衰减并生成可视化；A/B compartment 的 PCA 则由 HOMER 计算。研究报告热处理后转座子激活与部分三维互作重排相关，不能把相关性改写为单一因果链。[原文记录](../../papers/arabidopsis-heat-hic-2020/)。另一项拟南芥 PDS5 突变研究使用 HiTC、Juicer 和 Arrowhead 分析，不属于 HiCExplorer 应用案例。[PDS5 原始论文](../../papers/arabidopsis-pds5-hic-2024/)。

## 官方教程与关联
官方教程按 FASTQ/比对、矩阵构建、校正、结构分析和可视化组织；当前文档包含真实及模拟测试数据示例。本项目未运行 HiCExplorer。上游需获得高质量参考和有效配对，下游可整合 RNA-seq、ATAC-seq 和组蛋白标记。[官方教程](https://hicexplorer.readthedocs.io/en/latest/)、[代码仓库](https://github.com/deeptools/HiCExplorer)、[Hi-C 专题](../../topics/epigenomics-3d-genome/m07-topic-06/)及[方法论文](../../papers/hicexplorer-paper/)。
