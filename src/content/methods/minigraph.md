---
title: Minigraph
name: Minigraph
summary: 以参考骨架引导组装序列逐步加入泛基因组图，并支持序列到图映射。
dataType: 参考基因组或 rGFA 图 / 单样本组装 FASTA
principle: 参考引导的序列到图映射与增量构图
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-01, m03-topic-03, m03-topic-04, m03-topic-05]
principleIds: [graph-genomics]
dataIds: [assembly, graph]
paper: minigraph-paper
repository: https://github.com/lh3/minigraph
status: draft
updatedAt: 2026-11-21
---
## 一句话简介与开发背景
Minigraph 是 Heng Li、Xiaowen Feng 和 Chong Chu 发布的序列到图比对器和泛基因组图生成器。方法论文发表于 2020 年《Genome Biology》；官方仓库截至 2026-11-21 列出 v0.21（r606），许可文件为 MIT。[方法论文](https://doi.org/10.1186/s13059-020-02168-z)、[官方仓库](https://github.com/lh3/minigraph)、[版本发布页](https://github.com/lh3/minigraph/releases)、[许可证](https://github.com/lh3/minigraph/blob/master/LICENSE.txt)。

## 解决的问题与算法原理
线性参考无法直接保存其他样本中较长的插入、缺失或替代路径。Minigraph 采用 minimap2 风格的种子、链式连接与序列到图定位，将查询组装映射到当前参考或图；增量构图时，把符合流程条件、未由现有图路径表示的查询序列片段加入图中，并保留样本路径信息。参考骨架使坐标和样本集成较易管理，同时会把构图过程锚定在所选参考上。

图可以看作一组带序列的片段节点、连接关系和样本路径。构图后，bubble 常用于描述参考路径之间的替代结构；bubble 内所有数学上可走通的路径不一定都存在于输入样本中，解释变异时需要读取样本路径及原始组装证据。

## 软件流程与适用边界
典型流程包括：准备一套参考组装或已有图；按样本逐份提供完整组装 FASTA；运行增量构图并记录版本、顺序和命令；提取每个输入样本的路径或 bubble call；再做图完整性、路径恢复和下游评价。官方文档明确将输入描述为单个体的全基因组组装；将 reads 或多个个体混在同一个 FASTA 作为一次样本输入会违背其 1:1 对应假设。[官方使用说明](https://github.com/lh3/minigraph#graph-generation)。

## 输入、输出与示例命令
输入为 reference FASTA / rGFA，以及逐样本的组装 FASTA。官方教程的最小示例为：

```bash
minigraph -cxggs -t16 ref.fa sample1.fa sample2.fa > pangenome.gfa
minigraph -cxlr pangenome.gfa query.fa > query.gaf
minigraph -cxasm --call -t16 pangenome.gfa sample1.fa > sample1.bed
gfatools bubble pangenome.gfa > bubbles.bed
```

第一条命令依次把样本组装加入图；第二条将序列映射到图，输出 GAF；第三条为 assembly 生成 bubble 路径调用的 BED 类结果；第四条提取 bubble 描述。`-x` 的预设、`-c`、`-t` 与 `--call` 的语义需以所安装版本的帮助信息核对。该命令摘自官方 README 说明，不代表本项目已在本地执行。[官方 README](https://github.com/lh3/minigraph#readme)。

输出 GFA/rGFA 描述图结构和参考路径，GAF 表示图上比对，bubble/BED 类输出报告图中的候选变异位置、路径与长度。坐标、参考路径及样本名要和输入清单一起归档。图中可遍历的组合路径不应全部当作观察到的单倍型。

## 与 Minigraph-Cactus、PGGB 的区别
独立 Minigraph 以参考路径为骨架，侧重较高效地逐步纳入组装及表示较大结构变异；Minigraph-Cactus 在 minigraph 构图基础上继续使用 Cactus 进行序列级比对和图整理；PGGB 从序列全对全比对诱导图，不将单一参考作为所有输入之间关系的唯一骨架。三者的输出分辨率、参考偏倚、资源需求与下游适配须在同一批组装、明确参数下比较。

## 植物研究案例
Kopalli 等 2025 年的作物图基准使用 Minigraph 0.21、PGGB 0.5.4 和 Minigraph-Cactus 2.7.2，比较六份真实高粱组装及模拟组装。真实高粱设置中的 Minigraph、PGGB 与 Minigraph-Cactus 图大小约为 0.92、4.7 和 4.2 Gb；Minigraph 仅纳入大于 50 bp 的变异，而 PGGB 与 Minigraph-Cactus 未采用同一长度过滤，因此图大小不能单独解释为准确度差异。

该研究分别用模拟 reads 和公开 paired-end reads 评估映射。模拟读段由相应泛基因组图生成，使用 VG Giraffe 映射到 Minigraph 或 Minigraph-Cactus 图，并与 Minimap2 线性参考映射比较；真实 paired-end reads 也进行了图和线性参考映射。PGGB 图因索引生成所需计算和内存未纳入映射评估。因此，这篇论文提供了真实样本 reads 的映射结果，但图映射比较不涵盖 PGGB；模拟数据的已知真值结果与真实 reads 指标也应分开理解。[高粱及作物基准原文](https://doi.org/10.1093/gigascience/giaf121)。

Kang 等拟南芥泛基因组研究也报告使用独立 Minigraph 构图，并分别使用 OrthoFinder 和 IQ-TREE 分析基因家族和系统关系；这项植物应用不能归入 Minigraph-Cactus。[论文原文](https://doi.org/10.1038/s41467-023-42029-4)。

## 质量检查、教程和关联资源
至少检查：每个输入样本是否有且仅有预期路径；抽取路径与原 FASTA 的长度、序列和方向是否一致；参考骨架中新增片段和 bubble 是否有组装支持；图构建前后的样本列表、过滤规则和软件版本是否可复现。Minigraph 是图构建与序列到图映射工具，不代替 Hi-C 染色体挂载、基于读段的独立 SV 验证或统计关联分析。

本项目当前没有 Minigraph 实跑教程；官方 README 提供的示例命令可作为学习入口。相关专题为[图泛基因组构建](../topics/pangenomics-structural-variation/m03-topic-05/)；关联论文包括[Minigraph 方法论文](../papers/minigraph-paper/)、[拟南芥泛基因组应用](../papers/arabidopsis-adaptation/)和[作物图构建基准](../papers/sorghum-graph-benchmark/)。

## 来源快照
2026-11-21 核对官方 v0.21（r606）发布页与仓库 MIT 许可证。未在当前工作站安装或运行 Minigraph；上述流程和命令依据官方 README，植物应用细节依据对应论文。
