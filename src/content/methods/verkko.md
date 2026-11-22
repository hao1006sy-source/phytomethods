---
title: Verkko
name: Verkko
summary: 整合高准确度与超长读长进行二倍体基因组组装。
dataType: HiFi / ONT
principle: 多数据组装图
domainIds: [genome-assembly]
topicIds: [assembly-basics, assembly-graphs, complete-assembly, haplotype-resolution, sequencing-data]
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

## 一句话简介及开发背景
Verkko 是面向高质量二倍体基因组组装的混合长读段流程，将 HiFi 的碱基精度与 ONT 超长 reads 的跨越能力用于连续染色体及 T2T 路径解析。原始方法论文首先以人类样本展示完整组装，不应据此宣称其原论文验证了植物 T2T。

## 核心计算步骤
其流程先使用 HiFi reads 生成高准确度的 unitig/多重 de Bruijn 图；再借助 ONT ultralong reads 将图中无法仅凭 HiFi 确定的连接联系起来；图解算阶段逐步处理复杂重复路径，形成染色体候选路径和共识。软件将 Canu、MBG、GraphAligner 等组件纳入流水线，具体阶段与依赖版本随 Verkko release 更新。超长 reads 提供的是跨越关系，不自动解决所有复杂重复，且其错误特征需要由高准确度 reads 约束。

## 输入与参数
常用入口通过 `verkko -d run_dir --hifi hifi.fastq.gz --nano ont_ul.fastq.gz` 指定 HiFi 与 ONT 数据；版本文档还说明仅 HiFi 模式及额外 trio/Hi-C 数据模式。运行前检查数据来自同一样本、ONT 文件确实为目标长度分布的超长 reads、文件未截断，并记录线程、内存、临时空间和容器/环境依赖。参数名称和资源建议必须按所用 release 文档及 `verkko --help` 核对。

## 主要输出
`assembly.fasta` 是最终候选序列；`assembly.homopolymer-compressed.gfa` 是同聚物压缩图；`assembly.scfmap` 提供压缩图节点与最终 scaffold 序列的映射。相位数据可产生额外的单倍型 FASTA 和路径信息。还应保存工作目录中的中间图、路径、对齐和日志，便于定位未解重复及组装断点。请勿只保留最终 FASTA。

## 与 Hifiasm 的方法差异
Hifiasm 的中心构件是 HiFi 的相位感知重叠图；Verkko 的中心构件是 HiFi multiplex de Bruijn 图，再由超长 reads 帮助求解连接。两者输入互补性、图表示、外部组件和输出组织均不同。目标是高连续度 T2T 时，Verkko 的超长读段连接是重要设计；重点为 HiFi 的相位感知组装时，Hifiasm 有直接的图策略。实际选型仍需用同一材料评估准确性、连续性和相位，而不能由算法名称判定优劣。

## 植物案例与范围
黄花木（*Xanthoceras sorbifolium*）数据论文报告了两个单倍型组装，并说明 Verkko 组装结果参与辅助缺口闭合，同时结合 Hifiasm 与 HiFi 数据。该案例证明软件可进入植物组装流程，论文所述的具体闭合步骤和最终组装不能归因于 Verkko 单独完成。[Scientific Data 原文](https://doi.org/10.1038/s41597-025-05057-x)。
