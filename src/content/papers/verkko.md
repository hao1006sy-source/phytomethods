---
title: "Telomere-to-telomere assembly of diploid chromosomes with Verkko"
summary: "介绍整合 HiFi 与超长读长的二倍体基因组组装方法。"
authors: "Rautiainen M et al."
year: 2023
journal: Nature Biotechnology
doi: 10.1038/s41587-023-01662-6
type: method
method: verkko
methodIds: [verkko]
domainIds: [genome-assembly]
speciesIds: []
updatedAt: 2026-11-20
---

## 研究解读
介绍整合 HiFi 与超长读长的二倍体基因组组装方法。 原文包含实验与分析细节，可通过 DOI 查阅。

## 数据来源
[出版方原文](https://doi.org/10.1038/s41587-023-01662-6)。

## 研究背景与方法目标
超长重复区需要读段跨越信息；高准确 HiFi 读段则提供更可靠的局部序列与图分辨能力。Verkko 的研究问题是将互补数据源整合到自动化、迭代式图组装中，输出二倍体两套候选路径。

## 方法创新与计算路线
论文描述从高准确长读段构建 multiplex de Bruijn graph，再逐步整合 ONT 超长 reads 与单倍型特异标记简化图结构。流程先建立局部准确骨架，再借长分子消解跨重复连接，并形成相位组装。

## 主要结果与研究范围
原文报告在人类 HG002 数据上 46 条二倍体染色体中有 20 条组装为无缺口序列，精度报告为 99.9997%；论文的核心验证围绕人类组装，不可据此声称植物也获得相同水平。页面所列黄花木案例属于后续植物研究，Verkko 用于辅助缺口闭合。

## 局限与阅读重点
可解析区间受超长 reads 长度分布、HiFi 覆盖、图复杂性及相位信息影响；极端同源重复和拷贝数差异仍需额外证据或人工处理。精读时关注 multiplex graph 构造、ONT reads 如何参与图简化、相位标记的使用方式和输出文件。比较 Hifiasm 时应在相同数据下看连续性、QV、相位块与错接，而不是只比较 N50。
