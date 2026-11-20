---
title: BCFtools
name: BCFtools
summary: 处理 VCF/BCF 数据并支持基于比对的变异检测。
dataType: BAM / CRAM / VCF / BCF
principle: 基因型似然与变异数据处理
domainIds: [population-genetics]
topicIds: [m05-topic-02]
principleIds: [variant-calling]
dataIds: [variant-data]
paper: bcftools-paper
repository: https://github.com/samtools/bcftools
status: draft
updatedAt: 2026-11-21
---
## 研究问题与计算过程
BCFtools 是处理变异数据的一组工具。常见检测流程先用 `mpileup` 汇总参考位置的比对证据及基因型似然，再用 `call` 按所选模型推断候选变异；格式转换、规范化、过滤与统计是后续独立步骤。[方法论文](https://doi.org/10.1093/gigascience/giab008)。

## 输入、输出与参数
检测时输入参考 FASTA 和排序、索引的 BAM 或 CRAM；结果可为 VCF 或 BCF。官方示例中 `mpileup -f` 指定参考，`call -m` 使用多等位基因检测模型，`-v` 请求仅输出变异位点。是否输出非变异位点会影响后续可检测范围的解释。过滤应区分位点和样本级字段，核对软件版本、倍性和字段定义。[官方文档](https://samtools.github.io/bcftools/howtos/variant-calling.html)。本机未运行该流程。

## 植物案例与方法边界
一项水稻杂合 SNP 检测研究比较了包含 BCFtools mpileup 在内的多种组合，并在其数据与评价条件下选择其他组合用于后续分析。[原文](https://doi.org/10.1186/s13007-025-01437-x)。软件仓库提供 MIT/Expat 或 GPL 许可选项；多倍体的等位剂量和读段错配需要结合数据及软件设置核查。[许可与源码](https://github.com/samtools/bcftools)。

## 上下游
上游为测序质控、参考选择及比对；下游为变异规范化、质量过滤、群体结构和关联分析。真实数据教程和具体版本记录仍待建设。
