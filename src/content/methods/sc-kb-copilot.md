---
title: scKB 与 COPILOT
name: scKB/COPILOT
summary: 从单细胞 FASTQ 生成剪接/未剪接 UMI 矩阵，并按条形码分布过滤低质量背景。
dataType: 单细胞 FASTQ、细胞条形码白名单与参考转录本/注释
principle: pseudoalignment、UMI 去重与条形码质量分布过滤
domainIds: [single-cell-spatial-omics]
topicIds: [m08-topic-01, m08-topic-02]
principleIds: [pseudoalignment, barcode-filtering]
dataIds: [short-reads, single-cell-matrix]
paper: sc-kb-copilot-paper
repository: https://github.com/Hsu-Che-Wei/scKB
status: published
updatedAt: 2026-11-22
---
## 软件组成与分析任务
scKB 使用 kallisto pseudoalign reads 到转录本索引，结合 bustools 校正条形码、合并 UMI 并生成剪接与未剪接 gene×cell 矩阵；COPILOT R 包再根据低质量背景与高质量细胞的 UMI/基因统计分布识别细胞条形码。两部分分别完成定量和质量过滤。[方法协议](../../papers/sc-kb-copilot-paper/)；[scKB 官方仓库](https://github.com/Hsu-Che-Wei/scKB)；[COPILOT 官方仓库](https://github.com/ohlerlab/COPILOT)。

## 输入输出与数据流转职责

根据 Nature Protocols 官方协议规范，scKB 与 COPILOT 在分析流中承担严格分工的数据职责：

| 分析阶段 | 核心组件 | 必需输入 | 中间产物 | 最终输出与下游对接 |
| :--- | :--- | :--- | :--- | :--- |
| **阶段 1：序列伪比对与分子计数 (scKB)** | `kallisto` + `bustools` | 单细胞短读段 FASTQ (R1 条形码+UMI，R2 cDNA 转录本序列)、条形码白名单 (barcode whitelist)、物种 cDNA/内含子参考索引 (kallisto index) 及 GTF 注释 | 二进制条形码 UMI 序列文件 (`output.bus`)、经过纠错排序并根据等价类解析的中间记录 | 基因×细胞的原始计数矩阵 (`spliced.mtx`, `unspliced.mtx`, `genes.txt`, `barcodes.txt`) 及条形码文库测序深度统计表 |
| **阶段 2：背景过滤与细胞识别 (COPILOT)** | `COPILOT` (R 语言包) | scKB 产出的未过滤原始 UMI 计数矩阵、条形码分布表；可选：线粒体/叶绿体基因列表与物种特异性先验参数 | 条形码 UMI 频次拐点统计、背景环境游离 RNA (ambient RNA) 噪声分布模型与伪细胞打分 | 过滤后的高质量真实细胞条形码集合、高纯度单细胞表达矩阵与质控评估报告；可直接导入 Seurat 或 Scanpy 开展下游聚类分析 |

在植物单细胞实验中，原生质体制备常伴随破损细胞游离 RNA 污染，且不同组织（根尖、幼苗叶片、花器官）线粒体和叶绿体转录本丰度差异极大。因此，COPILOT 中的质量过滤阈值（如空滴界定与细胞器比例过滤）必须基于组织测序分布动态校正，切忌跨植物物种生搬硬套默认参数。

## 植物应用与边界
水稻根土壤胁迫论文在 Methods 中报告 COPILOT 预处理和 DoubletFinder 去除 doublet；拟南芥根图谱 protocol 也提供 scKB/COPILOT 植物流程。软件工作职责仅按原文所报记录，不把 scKB/COPILOT 的计数或质控归于 Scanpy。[水稻案例](../../papers/rice-root-soil-single-cell-2025/)；[拟南芥流程协议](../../papers/sc-kb-copilot-paper/)。本站未运行 scKB/COPILOT。
