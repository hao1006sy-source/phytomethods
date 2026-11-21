---
title: "AnchorWave: Sensitive alignment of genomes with high sequence diversity, extensive structural polymorphism, and whole-genome duplication"
summary: "植物基因组共线锚点识别与碱基级比对。"
authors: "Song B, Marco-Sola S, Moreto M, Johnson L, Buckler ES, Stitzer MC"
year: 2022
journal: PNAS
doi: 10.1073/pnas.2113075119
type: method
methodIds: [anchorwave]
domainIds: [pangenomics-structural-variation]
speciesIds: []
status: draft
updatedAt: 2026-11-21
---
## 方法贡献
AnchorWave 面向序列分化较高、结构多态明显及经历全基因组复制的植物基因组比较。其流程利用全长 CDS 和外显子等基因结构信息寻找共线锚点，按最长路径组织锚点，再对锚点间区段进行碱基级比对；两段仿射 gap cost 用于兼顾短 indel 与较长插入缺失的对齐代价。论文使用玉米和高粱等植物组装评估跨基因组比对，并分别讨论普通共线比较与多倍化背景下的参数设置。该方法解决基因组间比对和共线区组织问题，不能替代组装器或图泛基因组构建流程。[PNAS 原文](https://doi.org/10.1073/pnas.2113075119)；[PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/34934012/)。
