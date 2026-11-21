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
status: published
updatedAt: 2026-11-22
---
## 研究问题与计算过程
BCFtools 是处理变异数据的一组工具。常见检测流程先用 `mpileup` 汇总参考位置的比对证据及基因型似然，再用 `call` 按所选模型推断候选变异；格式转换、规范化、过滤与统计是后续独立步骤。[方法论文](https://doi.org/10.1093/gigascience/giab008)。

## 输入、输出与参数
检测时输入参考 FASTA 和坐标排序、索引的 BAM 或 CRAM；结果可为 VCF 或 BCF。官方流程用 `mpileup` 从比对证据计算基因型似然，再由 `call -m` 使用多等位基因模型生成候选基因型。`-v` 仅输出变异位点，`-Ou` 以未压缩 BCF 连接管道，`-Ob` 写出压缩 BCF。是否输出非变异位点会影响后续可检测范围的解释；官方文档指出 `mpileup` 默认每个 BAM 在单个位点最多考虑 250 条 reads，极高深度数据需评估 `--max-depth`。过滤应区分位点和样本级字段，并核对软件版本、倍性和字段定义。[官方变异检测文档](https://samtools.github.io/bcftools/howtos/variant-calling.html)。本机未运行该流程。

## 植物案例与方法边界
一项水稻杂合 SNP 检测研究比较了包含 BCFtools mpileup 在内的多种组合，并在该数据与评价方案中选择 BWA-MEM2 与 GATK HaplotypeCaller 用于后续分析。[原文](https://doi.org/10.1186/s13007-025-01437-x)。BCFtools 的读段似然和位点调用表现需结合比对、参考、深度、倍性和过滤方案解读。

## 上下游
上游为测序质控、参考选择及比对；下游为变异规范化、质量过滤、群体结构和关联分析。真实数据教程和具体版本记录仍待建设。

## 版本、许可与运行记录
截至 2026-11-21，官方发布页列出 BCFtools v1.25。源码仓库允许按 MIT/Expat 或 GPL 许可使用；启用可选 GNU Scientific Library（GSL）构建时适用 GPL。版本与许可记录依据[官方发布页](https://github.com/samtools/bcftools/releases/)及[许可证文件](https://github.com/samtools/bcftools/blob/develop/LICENSE)。本机尚无该流程的运行记录。[官方代码仓库](https://github.com/samtools/bcftools)。
