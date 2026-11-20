---
title: 测序技术与原始数据
summary: 理解测序数据、质量与组装需求。
domain: genome-assembly
methods: [hifiasm, verkko]
updatedAt: 2026-11-20
---
## 研究背景和生物学问题
基因组测序将 DNA 分子转化为有限长度的序列读段（reads）。组装需要判断这些带有测序误差的片段在原始基因组中的位置、重叠与单倍型来源。植物材料的重复比例、倍性和杂合度会影响数据需求。

## 测序技术与数据比较
| 技术 | 数据特点 | 组装中的作用 |
| --- | --- | --- |
| Illumina | 高通量短读段 | k-mer 质量评估与短变异分析 |
| PacBio HiFi | 高准确度长读段 | 重叠检测、局部一致序列与相位 |
| ONT | 长读段，可获得超长分子 | 跨越较长重复与复杂区域 |

读长、准确率和产量随文库、仪器、化学及处理流程变化，选型需记录实际批次指标。

## 重要概念与质量控制
测序深度的粗略估计为测序总碱基数除以单倍体基因组大小；多倍体与杂合组装还应明确分母和预期拷贝数。Phred 质量值 $Q=-10\log_{10}(p)$，其中 $p$ 是该碱基出错概率的估计值。FASTQ 每条记录包括以 `@` 开头的名称行、序列行、`+` 分隔行和与序列等长的质量字符行。质量值编码、接头、read 长度分布、污染和覆盖度均需检查。

## 计算流程与方法比较
先核对样本来源、倍性和 DNA 片段长度，再检查文件完整性、read 数量及质量分布；依据目标准备 HiFi、ONT 或独立短读段。HiFi reads 可供 Hifiasm 构建相位感知图；Verkko 可结合高准确度 reads 与超长数据；高准确度 reads 还可用于 Merqury 评估。低覆盖区域会限制图连接，污染可能产生外源 contig。

## 植物案例和延伸阅读
[Macadamia jansenii 研究](https://doi.org/10.1111/tpj.15583)使用 HiFi reads 和 Hifiasm 进行植物基因组组装。[Hifiasm 官方文档](https://github.com/chhylp123/hifiasm)与 [Verkko 官方文档](https://github.com/marbl/verkko)列出输入要求。
