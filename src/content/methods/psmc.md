---
title: PSMC
name: PSMC
summary: 从一个二倍体全基因组序列中的杂合位点分布，估计局部共祖时间与历史有效群体大小。
dataType: 二倍体共识序列、PSMCFA 与可调用区域
principle: 成对顺序马尔可夫共祖隐马尔可夫模型
domainIds: [population-genetics]
topicIds: [m05-topic-06]
principleIds: [sequentially-markovian-coalescent, coalescent-hidden-markov-model]
dataIds: [diploid-consensus-sequence, callable-region-mask]
paper: psmc-paper
repository: https://github.com/lh3/psmc
status: draft
updatedAt: 2026-11-21
---

## 一句话简介与开发背景

PSMC（Pairwise Sequentially Markovian Coalescent）是 Li 与 Durbin 提出的成对顺序马尔可夫共祖模型及软件实现，可由单个二倍体个体的全基因组序列推断共祖历史和历史有效群体大小。[原始方法论文](../../papers/psmc-paper/)；[官方代码与 README](https://github.com/lh3/psmc)。

## 生物学问题与统计原理

一个二倍体样本的两条同源染色体沿基因组具有不同局部共同祖先时间。局部杂合率是 TMRCA 的观测线索，重组事件则使局部共祖状态沿染色体改变。PSMC 以离散时间间隔表示 TMRCA 隐状态，并用隐马尔可夫模型组合杂合位点发射概率与重组驱动的状态转移，估计各时间区间的人口规模参数。

模型估计的是在给定中性共祖和重组假设下的尺度化历史，而非人口普查数量。群体结构、迁移、自交、选择、基因组可调用性和重组率差异都可能改变曲线。PSMC 使用一个个体时，样本个体间历史差异也无法直接从单条曲线观察。

## 算法和实际运行流程

官方流程从经过质量过滤的二倍体共识序列开始。`fq2psmcfa` 将共识序列按固定长度窗口压缩成 PSMCFA 字符串，其中每个单元编码该区间是否包含杂合位点；随后 PSMC 拟合 TMRCA 时间分段及其人口规模参数。可用 `splitfa` 切分片段做区块 bootstrap，并用 `psmc_plot.pl` 依据每代突变率与世代时间绘图。[官方 README 与示例](https://github.com/lh3/psmc)。

```bash
# 从双倍体共识 FASTQ 生成 PSMCFA
utils/fq2psmcfa -q20 diploid.consensus.fq.gz > sample.psmcfa

# 官方 README 所示时间分段及迭代参数示例
psmc -N25 -t15 -r5 -p "4+25*2+4+6" -o sample.psmc sample.psmcfa

# 依据物种突变率和世代时间将尺度化结果画为历史曲线
utils/psmc_plot.pl -u 6.5e-9 -g 1 sample sample.psmc
```

README 中 `-p "4+25*2+4+6"` 的示例参数是模型时间分段设计，不是适用于所有植物的默认最佳值；手册建议结合模型拟合与可识别区间检查。`-q` 控制 `fq2psmcfa` 的碱基质量过滤；低、高深度阈值需要按覆盖度分布设置。请记录 PSMC 仓库 commit，因为仓库不一定对应带语义版本号的发布包。

## 输入、输出与质量检查

| 文件或参数 | 内容与检查项 |
| --- | --- |
| 共识 FASTQ/FASTA | 每个位点按目标个体二倍体基因型表示；检查深度、碱基质量、缺失和污染 |
| PSMCFA | `fq2psmcfa` 生成的压缩序列，默认每单元表示 100 bp 区间；运行前检查有效序列长度与杂合比例 |
| `-N`、`-t`、`-r`、`-p` | 迭代次数、最大共祖时间尺度、重组/突变参数范围及时间区间分段；参数要与数据规模匹配 |
| `.psmc` | 含估计参数和时间区间信息的模型输出；保留完整运行日志 |
| `psmc_plot.pl` 图 | 使用 `-u` 每代突变率和 `-g` 每代年数换算横纵坐标；报告取值来源及不确定范围 |
| bootstrap 输出 | 基于切分基因组片段重复拟合，用于显示区段重采样造成的曲线波动 |

重测序深度偏低、错误的参考比对或不可调用区段可能把真实杂合位点变成纯合调用，改变 PSMCFA 的状态序列。应保留可调用区域和共识生成规则，并检查不同深度/重复序列掩蔽策略下的变化。

## 植物应用

Cubry 等对非洲栽培稻与其野生祖先研究中，使用 PSMC 分析由 16 条单倍型组合得到的 8 个伪二倍体样本，并将多份独立 PSMC 结果按论文设定汇总。作者明确考虑水稻自交背景，伪二倍体组成方式属于该研究的设计。[案例论文](../../papers/african-rice-246-genomes/)。胡杨研究使用 PSMC 比较四个遗传支系的有效群体大小历史，并用 fastsimcoal26 分析支系间人口模型；后者的迁移率估计来自另一个模型，不是 PSMC 输出。[案例论文](../../papers/populus-euphratica-demography/)。

## 方法论文、教程与关联资源

- 方法论文：[Inference of human population history from individual whole-genome sequences](../../papers/psmc-paper/)，Nature 475:493–496，2011，DOI `10.1038/nature10231`。
- 植物案例：[非洲稻 246 份基因组研究](../../papers/african-rice-246-genomes/)；[胡杨重测序研究](../../papers/populus-euphratica-demography/)；[杨树重复序列敏感性研究](../../papers/populus-repeats-demography/)。
- 官方仓库：[lh3/psmc](https://github.com/lh3/psmc)。本地未以真实植物数据执行本页面示例；命令按官方 README 核对。
- 相关专题：[群体历史动态](../../topics/population-genetics/m05-topic-06/)。相关方法：[MSMC2](../msmc2/)与[SMC++](../smcpp/)。
