---
title: DESeq2
name: DESeq2
summary: 基于负二项广义线性模型分析 RNA-seq 计数差异表达的 R 软件包。
dataType: 基因计数矩阵与样本信息
principle: 负二项计数模型和离散度估计
domainIds: [regulatory-genomics-ai]
topicIds: [m09-topic-01]
principleIds: [negative-binomial]
dataIds: [expression-matrix]
paper: deseq2-2014
repository: https://github.com/thelovelab/DESeq2
status: draft
updatedAt: 2026-11-21
---
## 研究问题与软件定位
DESeq2 是 Bioconductor 中用于高通量测序计数数据差异分析的 R 包。它根据实验设计比较样本条件，并结合基因间信息估计离散度；统计结果依赖生物学重复、数据质量及模型设计。[方法论文](https://doi.org/10.1186/s13059-014-0550-8)。

## 计算原理
对基因计数使用负二项广义线性模型；样本尺度因子处理测序深度及组成差异，离散度描述相对于泊松分布的额外变异。基因层面的离散度估计利用均值与离散度关系进行稳定化。设计公式定义需要估计的条件和协变量；Wald 检验和似然比检验对应不同的比较问题。log2 倍数变化收缩方法需按实际选择报告。

## 输入、分析与输出
输入通常为基因乘样本的原始整数计数矩阵和对应样本信息；由转录本定量工具得到的估计计数应使用官方支持的导入方式。样本表顺序须与矩阵列一致。设置可估计的设计公式后运行 `DESeq`，用 `results` 指定比较；输出包括平均表达、log2 倍数变化、标准误、统计量、P 值与校正 P 值。全零基因、离群值处理或独立过滤可能导致部分结果为 NA。TPM 不能直接代替标准原始计数输入。

## 植物研究案例
Jin 等比较两个玉米品种灌浆期干旱和供水条件下的叶片转录组，使用 DESeq2 识别差异表达基因，并对候选基因进行 qRT-PCR 分析。[原始论文](https://doi.org/10.1371/journal.pone.0223786)。

## 官方资料与分析衔接
[Bioconductor 软件页面](https://bioconductor.org/packages/DESeq2/)和[官方教程](https://bioconductor.org/packages/release/bioc/vignettes/DESeq2/inst/doc/DESeq2.html)列出安装与分析示例。上游需完成测序质控、定量和样本信息整理；下游可结合功能富集和独立实验研究候选基因。此条目尚未提供本机运行验证的 DESeq2 教程。
