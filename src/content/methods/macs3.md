---
title: MACS3
name: MACS3
summary: 以局部背景模型识别 ChIP-seq、ATAC-seq 等实验中的富集区域。
dataType: 比对后的 ChIP-seq 或 ATAC-seq reads / fragments
principle: 局部背景富集检验与 peak calling
domainIds: [epigenomics-3d-genome]
topicIds: [m07-topic-04, m07-topic-05]
principleIds: [peak-calling]
dataIds: [atac-fragments, chip-seq]
paper: macs-paper
repository: https://github.com/macs3-project/MACS
version: "3.1.0 documentation"
status: published
updatedAt: 2026-11-22
---
## 定位与开发背景
MACS3 是 ChIP-seq 与相关调控组学的 peak-calling 平台。MACS 方法论文提出以局部背景估计识别免疫富集测序信号中的候选区域；当前 MACS3 官方手册记录 bulk、paired-end 和 ATAC-seq 工作流。[原始方法论文](https://doi.org/10.1186/gb-2008-9-9-r137)；[MACS3 官方文档](https://macs3-project.github.io/MACS/)。

## 算法流程与输入
输入为比对到参考基因组的 reads 或 paired-end fragments，ChIP-seq 可同时提供 input control。`callpeak` 估计信号相对背景的富集并按阈值输出候选峰；ATAC-seq 的成对模式将 read pair 作为片段处理，单端插入位点分析的 shift/extension 设置需按手册和数据格式选择。宽组蛋白标记适用 broad 模式；目标 assay、对照和峰形决定模型选择。

## 输出、参数与解释
典型输出包含 narrowPeak 或 broadPeak 区间、峰强度与信号轨道（按选项生成）。`-f` 指定输入格式，`-g` 指定基因组有效大小，`-t` 指定处理组，`-c` 指定对照，`-q` 控制 q-value 阈值；这些值需依据物种参考、数据协议和分析计划设定，不能沿用人类默认基因组大小到植物。峰表示在该样本和统计模型下的富集信号，须结合重复一致性、批次与对照判断。

## 植物应用与边界
拟南芥 bZIP11 数据论文提供诱导处理 ATAC-seq 与 motif 研究案例，但其软件任务和版本须以论文 Methods 原文记录；此页不将其峰调用归为 MACS3。MACS3 是通用 peak caller，工具页说明其算法功能，不以此推断它用于该案例。[植物 ATAC-seq 数据论文](../../papers/arabidopsis-bzip11-atac-2023/)。

## 代码、教程与关联
官方代码仓库和[callpeak 文档](https://macs3-project.github.io/MACS/docs/callpeak.html)列出当前格式及参数。官方示例包括 ChIP-seq narrow/broad peaks、ATAC paired-end 与片段输入。本文未在本机运行 MACS3。上游为文库制备、FASTQ 质控和比对；下游为统一 peak 集计数、差异检验、注释或序列基序分析。继续阅读[开放染色质专题](../../topics/epigenomics-3d-genome/m07-topic-04/)、[ChIP-seq 与 motif 专题](../../topics/epigenomics-3d-genome/m07-topic-05/)和[MACS 方法论文](../../papers/macs-paper/)。
