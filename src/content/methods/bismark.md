---
title: Bismark
name: Bismark
summary: 比对亚硫酸氢盐处理的测序 reads，并提取胞嘧啶甲基化状态。
dataType: BS-seq FASTQ 与参考 FASTA
principle: 亚硫酸氢盐感知比对与甲基化提取
domainIds: [epigenomics-3d-genome]
topicIds: [m07-topic-02, m07-topic-03]
principleIds: [bisulfite-mapping]
dataIds: [bisulfite-reads]
paper: bismark-paper
repository: https://github.com/FelixKrueger/Bismark
status: draft
updatedAt: 2026-11-21
---
## 研究问题与开发背景
Bismark 由 Felix Krueger 与 Simon Andrews 发表，针对亚硫酸氢盐测序中广泛的 C→T 转换提供比对和甲基化状态提取。其原始方法论文为 [Krueger 与 Andrews，2011](https://doi.org/10.1093/bioinformatics/btr167)。本条目描述软件方法；具体项目的实验、版本与参数需要独立记录。

## 核心原理
亚硫酸氢盐处理后未甲基化胞嘧啶通常在测序中表现为 T，而保留的 C 可以支持甲基化判断。Bismark 构建转换后的参考序列并处理测序 reads，调用受支持的比对器搜索候选位置，再结合原始序列与链方向推断胞嘧啶状态。参考中的重复和转换降低的序列复杂度都会影响唯一定位。普通亚硫酸氢盐测序不能单独区分 5mC 和 5hmC。

## 输入、输出与关键选项
输入一般为参考 FASTA 和亚硫酸氢盐处理文库的单端或双端 FASTQ；文库的方向性和端配对方式必须与实际制备一致。Bismark 可输出比对文件及报告；`bismark_methylation_extractor` 从比对提取逐位点甲基化信息，覆盖度或 cytosine report 等输出需按选项生成。分析需明确是否去除 PCR 重复、如何处理双端重叠、参考背景和坐标约定。选项随版本变化，应参考[官方使用文档](https://felixkrueger.github.io/Bismark/)和所用版本帮助，不套用未核验的参数。

## 植物应用与边界
Gardiner 等分析六倍体小麦不同亚基因组的 DNA 甲基化，采用亚硫酸氢盐处理及靶向基因富集；论文使用 Bismark 对扩展的捕获探针序列进行比对并提取甲基化状态，随后分析差异甲基化。[原始论文](https://doi.org/10.1186/s13059-015-0838-3)。该实验使用靶向富集，不能描述为对全基因组所有位置均匀覆盖的 WGBS。多倍体同源序列的比对归属是解释结果的重要条件。

## 版本、许可和上下游
官方仓库包含经典 Perl 版本及其他实现；具体版本、依赖及许可请查看[官方仓库](https://github.com/FelixKrueger/Bismark)。仓库文档所列经典版本 v0.25.1 需要比对器及 Samtools；此处是文档版本记录，本机未安装或运行。上游为文库构建与 FASTQ 质控，下游为覆盖过滤、CG/CHG/CHH 分类、差异甲基化和注释。教程与真实数据执行记录待补充。
