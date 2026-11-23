---
title: MSMC
name: MSMC
summary: 经典多序列顺序马尔可夫共祖模型，联合分析多个单倍型推断历史有效群体大小和群体分化时间。
dataType: 多样本 VCF、全基因组高置信度位点相位信息、可调用区域 mask 与 multihetsep
principle: 多序列顺序马尔可夫共祖隐马尔可夫模型（联合拟合多条单倍型共祖状态）
domainIds: [population-genetics]
topicIds: [m05-topic-06]
principleIds: [sequentially-markovian-coalescent, coalescent-hidden-markov-model]
dataIds: [variant-data, phased-haplotype-data, callable-region-mask]
paper: msmc-paper
repository: https://github.com/stschiff/msmc
status: published
updatedAt: 2026-11-23
---

## 一句话简介与开发背景

MSMC（Multiple Sequentially Markovian Coalescent，第 1 版）是由 Stephan Schiffels 与 Richard Durbin 于 2014 年发表的群体历史推断方法。相较于仅能分析单个个体（2 条单倍型）的 PSMC，MSMC 突破性地将顺序马尔可夫共祖框架扩展到 4 至 8 条已定相单倍型，不仅显著将有效群体大小估计的时间分辨率推向更近的时代，而且首创了相对跨群体共祖率（relative cross-coalescence rate）方法来量化群体分离过程。[奠基论文](../../papers/msmc-paper/)；[官方软件仓库](https://github.com/stschiff/msmc)。

## 研究问题与算法原理

MSMC 以沿染色体变化的最近共同祖先时间（TMRCA）或首次共祖事件时间作为隐状态，通过隐马尔可夫模型联合推断多条单倍型在历史各时期的共祖速率：

1. **多单倍型联合隐状态**：MSMC v1 在 C 语言框架中直接建模 $k$ 条单倍型首次发生共祖事件的时间分布。当分析 4 条或 8 条单倍型时，早期发生共祖事件的概率大幅增加，从而使模型对距今较近时期的群体动态推断能力远超 PSMC。
2. **群体分离历史推断**：通过从两个群体中分别抽取单倍型，计算跨群体首次共祖速率与群体内共祖速率的比值，构建相对跨群体共祖率曲线，直观反映两群体逐渐隔离直至完全分化的连续历程。
3. **计算复杂度与局限**：MSMC v1 采用联合隐状态转移矩阵，计算复杂度随单倍型数量呈指数级上升，通常实际受限于 8 条单倍型以内；后续重构的 MSMC2 则改用成对复合似然法解决了这一瓶颈。

## 数据准备和计算步骤

1. 获得各个样本的全基因组高深度比对结果（BAM/CRAM），生成高质量变异位点（VCF）和严格的测序深度覆盖掩蔽区间（mask BED）。
2. 对多样本变异位点进行精确染色体级别定相（Phasing），定相质量对近现代共祖时间推断至关重要。
3. 使用 `msmc-tools` 中的脚本将多样本 phased VCF 与各样本 mask 合并，输出专用的 `multihetsep.txt` 文件。
4. 调用 `msmc` 核心程序，指定时间分段模式 `-p`、固定重组与突变率比值 `-R` 等参数运行最大似然估计。
5. 结合物种准确的世代时间（generation time）与每代每位点自发突变率（mutation rate），将输出转换为实际年份和有效群体规模 $N_e$。

```bash
# MSMC v1 典型运行命令（以 4 条单倍型联合分析为例）
# 输入文件由 msmc-tools 生成的 multihetsep 文件组成
msmc -t 8 -p "1*2+15*1+1*2" -R \
  -o species_pop1_4hap \
  chr01.multihetsep.txt chr02.multihetsep.txt chr03.multihetsep.txt
```

## 输入、输出和关键参数

| 项目 | 作用与注意事项 |
| --- | --- |
| multihetsep | `msmc-tools` 输出的各染色体输入文件，记录杂合位点在多条单倍型间的相位分布与物理距离 |
| `-p` | 控制历史时间分段（pattern），定义参数自由度；例如 `1*2+15*1+1*2` 规定各时间步长的参数绑定模式 |
| `-R` | 在 MSMC v1 中推荐指定，用于固定重组率与突变率的比值（默认为 1.0），可显著提高估计稳定性 |
| `-t` | 多线程并行计算核心数 |
| 输出 `.loop.txt` | 包含 EM 算法迭代过程及各时间分段下估计的共祖速率和时间尺度化参数 |

## 植物案例与实现边界

在植物演化基因组学中，MSMC v1 被广泛用于解析作物驯化历史与野生祖先分化。例如在非洲栽培稻与野生稻群体演化研究中（Cubry et al., 2018），研究人员针对自交物种特点，将纯合个体的单倍型组合分析，使用 MSMC（v1.1.0）联合拟合 4 条单倍型推断了非洲栽培稻 (*Oryza glaberrima*) 与其野生祖先 (*Oryza barthii*) 在距今约 1 万年前后的分化动力学与历史瓶颈。[非洲稻案例](../../papers/african-rice-246-genomes/)。

在植物应用中需注意：自交物种的极高纯合度会使得常规杂合位点密度较低，通常需通过多材料单倍型合并或专门的伪二倍体策略构造分析单元；古多倍化残余与重复序列掩蔽不充分可能产生伪杂合信号，从而扭曲远古时期的共祖率估计。

## 方法论文、教程与相关工具

- 奠基论文：[Inferring human population size and separation history from multiple genome sequences](../../papers/msmc-paper/)，*Nature Genetics* 46:919–925 (2014)，DOI `10.1038/ng.3015`。
- 官方仓库：[stschiff/msmc](https://github.com/stschiff/msmc)；格式转换工具：[stschiff/msmc-tools](https://github.com/stschiff/msmc-tools)。
- 升级方法：[MSMC2](../msmc2/)（重构为成对复合似然模型，支持更多样本与跨群体深入比较）。
- 互补方法：[PSMC](../psmc/)（单样本全基因组共祖推断）与 [SMC++](../smcpp/)（结合未定相大样本与定相单倍型谱系分析）。
- 相关研究专题：[群体历史动态](../../topics/population-genetics/m05-topic-06/)。
