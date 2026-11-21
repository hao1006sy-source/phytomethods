---
title: ChIP-seq、CUT&Tag 与序列基序
summary: 比较蛋白结合和组蛋白标记测量，理解富集峰与 motif 的证据边界。
domain: epigenomics-3d-genome
methods: [macs3, meme-suite]
status: published
updatedAt: 2026-11-22
---
## 研究问题
细胞中的转录因子和组蛋白修饰与 DNA 调控区域如何关联？ChIP-seq 与 CUT&Tag 利用抗体定位目标蛋白或组蛋白标记附近的 DNA。测量依赖抗体特异性与适当对照；富集峰说明在所分析样本和实验条件下观察到相对富集，不能单凭峰证明直接结合或基因表达因果关系。

## ChIP-seq 与 CUT&Tag
ChIP-seq 通常通过染色质片段化、目标抗体免疫富集、DNA 回收和测序获得信号，常用 input 等对照估计背景。CUT&Tag 使用抗体引导的 protein A/G–Tn5 在目标邻近区域插入测序接头；实验步骤、样本用量和背景特征与 ChIP-seq 不同。[Kaya-Okur 等，2019](https://doi.org/10.1038/s41467-019-09982-5)。目标类型、细胞材料和抗体决定方案选择，不能把两类实验峰值当作完全相同的定量单位。

## 从 reads 到富集峰
标准流程包括样本和抗体设计、FASTQ 质控、参考比对、低质量及重复处理、峰识别、重复一致性评估和基因组注释。转录因子常呈局部窄峰，部分组蛋白修饰覆盖较宽区域；峰识别模式、背景对照与参数应与目标信号匹配。差异富集需要对统一候选区域计数并考虑重复和批次。

## Motif 的计算解释
序列基序（motif）描述一组序列中偏好的短模式，常表示为位置权重矩阵。对峰序列做 de novo 发现或已知 motif 富集时，需要选择长度、背景序列和多重检验规则。GC 含量、重复序列和可及性差异可造成背景偏倚。motif 与某个蛋白家族的偏好一致，提供候选结合解释；相关家族成员可能有相似 motif，还需要结合蛋白测量或功能实验。

MEME Suite 支持 motif 发现、扫描与富集等不同任务；应依据版本与问题选择工具，并保留背景集和参数。[MEME Suite 官方网站](https://meme-suite.org/meme/)。

## 植物案例与延伸阅读
拟南芥 bZIP11 研究结合遗传、ChIP 和组蛋白乙酰化相关实验研究生长素应答基因，[原论文记录](../../../papers/arabidopsis-bzip11-chromatin-2014/)；后续 ATAC-seq 数据集分析开放区域与 motif，[数据论文](../../../papers/arabidopsis-bzip11-atac-2023/)。两篇论文关注相关转录因子体系但测量和研究目标不同。可进一步阅读 [CUT&Tag 方法论文](../../../papers/cutntag-paper/)。

## 抗体富集、峰注释与 motif 假设
ChIP-seq 富集依赖目标抗体、input/IgG 对照、染色质片段化和测序深度；CUT&Tag 以抗体定位 protein A/G–Tn5，背景和片段特征不同。两类 assay 的峰高和宽度不应直接作为同一种绝对量。MACS3 可按 TF narrow peaks 或组蛋白 broad peaks 任务调用，参数需匹配文库和对照；[工具页](../../../methods/macs3/)说明 assay 边界。

Motif 富集应使用生物学合理、序列组成匹配的背景集。若输入的是同一批 peak 中心序列，背景可按 GC 与长度匹配；跨基因组扫描还需处理重复序列和可比对性。MEME 用于发现 motif，FIMO 用于对已给 motif 进行位置扫描；[MEME Suite 工具页](../../../methods/meme-suite/)和[方法论文](../../../papers/meme-suite-paper/)说明其功能范围。motif 相似不能区分共享结合偏好的 TF 家族成员，需结合 ChIP、CUT&Tag、遗传材料或报告基因验证。

植物案例分别来自 bZIP11 组蛋白乙酰化研究、ATAC-seq 数据论文与 CUT&Tag 技术方法，三类来源回答的问题不同。方法论文不作为植物生物学发现，数据论文也不意味着所有算法在原文中均被使用。参考[拟南芥 bZIP11 ATAC-seq 案例](../../../papers/arabidopsis-bzip11-atac-2023/)与[CUT&Tag 原始方法](../../../papers/cutntag-paper/)。
