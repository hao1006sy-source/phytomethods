---
title: Verkko
name: Verkko
summary: 整合高准确度与超长读长进行二倍体基因组组装。
dataType: HiFi / ONT
principle: 多数据组装图
domainIds: [genome-assembly]
topicIds: [assembly-graphs, haplotype-resolution]
principleIds: [debruijn, phasing]
dataIds: [hifi, ont-ul]
paper: verkko
repository: https://github.com/marbl/verkko
updatedAt: 2026-11-20
---
## 研究问题与计算思路
Verkko 结合 PacBio HiFi 和 Oxford Nanopore 超长 reads 构造和解析组装图。高准确度序列帮助确定局部结构，超长 reads 可跨越部分重复区域。

## 输入输出
输入为 HiFi 和超长 reads；主要输出为组装序列和图相关文件。可用数据及计算资源影响可解析的重复区域。

## 植物研究相关性
植物基因组的长重复序列和高杂合度使超长 reads 有潜在价值。评估时应独立检查单倍型与重复区结构。

## 方法论文
[10.1038/s41587-023-01662-6](https://doi.org/10.1038/s41587-023-01662-6)；[软件与文档](https://github.com/marbl/verkko)。

## 算法流程与软件实现
Verkko 工作流先利用 Canu 对高准确度 reads 进行纠错，通过 MBG 构建多重 de Bruijn 图，再将 ONT 超长 reads 通过 GraphAligner 比对到图；它逐步利用 reads 解析图中的环和复杂连接，最后生成一致序列。`--hifi` 指定高准确度长 reads，`--nano` 指定 ONT 超长 reads；亲本 k-mer 或 Hi-C 数据可用于扩展相位。当前官方文档允许仅提供高准确度长 reads，超长 reads 提供额外跨越证据。

## 与 Hifiasm 的区别
Hifiasm 的核心是 HiFi reads 的相位感知重叠图；Verkko 使用多重 de Bruijn 图和逐步图解析，并结合超长 reads 跨越重复。比较时应记录软件版本、相位数据和计算资源；技术路线差异本身不足以决定哪个组装结果更准确。

## 输出与植物案例
默认结果包括 `assembly.fasta`、同聚物压缩空间中的 `assembly.homopolymer-compressed.gfa` 以及图节点与序列对应的 `assembly.scfmap`。相位数据可产生额外的单倍型 FASTA 和路径信息。[黄花木基因组研究](https://doi.org/10.1038/s41597-025-05057-x)使用 Verkko 组装结果辅助填补组装缺口；该论文方法部分也描述了 Hifiasm 和 HiFi reads 的使用。

[官方文档与参数](https://github.com/marbl/verkko)；[Verkko 原始方法论文](https://doi.org/10.1038/s41587-023-01662-6)。完成组装后可使用 Merqury 等工具评估。
