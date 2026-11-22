---
title: MEME Suite
name: MEME Suite
summary: 执行 DNA、RNA 或蛋白序列基序发现、富集检验与 motif 扫描。
dataType: 峰区或候选调控区序列与 motif 矩阵
principle: 位置权重矩阵与序列基序统计
domainIds: [epigenomics-3d-genome, regulatory-genomics-ai]
topicIds: [m07-topic-05, m09-topic-04]
principleIds: [motif-analysis]
dataIds: [dna-sequence]
paper: meme-suite-paper
repository: https://github.com/meme-suite/meme
version: 官方在线文档
status: published
updatedAt: 2026-11-22
---
## 工具定位与算法组成
MEME Suite 是序列基序分析工具集合。MEME 与 STREME 用于 de novo motif discovery；AME 等工具做集合层面的富集分析；FIMO 在序列中扫描已知 motif。各工具回答的问题不同，不能把序列扫描结果称作 de novo 发现。[MEME Suite 方法论文](https://doi.org/10.1093/nar/gkv416)；[官方总览](https://meme-suite.org/meme/doc/overview.html)。

## 计算原理与流程
motif 常表示为位置特异概率或权重矩阵，用来描述一组结合位点中每个位置碱基分布。de novo 模块从输入序列归纳重复模式；富集分析将目标序列中 motif 的出现与背景集比较；FIMO 对每个位置计算相对背景模型的 log-odds 分数，再换算显著性值，并可对扫描结果报告 q-value。[FIMO 官方文档](https://meme-suite.org/meme/doc/fimo.html)。

从 ATAC-seq 或 ChIP-seq 开始，应先依据样本条件生成并筛选峰区，抽取峰序列并建立匹配的背景序列。背景集应考虑 GC、长度、可比对性和序列组成；输入峰、峰中心窗口、motif 数据库、扫描方向和多重检验策略均需记录。发现 motif 只提供与某类 DNA-binding protein 偏好相似的序列证据，不能单独识别实际结合蛋白或证明调控因果。

## 输入、输出与植物研究
输入为 FASTA 序列和/或 MEME 格式 motif 矩阵；输出取决于模块，包括 motif 矩阵、富集统计和带坐标的匹配表。拟南芥 bZIP11 ATAC-seq 数据集研究了处理相关可及区域，motif 的具体分析软件依其原文方法说明；本站不将该研究的 motif 结果归到 MEME Suite，作为分析问题的植物案例。[原始数据论文](../../papers/arabidopsis-bzip11-atac-2023/)。

## 官方资源与关联
官方文档说明序列格式、背景设置、阈值和输出；代码仓库为 [meme-suite/meme](https://github.com/meme-suite/meme)。本机未运行软件。上游可接 MACS3 输出峰；下游候选 motif 需结合表达、蛋白测量和扰动实验。延伸阅读：[ChIP-seq、CUT&Tag 与 motif 专题](../../topics/epigenomics-3d-genome/m07-topic-05/)和[方法论文](../../papers/meme-suite-paper/)。
