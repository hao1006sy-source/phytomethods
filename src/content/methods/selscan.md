---
title: selscan
name: selscan
summary: 计算 EHH、iHS、XP-EHH、nSL 等基于延伸单倍型纯合性的选择扫描统计量。
dataType: 已定相的单倍型基因型、变异坐标与遗传图谱
principle: 延伸单倍型纯合性与群体间积分比较
domainIds: [population-genetics]
topicIds: [m05-topic-05]
principleIds: [extended-haplotype-homozygosity]
dataIds: [phased-haplotype-data, variant-data]
paper: selscan-paper
repository: https://github.com/szpiech/selscan
status: draft
updatedAt: 2026-11-21
---
## 一句话简介与开发背景

`selscan` 是用于计算基于延伸单倍型纯合性（extended haplotype homozygosity，EHH）选择统计量的多线程软件，包含 iHS、XP-EHH、nSL、XP-nSL、iHH12 等统计量；其中 XP-EHH 的统计思想先由 Sabeti 等提出，`selscan` 是一种软件实现。[软件论文](../../papers/selscan-paper/)；[XP-EHH 原始方法论文](../../papers/xpehh-paper/)；[官方代码及手册](https://github.com/szpiech/selscan)。

本轮核查时 GitHub 主分支 README 显示 `selscan v3.1.0`，并要求 C++17 编译器和 zlib；仓库对所列版本提供 Linux、macOS 与 Windows 预编译文件。版本号会变动，实际分析须保存发行版、commit 和完整命令。[官方安装说明与版本信息](https://github.com/szpiech/selscan)。

## 研究问题和统计原理

EHH 衡量携带某一核心等位基因的染色体在向两侧延伸时，仍共享相同单倍型的概率。正选择可使有利变异在重组充分打散周边连锁前迅速升频，因此某些高频核心等位基因周围会出现较长的同源单倍型。不同统计量使用的比较对象不同：iHS 比较同一群体内衍生与祖先核心等位基因的 EHH 积分；XP-EHH 分别在目标群体和参照群体计算 EHH 延伸曲线，再对两群体的积分值作对数比并按全基因组分布标准化。

XP-EHH 对已接近固定或在一群体中频率很高、而在另一群体中尚未同样固定的扫荡较敏感。结果符号依赖软件中目标与参照群体的输入顺序；解释方向前需确认运行参数和软件规范化后的定义。它不能单独确定受选择的因果位点，也不能给出精确选择开始时间。[Sabeti 等，2007](https://doi.org/10.1038/nature06250)；[软件论文](https://doi.org/10.1093/molbev/msu211)。

## 算法流程与计算边界

1. 准备质控后的双群体变异，并确保参考组装、位点集合、染色体顺序和等位基因编码协调。
2. 对 XP-EHH 准备经过定相的两群体单倍型；输入变异须满足当前 `selscan` 手册要求，当前仓库说明不接受缺失基因型。
3. 为每个核心位点向上下游遍历标记，分别累计两个群体的 EHH 衰减积分。
4. 计算成对群体的积分对数比，生成每个位点的原始 XP-EHH 值。
5. 使用仓库配套的 `norm` 程序按遗传距离或物理距离的窗口规范化，结合经验分布或人口史模拟设定候选阈值。

XP-EHH 的模型读数来自群体单倍型延伸差异；该统计量与 XP-CLR 的多位点等位基因频率复合似然并非同一种算法。基因型定相误差、样本数量不平衡、重组率差异、结构、缺失过滤及窗口标准化都会影响结果。植物自交带来的长 LD、群体繁殖方式和多倍体剂量编码都需要在方法适用性评估中单独处理。

## 输入、输出与示例命令

官方 README 给出的 XP-EHH 命令形式为：

```bash
selscan --xpehh \
  --vcf cultivated.phased.vcf \
  --vcf-ref wild.phased.vcf \
  --map rice.genetic.map \
  --out cultivated_vs_wild

selscan norm --xpehh \
  --files cultivated_vs_wild.xpehh.out \
  --out cultivated_vs_wild.norm
```

两个 VCF 表示待比较的样本集合；`--map` 提供变异遗传坐标所需信息，具体字段顺序按当前版本手册。当前版本读数以位点级统计输出，配套 `norm` 产出标准化值。后续区域聚合和候选阈值应另外记录，不能把窗口极值或经验分位点误称为软件默认显著性检验。

软件实现还支持 EHH、iHS、nSL、XP-nSL 和 iHH12 等统计量；具体某项统计对相位、遗传图谱或输入格式的要求可能不同。该软件页聚焦 XP-EHH 与清除扫描。本页命令依据官方 README 核对，PhytoMethods 没有在本机以真实植物定相数据运行过该流程。

## 植物研究案例

He 等比较韩国杂草稻与地方稻时，用 `selscan` 计算 XP-EHH 和 iHS，同时报告 XP-CLR、FST 与多样性降低等扫描。研究将不同统计量前 2.5%区域作为经验离群，并从多个方法共同支持的区域整理候选；这说明相同材料上不同统计量的候选数不同。[原始论文](https://doi.org/10.1111/pbi.12630)；[全文及软件方法](https://pmc.ncbi.nlm.nih.gov/articles/PMC5316921/)；[本站案例记录](../../papers/rice-weedy-selection/)。

Huang 等在 2012 年水稻驯化研究中另行测试 XP-EHH，使用的是其论文所述 `xpehh` 程序，而非 `selscan`。论文补充材料报告其结果对部分已知驯化基因的检出较弱，且 XP-EHH 信号没有进入后续主要分析。这是方法与数据结构匹配度需要评估的实例；不能由统计量名称推断软件实现。[论文方法说明](https://www.nature.com/articles/nature11532)；[补充材料](https://media.springernature.com/original/springer-static/esm/art%3A10.1038%2Fnature11532/MediaObjects/41586_2012_BFnature11532_MOESM59_ESM.pdf)。

## 相关方法与资源

XP-EHH 适于跨群体延伸单倍型比较；iHS 适于群体内区分同一核心位点两类等位基因的延伸差异；nSL 以单倍型共享位点数刻画延伸，不依赖遗传图谱时仍需谨慎评估物理距离代理。XP-CLR 依据频率差异与连锁相关构建另一类跨群体统计；SweepFinder2 使用单群体频率谱。

相关资源：[M05-05 选择性清除专题](../../topics/population-genetics/m05-topic-05/)、[XP-EHH 方法论文](../../papers/xpehh-paper/)、[selscan 软件论文](../../papers/selscan-paper/)、[XP-CLR](../xpclr/)、[SweepFinder2](../sweepfinder2/)。
