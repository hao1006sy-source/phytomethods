---
title: "Merqury: reference-free quality, completeness, and phasing assessment for genome assemblies"
summary: "提出使用 k-mer 评估组装准确率、完整性和相位的方法。"
authors: "Rhie A et al."
year: 2020
journal: Genome Biology
doi: 10.1186/s13059-020-02134-9
type: method
method: merqury
methodIds: [merqury]
domainIds: [genome-assembly]
speciesIds: [arabidopsis]
updatedAt: 2026-11-20
---

## 研究解读
提出使用 k-mer 评估组装准确率、完整性和相位的方法。 原文包含实验与分析细节，可通过 DOI 查阅。

## 数据来源
[出版方原文](https://doi.org/10.1186/s13059-020-02134-9)。

## 研究背景与核心问题
长读段组装质量有时高于现有参考序列，基于参考比对的验证会继承参考缺口和参考偏倚。Merqury 用未组装高准确 reads 的 k-mer 集合作为参考无关证据，评估组装碱基准确度、完整性及亲本辅助相位。

## 方法创新
论文介绍 spectra-cn，并扩展 spectra-asm、spectra-hap 和 blob plots。核心指标包括 QV、k-mer completeness、亲本特异 hap-mer completeness、phase block continuity 和 switch error。论文说明了 Meryl 的集合运算与指标从 k-mer 统计到碱基错误率的计算假设。

## 主要结果与植物关系
作者在人体和植物数据上展示该方法，其中包含拟南芥 F1 材料的 k-mer 频谱与相位示例。二倍体例子在约 45× 读段覆盖下，单倍型特异 k-mer 峰约在半深度、两条同源染色体共有峰约在全深度附近；这是该数据覆盖与遗传结构的结果，不是固定阈值。

## 限制与精读重点
QV 假定 reads 完整覆盖真实基因组，并采用独立 k-mer/错误生存近似；低或偏倚覆盖会低估 QV，错误 read k-mer 过多可能高估。重复 copy number 和多倍性使 spectra 解释更复杂；该工具不直接验证 chromosome ordering。精读应关注可信 read k-mer 的筛选、频谱图色层、QV 公式和 trio 标记数据如何定义 phase blocks。
