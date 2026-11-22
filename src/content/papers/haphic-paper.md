---
title: "Chromosome-level scaffolding of haplotype-resolved assemblies using Hi-C data without reference genomes"
summary: "提出无需参考基因组的 allele-aware Hi-C scaffold 方法 HapHiC，并用于奇岗异源三倍体组装。"
authors: "Zeng X et al."
year: 2024
journal: Nature Plants
doi: 10.1038/s41477-024-01755-3
type: method
methodIds: []
domainIds: [genome-assembly]
speciesIds: [miscanthus]
updatedAt: 2026-11-22
---

## 研究背景
Hi-C 是染色体尺度挂载 contig 的常用数据，但单倍型解析组装含有相互相似的等位 contig。使用常规挂载方式可能将等位片段分错染色体，或错误地跨等位拷贝连接。HapHiC 的目标是参考无关地处理 allele-aware scaffolding。

## 方法贡献与工作流程
论文介绍了染色体分配、contig 排序定向和不利因素评估，并以 Hi-C link 分布辅助区分等位 contig 与嵌合/塌缩 contig。方法比较包括 HapHiC 与 ALLHiC、YaHS 的真实数据验证。算法指标包含 discordant links、bin pairs、syntenic/reordered/inverted contigs 等 scaffold 质量信号。

## 植物案例与主要结论
作者使用 HapHiC 构建奇岗（*Miscanthus × giganteus*）异源三倍体单倍型解析基因组。论文还使用苜蓿等材料进行验证。植物案例直接说明工具应用于多倍体组装，但效果受 Hi-C 数据、组装片段纯度及倍性结构影响。

## 阅读重点与限制
重点查看 allele-aware link 过滤、contig assign/order/orient 步骤、错误 scaffold 的评估定义，以及相对 ALLHiC/YaHS 的对照条件。工具比较结果依赖测试数据与 ground truth；不可据摘要将 HapHiC 概括为所有多倍体的普遍最优方案。

[期刊原文](https://doi.org/10.1038/s41477-024-01755-3)；[官方仓库](https://github.com/zengxiaofei/HapHiC)；[PubMed](https://pubmed.ncbi.nlm.nih.gov/39103456/)。
