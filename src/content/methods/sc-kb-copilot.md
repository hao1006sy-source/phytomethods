---
title: scKB 与 COPILOT
name: scKB/COPILOT
summary: 从单细胞 FASTQ 生成剪接/未剪接 UMI 矩阵，并按条形码分布过滤低质量背景。
dataType: 单细胞 FASTQ、细胞条形码白名单与参考转录本/注释
principle: pseudoalignment、UMI 去重与条形码质量分布过滤
domainIds: [single-cell-spatial-omics]
topicIds: [m08-topic-01, m08-topic-02]
principleIds: [barcode-filtering]
dataIds: [single-cell-matrix, short-reads]
paper: sc-kb-copilot-paper
repository: https://github.com/Hsu-Che-Wei/scKB
status: published
updatedAt: 2026-11-22
---
## 软件组成与分析任务
scKB 使用 kallisto pseudoalign reads 到转录本索引，结合 bustools 校正条形码、合并 UMI 并生成剪接与未剪接 gene×cell 矩阵；COPILOT R 包再根据低质量背景与高质量细胞的 UMI/基因统计分布识别细胞条形码。两部分分别完成定量和质量过滤。[方法协议](../../papers/sc-kb-copilot-paper/)；[scKB 官方仓库](https://github.com/Hsu-Che-Wei/scKB)；[COPILOT 官方仓库](https://github.com/ohlerlab/COPILOT)。

## 输入输出与参数
输入为与所用技术相匹配的 FASTQ、barcode whitelist、转录本索引及基因注释；输出为 gene-by-cell spliced/unspliced 矩阵、barcode 统计和 COPILOT 过滤报告，可导入 Seurat 等下游结构。barcode chemistry、参考注释、内含子定义、空滴和过滤先验均需与实验一致。阈值和 mt.threshold 等设置属于所选数据和协议，不能直接复制到其他植物组织。

## 植物应用与边界
水稻根土壤胁迫论文在 Methods 中报告 COPILOT 预处理和 DoubletFinder 去除 doublet；拟南芥根图谱 protocol 也提供 scKB/COPILOT 植物流程。软件工作职责仅按原文所报记录，不把 scKB/COPILOT 的计数或质控归于 Scanpy。[水稻案例](../../papers/rice-root-soil-single-cell-2025/)；[拟南芥流程协议](../../papers/sc-kb-copilot-paper/)。本站未运行 scKB/COPILOT。
