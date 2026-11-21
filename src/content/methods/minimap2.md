---
title: minimap2
name: minimap2
summary: 以 minimizer 种子、链化和局部碱基比对高效比对长序列、reads 与组装。
dataType: 长序列 FASTA/FASTQ；组装 FASTA；依预设支持短 reads 或转录本
principle: minimizer 索引与锚点链化
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-02]
principleIds: [alignment, minimizer]
dataIds: [assembly, dna-sequence, short-reads, hifi, ont-ul]
paper: minimap2-paper
repository: https://github.com/lh3/minimap2
status: draft
updatedAt: 2026-11-21
---
## 开发背景与问题
minimap2 是面向多类核苷酸序列比对的通用程序，支持长读段、短读段、RNA 序列及组装间比较。其价值在于通过稀疏种子与链化降低大序列空间搜索成本；输出需要按任务预设和下游分析解释。[原始方法论文](../../../papers/minimap2-paper/)。

## 核心算法
软件从参考及查询序列提取 minimizer，查找匹配锚点；再按坐标和方向将锚点组成链，并评估链得分。对相邻锚点之间的区段，算法执行动态规划碱基级延伸。链化阶段的启发式剪枝和 gap 代价有助于处理长插入/缺失；预设决定 minimizer、链化与比对行为。不同任务需选用对应模式，不能把读取长序列的 mapping 预设等同于 assembly-to-assembly 比对。[官方 README](https://github.com/lh3/minimap2)。

## 输入、输出与主要选项
输入可为 FASTA/FASTQ 序列；组装间比对常用 `minimap2 -cx asm5 ref.fa query.fa > aln.paf`，输出 PAF。`asm5` 是面向较近缘组装差异范围的预设之一，物种分化程度更高时应按官方文档选择其他组装预设并检查比对覆盖。`-a` 可请求 SAM 格式，`-x` 选择任务预设，`-t` 指定线程数。需记录序列方向、主/次比对、软剪切与下游格式转换。PAF 的坐标与映射质量字段不等同于核苷酸级别的变异真值。

## 植物应用边界
minimap2 可作为植物组装间比较和长读段映射的通用比对器；具体案例应以原论文方法段记录的软件版本、预设和数据类型为准。M03-02 中的植物案例展示其与 AnchorWave、SyRI 等工具的流程关系，未将人类/细菌 benchmark 当作植物验证。

## 相关资源
- 原始方法论文：[Li，2018](../../../papers/minimap2-paper/)
- 官方代码仓库：[lh3/minimap2](https://github.com/lh3/minimap2)
- 相关专题：[植物全基因组比对](../../../topics/pangenomics-structural-variation/m03-topic-02/)
