---
title: Hifiasm
name: Hifiasm
summary: 利用高保真长读长构建相位感知的基因组组装图。
dataType: PacBio HiFi
principle: 重叠图与单倍型解析
domainIds: [genome-assembly]
topicIds: [assembly-basics, assembly-graphs, complete-assembly, haplotype-resolution, sequencing-data]
principleIds: [overlap, phasing]
dataIds: [hifi]
paper: hifiasm
repository: https://github.com/chhylp123/hifiasm
updatedAt: 2026-11-20
---
## 研究问题
植物基因组中的杂合位点与重复序列使同源染色体难以区分。Hifiasm 利用 HiFi reads 的高准确率构造相位感知组装图，保留单倍型差异并输出图结构。

## 计算思路
软件先纠正和比对 reads，再构造组装图，利用变异与可用的辅助数据解决部分相位歧义。输出路径反映图上的候选序列；重复或复杂多倍体结构仍需额外评估。

## 输入与输出
输入为 HiFi FASTQ/FASTA；输出包括 GFA 格式的组装图。不同参数和数据组合产生不同输出，具体含义以软件文档为准。

## 植物研究
高杂合与重复序列常见于植物基因组。实验设计应结合样本倍性、测序覆盖度和目标单倍型数量。

## 实践与来源
参阅本站 Hifiasm 教程与[官方文档](https://github.com/chhylp123/hifiasm)。原始方法论文 DOI： [10.1038/s41592-020-01056-5](https://doi.org/10.1038/s41592-020-01056-5)。

## 开发背景与核心流程
Hifiasm 是面向高准确度长读长的组装软件。HiFi reads 来自 PacBio 环形一致性测序；较低的错误率有利于识别同源染色体间的真实差异。软件对 reads 进行纠错、寻找重叠并构造相位感知组装图；图中的等位分支提供单倍型信息。图清理与路径选择使用覆盖、序列和图连接等证据。此处概述算法思想，软件版本的具体实现以论文和官方文档为准。

## 输入、参数与结果
HiFi reads 可使用 FASTA 或 FASTQ，支持 gzip 压缩。`-o` 指定输出前缀，`-t` 指定线程数；`--h1` 和 `--h2` 指定配对 Hi-C reads，需按文档选择适合数据的模式。HiFi-only 示例中，`*.bp.p_ctg.gfa` 是 primary contig 图，`*.bp.hap1.p_ctg.gfa` 和 `*.bp.hap2.p_ctg.gfa` 是部分相位的 contig 图；两套结果仍可能包含相位切换。GFA 的 S 行记录序列片段，L 行记录连接。具体输出以软件版本和运行模式为准。

## 已核实植物案例
[Macadamia jansenii 基因组组装研究](https://doi.org/10.1111/tpj.15583)的方法部分使用 Hifiasm 组装 HiFi reads，提供植物材料的具体实践。该案例和本教程的命令模板分别描述已发表研究与待执行的教学流程。

## 相关资源
[官方软件与教程](https://github.com/chhylp123/hifiasm)；[输出解释](https://hifiasm.readthedocs.io/en/latest/interpreting-output.html)；[方法论文](https://doi.org/10.1038/s41592-020-01056-5)。上游需要准备高质量 reads，下游可用 Merqury 等方法评估质量。
