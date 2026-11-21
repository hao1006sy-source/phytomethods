---
title: ArchR
name: ArchR
summary: 在 R 中组织和分析 scATAC-seq 数据，并支持 peak-to-gene 与 RNA 整合。
dataType: scATAC-seq BAM/fragment files 与可选 scRNA-seq
principle: LSI 表示、peak 集、顺式元件链接与跨模态映射
domainIds: [single-cell-spatial-omics]
topicIds: [m08-topic-07]
principleIds: [chromatin-accessibility, multi-omics-integration]
dataIds: [atac-fragments, single-cell-matrix]
paper: archr-paper
repository: https://github.com/GreenleafLab/ArchR
status: published
updatedAt: 2026-11-22
---
## 工具定位与计算问题
ArchR 是面向单细胞染色质可及性数据的 R 工具，围绕 Arrow HDF5 文件管理大型 scATAC-seq 数据，支持质控、低维表示、聚类、统一 peak set、motif/footprinting、peak-to-gene link、轨迹和与 scRNA-seq 整合。[方法论文](../../papers/archr-paper/)；[官方文档](https://www.archrproject.com/)。

## 主要流程与输出
输入为比对后的 BAM 或片段文件，先按细胞建立片段统计、TSS enrichment 等质量指标并过滤低质量细胞；再构建 tile/peak 特征矩阵、迭代 LSI 表示与邻近图，并执行聚类和细胞类型注释。联合 RNA 时将 ATAC 的 gene score 或低维表示与 RNA 表达映射，peak-to-gene link 由跨细胞共变等模型生成候选调控边。Arrow 数据文件、ArchRProject、peak/marker 表和图形是常见输出。link 与 footprinting 都是计算证据，需结合扰动和实验验证。

## 植物研究与使用边界
方法原文基准采用人和小鼠数据；本站的水稻 2025 多组学案例确有同细胞 RNA 与 ATAC，但原文公开 RSCA 与单细胞多组学代码，没有报告 ArchR，因此不建立该工具应用关系。[水稻多组学论文](../../papers/rice-single-cell-multiomics-2025/)。ArchR 本机未运行。适用流程需使用匹配的植物参考基因组、注释和适配基因长度/基因组大小的参数。[跨模态专题](../../topics/single-cell-spatial-omics/m08-topic-07/)；[ArchR 用户指南](https://www.archrproject.com/bookdown/index.html)。
