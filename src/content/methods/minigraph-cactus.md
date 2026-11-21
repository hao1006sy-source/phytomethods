---
title: Minigraph-Cactus
name: Minigraph-Cactus
summary: 结合组装比对与碱基级对齐构建泛基因组图。
dataType: 多个组装 FASTA
principle: 泛基因组图构建
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-01, m03-topic-03, m03-topic-04, m03-topic-05]
principleIds: [graph-genomics]
dataIds: [assembly]
paper: minigraph-cactus-paper
repository: https://github.com/ComparativeGenomicsToolkit/cactus
status: draft
updatedAt: 2026-11-21
---
## 研究问题与原理
Minigraph-Cactus 是从多个组装构建序列图的流程。它结合 minigraph 的组装到图映射与 Cactus 的碱基级比对，将不同样本的序列及其关系组织为图，并对接下游图工具。输入质量与参考选择会影响最终结果。

## 输入、输出与适用范围
输入为多套经过质量检查的组装 FASTA，以及逐行记录样本名和 FASTA 路径的 seqfile；命令还需要 Toil jobStore、输出目录、参考样本名和运行配置。参考组装宜达到染色体级；参考片段命名、样本命名、FASTA 路径及序列版本需要与下游坐标映射一致。`cactus-pangenome` 先用 Minigraph 构建结构变异图并将组装映射到图，再按参考染色体分区、对同源区块执行 Cactus 序列级比对，最后根据请求整理图、投影路径并建立下游格式或索引。[官方泛基因组流程](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/doc/pangenome.md)。

官方命令的通用形式如下。这里的 `jobStore` 是 Toil 工作流存储，`genomes.tsv` 是样本名与 FASTA 路径清单；命令为文档模板，不代表本机运行记录。

```bash
cactus-pangenome ./jobStore genomes.tsv --reference REF --outDir ./pangenome-out --outName plant-panel --gbz --giraffe --vcf
```

| 参数或输出 | 含义 |
| --- | --- |
| `--reference` | 指定参考样本；参考路径决定参考坐标投影及部分拆分方式。 |
| `--outDir`、`--outName` | 设置结果目录和文件名前缀。 |
| `--gfa` | 输出图的 GFA 表示；GFA 1.1 使用 Walks 表示样本路径。 |
| `--gbz` | 输出适合保留大量路径的压缩图格式；vg 可读取，亦是 Giraffe 的图输入。 |
| `--giraffe` | 建立 Giraffe 短读段图映射索引；长读段模式使用 `--lrGiraffe` 建立相应 minimizer 索引。 |
| `--vcf` | 导出基于参考路径的变异表示；嵌套记录及 vcfbub 处理方式需结合输出文件和选项解释。 |
| `--clip`、`--filter` | 控制图剪切及等位频率过滤；参数改变图中保留的序列和稀有路径。 |

常见结果包括 Minigraph 中间图 `.sv.gfa.gz`、整理后的 `.gfa.gz`、按要求生成的 `.gbz` 与 Giraffe 索引（如 `.dist`、`.min`）、VCF 文件，以及 `.stats/` 目录中的图统计、路径统计和序列裁剪报告。`.sv.gfa.gz` 保留 Minigraph 阶段的结构变异图；最终图则在 Cactus 后续比对与整理步骤完成后写出并携带相应样本路径。输出以请求的格式、图阶段和软件版本为准；Cactus 默认只产生 GFA 类型输出，其他格式须显式请求。对裁剪报告应逐样本核对输入碱基在 full、clip、filter 图中的保留量及丢失原因。[官方输出说明](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/doc/pangenome.md#output)。

正式分析前应核对 genomes 清单的样本名、序列命名和参考路径，保存完整配置、日志、调度资源、容器和输入校验和。大型植物数据需按组装数、序列重复、倍性和染色体组织规划内存、CPU、临时盘和任务分区；本机未运行 Cactus，本文不提供已验证资源估算。

## 论文与对比
[原论文](https://doi.org/10.1038/s41587-023-01793-w)以人类和果蝇数据展示方法；它与 PGGB 的输入组织和图构建过程不同，比较应基于相同输入及下游任务。植物应用案例见下节。

## 已核实的植物案例
Kopalli 等将 Minigraph-Cactus 应用于高粱染色体组装，和其他图构建方法比较，并报告图比对评估结果。[GigaScience 原文](https://doi.org/10.1093/gigascience/giaf121)。研究采用的工具版本和具体参数见原文方法部分。

## 流程及参数含义
主要运行选项与数据输出见上表。`--maxCores`、`--mapCores`、`--alignCores`、`--indexCores`、`--batchSystem` 等参数管理工作流并行资源和调度器；大型植物项目应以组装数量、片段数、重复含量、参考染色体组织、临时空间和集群调度策略制定资源方案。官方流程说明参考染色体拆分会过滤跨染色体分配不明确的 contig，`--noSplit` 可以改变该步骤，同时提高后续内存需求。每次分析需固定 Cactus 版本、镜像或二进制、seqfile、XML 配置、命令、输入校验和、jobStore 与日志。[官方命令与流程文档](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/doc/pangenome.md)。

## 许可、版本与方法差异
2026-11-21 查看 Cactus 官方发布页，记录版本为 v4.0.0（2026-11-09 发布）。该版本说明包括输出可复现性改进、`--validate` 输出校验及多项 Minigraph-Cactus 默认值变化；使用 v4.0.0 时需按新版本默认配置重新审阅旧 XML 配置。主仓库 `LICENSE.txt` 为 MIT 许可文本，同时排除 `externalTools` 子目录中的部分文件；容器内外部程序和独立下载的软件应分别核对其许可。[发布页](https://github.com/ComparativeGenomicsToolkit/cactus/releases)、[v4.0.0 发布说明](https://github.com/ComparativeGenomicsToolkit/cactus/releases/tag/v4.0.0)、[主仓库许可证及排除说明](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/LICENSE.txt)。本机未安装运行该版本。

Minigraph-Cactus 使用 minigraph 引导图构建与分区，再通过 Cactus 对齐整理；独立 Minigraph 的重点是参考骨架上的增量构图；PGGB 则对输入组装执行全对全比对、图诱导与逐步规范化。三者在参考依赖、可表示的变异尺度、计算资源和数据流上不同。植物图基准需在相同样本集合下比较，并对变异阈值、参考、组件版本、路径恢复、基因和 k-mer 覆盖及下游分析分别报告。[高粱基准](https://doi.org/10.1093/gigascience/giaf121)。
