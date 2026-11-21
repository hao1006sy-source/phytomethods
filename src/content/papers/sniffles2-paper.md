---
title: "Detection of mosaic and population-level structural variants with Sniffles2"
summary: "介绍面向长读段的 Sniffles2 结构变异检测、群体分型与低频嵌合变异模式。"
authors: "Smolka M, Paulin LF, Grochowski CM, Horner DW, Mahmoud M, Behera S, Kalef-Ezra E, Gandhi M, Hong K, Pehlivan D, Scholz SW, Carvalho CMB, Proukakis C, Sedlazeck FJ"
year: 2024
journal: "Nature Biotechnology 42(10):1571–1580"
doi: 10.1038/s41587-023-02024-y
type: method
methodIds: [sniffles2]
domainIds: [pangenomics-structural-variation]
speciesIds: []
status: published
updatedAt: 2026-11-21
---

## 方法范围

Sniffles2 是基于 PacBio 或 Oxford Nanopore 长读段比对结果进行结构变异检测的软件。论文描述重复感知的信号聚类、快速共识序列和覆盖度自适应过滤，并扩展了家系/群体联合分型及低频嵌合变异分析。这里引用它作为长读段算法实例；原论文的评估对象以人类样本和相应基准为主，不作为植物数据上的方法验证。

书目信息依据 [PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/38168980/)核对，DOI 为 `10.1038/s41587-023-02024-y`。论文在线发表于 2024 年 1 月，正式卷期为 *Nature Biotechnology* 42(10), 1571–1580（2024）。出版方发布了更正：[Publisher Correction](https://doi.org/10.1038/s41587-024-02141-2)。软件代码见 [Sniffles 官方仓库](https://github.com/fritzsedlazeck/Sniffles)。
