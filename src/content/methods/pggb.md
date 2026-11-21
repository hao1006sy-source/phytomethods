---
title: PGGB
name: PGGB
summary: 基于全对全序列比对构建泛基因组变异图。
dataType: 多样本序列 FASTA
principle: 全对全比对与图规范化
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-05]
principleIds: [graph-genomics]
dataIds: [assembly]
paper: pggb-paper
repository: https://github.com/pangenome/pggb
status: draft
updatedAt: 2026-11-20
---
## 研究问题与流程
PGGB 从输入序列间的全对全比对构建泛基因组图。官方说明中，流程包括 wfmash 比对、seqwish 图诱导与图规范化，最后可输出 GFA 图与诊断可视化。图内容受输入序列和过滤设置约束。

## 输入输出与参数
输入为一个包含多份样本或单倍型序列的 FASTA，可选 bgzip 压缩；官方建议使用 samtools 建立 `.fai` 索引并使用 PanSN 命名模式标明样本、haplotype 和 contig。若输入完整基因组，可按染色体群落拆分后分别构图。官方 quick start 的参数示例为 `-i in.fa -o output -n 9 -t 16 -p 90 -s 5k`：`-n` 是单倍型数量，`-p` 是片段比对的最小平均核苷酸一致性，`-s` 是图 scaffold 所用的片段长度，`-t` 为线程数。实际阈值须依据物种分化、同源重复和研究尺度选择，不能把示例值视为适用于所有植物的默认参数。[官方 quick start](https://github.com/pangenome/pggb#quick-start)。

标准输出为 GFAv1 图，可进入 vg 或 ODGI 等兼容图工具；流程也会写出中间对齐/图文件、统计和诊断可视化。加入参考路径和 `-V` 设置时，可按指定上限输出 VCF 表示。具体输出名由版本及输入前缀决定，需保留 `pggb`、wfmash、seqwish、smoothxg、gfaffix 和 ODGI 的版本以及所有运行日志。PGGB 主仓库为 MIT 许可；容器依赖及各组件应分别核实许可。[官方仓库和流程说明](https://github.com/pangenome/pggb)。

## 方法论文与植物应用
[PGGB 论文](https://doi.org/10.1038/s41592-024-02430-3)介绍该方法。植物基因组中的重复和多倍性增加比对和计算复杂度；具体植物案例需单独核对论文方法，不根据其他研究的泛基因组概念推断使用了 PGGB。

## 已核实的植物案例
Kopalli 等在高粱染色体数据中以 PGGB 构图，与 Minigraph-Cactus 和 Minigraph 进行比较，并报告各方法和评估参数；结果应按论文所用输入与评价指标理解。[GigaScience 原文](https://doi.org/10.1093/gigascience/giaf121)。

## 软件来源与计算阶段
PGGB 官方仓库采用 MIT 许可证；运行时应记录 PGGB 及各组成工具的实际版本。该流程使用 wfmash 建立序列间比对，以 seqwish 从比对诱导图，再通过图规范化和排序改善结构表达；具体子工具和默认值随版本演进。输入中每条序列的样本、单倍型及染色体标识应可追溯，避免把不同拷贝混成同一条路径。[官方仓库](https://github.com/pangenome/pggb)。

## 适用范围与下游
全对全策略可比较多套组装，不依赖单一骨架作为全部比对的起点；这不保证图对每份材料都无偏。输入组装缺失、比对阈值及重复序列仍影响图结构。输出 GFA 可用于兼容的图统计、路径检查和可视化，具体转换应先检查图格式版本与路径名称；可用 ODGI 做图处理，用支持该图格式的工具进行下游分析。

### 图结果的实际检查
对每个 PanSN 路径核对样本名与倍性；抽取图中路径，与原始输入序列比较长度、序列和方向；检查重复区是否把旁系拷贝混合；检查构图后未能路径化的输入片段；再用独立 k-mer、BUSCO 或下游 mapping/genotyping 指标评估图在目标任务上的表现。单看 GFA 节点和边的数量、VCF 记录数或视图密度不能替代正确性验证。


## 官方发布版本记录
2026-11-21 查看[官方发布页](https://github.com/pangenome/pggb/releases)，页面列出 v0.7.4。这是一项来源快照，软件更新后应重新核对；本机并未安装和运行该版本。
