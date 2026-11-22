---
title: "De novo chromosome level assembly of a plant genome from long read sequence data"
summary: "使用 HiFi reads 和 Hifiasm 构建 Macadamia jansenii 基因组组装。"
authors: "Sharma P et al."
year: 2022
journal: The Plant Journal
doi: 10.1111/tpj.15583
type: application
method: hifiasm
methodIds: [hifiasm]
domainIds: [genome-assembly]
speciesIds: [macadamia]
updatedAt: 2026-11-20
---
## 研究解读
该研究利用长读长数据组装 Macadamia jansenii 基因组。论文方法部分报告使用 Hifiasm 处理 HiFi reads，结合额外数据构建染色体级组装。

[期刊原文及方法](https://doi.org/10.1111/tpj.15583)。

## 研究背景与分析目标
Macadamia jansenii 是受威胁的澳大利亚坚果属植物，研究目标是评估 HiFi 长读段和 Hifiasm 能否在不依赖染色体图谱的情况下产生高连续植物组装，并比较其与 Hi-C 伪分子构建结果。

## 数据与计算方法
论文使用 PacBio HiFi 数据组装，报告 Hifiasm 默认设置、内置重复清理；高性能计算环境为 24 核与 120 GB 内存。作者将两个 haploid、primary contig 与 alternate haplotig GFA 转为 FASTA，并与 Hi-C 伪分子比较。单独使用 10× 与 18× runs 的结果较碎片化，合并 28× 得到更连续组装，报告 contig N50 46.1 Mb、BUSCO 99.6%。

## 主要发现与解读
14 条染色体中有 8 条由一个大型 contig 覆盖，其中 6 条两端带端粒重复；其余 6 条由 2–4 个主要 contig 覆盖，整体共 17 个主要 contig。作者指出残余断点与核糖体基因等高重复区有关。该研究说明在约 800 Mb、其数据质量和遗传背景下 HiFi/Hifiasm 可实现近染色体级连续性，不能将其覆盖度或连续性直接作为其他物种的保证。

## 方法限制与精读重点
研究目标为近完整染色体级组装，不是全部 14 条染色体 T2T；摘要和结果需区分 Hifiasm contig 与 Hi-C pseudo-molecule。复读时关注不同数据量的组装比较、GFA 到 FASTA 的转换、重复区断点、BUSCO 对比和可复用数据 BioProject PRJNA694456。

