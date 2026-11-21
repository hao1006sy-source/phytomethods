---
title: Minigraph-Cactus
name: Minigraph-Cactus
summary: 结合组装比对与碱基级对齐构建泛基因组图。
dataType: 多个组装 FASTA
principle: 泛基因组图构建
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-05]
principleIds: [graph-genomics]
dataIds: [assembly]
paper: minigraph-cactus-paper
repository: https://github.com/ComparativeGenomicsToolkit/cactus
status: draft
updatedAt: 2026-11-20
---
## 研究问题与原理
Minigraph-Cactus 是从多个组装构建序列图的流程。它结合 minigraph 的组装到图映射与 Cactus 的碱基级比对，将不同样本的序列及其关系组织为图，并对接下游图工具。输入质量与参考选择会影响最终结果。

## 输入、输出与适用范围
输入为多套经质量控制的组装、包含样本名和 FASTA 路径的 genomes 清单，以及参考样本和运行配置。官方 `cactus-pangenome` 工作流先运行 minigraph 进行 assembly-to-graph 映射与分区，再在同源区块上运行 Cactus 进行碱基级多序列比对和图整合。可选输出包括参考路径投影、GFA/GBZ 等图或 vg 支持的索引工件；具体文件由工作流选项和版本决定。[官方泛基因组流程](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/doc/pangenome.md)。

正式分析前应核对 genomes 清单的样本名、序列命名和参考路径，保存完整配置、日志、调度资源、容器和输入校验和。大型植物数据需按组装数、序列重复、倍性和染色体组织规划内存、CPU、临时盘和任务分区；本机未运行 Cactus，本文不提供已验证资源估算。

## 论文与对比
[原论文](https://doi.org/10.1038/s41587-023-01793-w)以人类和果蝇数据展示方法；它与 PGGB 的输入组织和图构建过程不同，比较应基于相同输入及下游任务。植物应用案例见下节。

## 已核实的植物案例
Kopalli 等将 Minigraph-Cactus 应用于高粱染色体组装，和其他图构建方法比较，并报告图比对评估结果。[GigaScience 原文](https://doi.org/10.1093/gigascience/giaf121)。研究采用的工具版本和具体参数见原文方法部分。

## 流程及参数含义
命令入口为 `cactus-pangenome`，常见参数包括 `--reference` 指定参考样本、`--outDir` 和 `--outName` 管理结果目录和名称；`--gfa`、`--gbz` 等开关按版本请求图格式。运行流程会产生工作流中间文件、图结构及下游索引所需数据；发布前应从目标 release 的帮助和文档确认每个导出选项，避免把某一版本生成的文件列表当作跨版本固定接口。图裁剪、参考路径选择和过滤都会影响下游可见内容。[命令文档](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/doc/pangenome.md)。

## 许可、版本与方法差异
2026-11-21 查看 Cactus 官方发布页记录为 v4.0.0。主仓库 `LICENSE.txt` 是 MIT 风格许可，同时明确排除 `externalTools` 中部分文件，因此该声明不能直接替代对子模块、容器内外部软件和下载二进制工具的许可核查。[发布页](https://github.com/ComparativeGenomicsToolkit/cactus/releases)、[主仓库许可证及排除说明](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/LICENSE.txt)。本机未安装运行该版本。

Minigraph-Cactus 使用 minigraph 引导图构建与分区，再通过 Cactus 对齐整理；独立 Minigraph 的重点是参考骨架上的增量构图；PGGB 则对输入组装执行全对全比对、图诱导与逐步规范化。三者在参考依赖、可表示的变异尺度、计算资源和数据流上不同。植物图基准需在相同样本集合下比较，并对变异阈值、参考、组件版本、路径恢复、基因和 k-mer 覆盖及下游分析分别报告。[高粱基准](https://doi.org/10.1093/gigascience/giaf121)。


## 官方发布版本记录
2026-11-21 查看[官方发布页](https://github.com/ComparativeGenomicsToolkit/cactus/releases)，页面列出 Cactus v4.0.0。这是一项来源快照，软件更新后应重新核对；本机并未安装和运行该版本。
