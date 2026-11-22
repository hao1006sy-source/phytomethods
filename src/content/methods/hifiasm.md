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

## 一句话简介与开发背景
Hifiasm 是面向 PacBio HiFi 读段的 de novo 组装器，以相位感知重叠图处理复杂二倍体和多倍体材料。Cheng 等 2021 年方法论文报告了基于 HiFi 和 trio-binning 的组装策略，并在多种非人类数据上评估，论文也说明了参考无关图结构及单倍型路径的价值。

## 算法原理与图处理
HiFi 的高准确率使长读段间的可靠重叠可支持单倍型差异识别。Hifiasm 使用种子与重叠关系建立读段图，通过图简化和纠错降低错误分支，再利用杂合变异与 reads 支持将等位序列保留为候选路径。输出图可包含 primary/alternate 或 haplotype contig 路径；不同模式下文件命名和保留关系会改变。不要把图中所有分支直接解释为杂合等位变异：重复、低质量重叠和旁系同源序列也会形成分支。

## 运行入口、输入检查与参数
输入应为同一材料的 HiFi FASTQ/FASTA，压缩格式与路径要求按安装版本确认。基础形式为 `hifiasm -o sample -t 32 reads.fq.gz`，`-o` 为前缀，`-t` 为线程数；trio 模式提供父本/母本短读段并按官方文档设置对应参数，Hi-C 模式可通过 `--h1/--h2` 传入两端 Hi-C reads。运行前检查样本 ID、read 数、碱基数、文件完整性和覆盖度；不同版本参数可能变化，命令需与实际 `hifiasm --help` 一起存档。

## 输出文件阅读
GFA 中的 `S` 行代表片段序列，`L` 行代表重叠连接，`P` 行代表路径。HiFi-only 常见输出包括 `*.bp.p_ctg.gfa` 和 `*.bp.hap1.p_ctg.gfa`、`*.bp.hap2.p_ctg.gfa` 等图文件；primary contig 不等同于单倍体全序列，hap1/hap2 是否完整分相需结合运行模式、GFA 路径和覆盖评估。可以使用 `awk` 或 `gfatools` 从选定路径生成 FASTA，但需按官方输出解释选择对应 GFA 文件，避免将 primary 与 alternate 冗余片段重复导出。

## 植物案例及证据
Macadamia jansenii 论文方法部分报告 HiFi reads 使用 Hifiasm 默认设置及内置 haplotig 处理；结果中 8 条染色体以大型连续片段表示，其余染色体仍为多个主要 contig，未解析缺口主要涉及 rDNA 重复。这是已发表植物应用案例，不代表所有植物均能达到相同连续性。见 [Sharma 等 2022 原文](https://doi.org/10.1111/tpj.15583)。

## 适用范围与质量评估
Hifiasm 适用于高准确长读段支持的长读段组装及相位解析；超长重复仍可能缺少跨越证据，多倍体材料需明确目标倍性和预期输出路径。建议报告软件版本、输入平台与读段数、覆盖、命令、GFA/FASTA 层级，并结合 Merqury、BUSCO、Hi-C 联系图和长 reads 回贴进行多维评估。
