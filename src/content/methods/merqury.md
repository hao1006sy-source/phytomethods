---
title: Merqury
name: Merqury
summary: 基于 k-mer 对组装进行无需参考基因组的质量评估。
dataType: 高准确度 reads / 组装序列
principle: k-mer 集合比较
domainIds: [genome-assembly]
topicIds: [assembly-basics, assembly-quality, sequencing-data]
principleIds: [kmer]
dataIds: [accurate-reads, assembly]
paper: merqury
repository: https://github.com/marbl/merqury
updatedAt: 2026-11-20
---
## 研究问题与计算思路
Merqury 比较高准确度 reads 和组装序列中的 k-mer，以估计碱基准确率与完整性。有亲本数据时，还可评估单倍型相位。

## 输入与输出
输入为高准确度 reads 构建的 k-mer 数据库与组装 FASTA；输出包括质量估计、完整性指标及 k-mer 频谱图。需要结合其他证据解释结果。

## 植物研究相关性
原论文展示了植物基因组评估。植物多倍性与重复序列会影响 k-mer 频谱，分析时应结合样本背景解读。

## 方法论文
[10.1186/s13059-020-02134-9](https://doi.org/10.1186/s13059-020-02134-9)；[软件与文档](https://github.com/marbl/merqury)。

## 开发背景与计算流程
Merqury 通过高准确度 reads 的 k-mer 集合，评估缺少高质量参考基因组的组装。实际流程先用 Meryl 统计 reads 中的 k-mer，依据频谱识别可信 k-mer；再统计组装 FASTA 中的相同长度 k-mer，并进行集合与拷贝数比较。亲本特异 k-mer 可用于相位评估。

## 完整度、QV 与频谱
k-mer 完整度衡量可信 reads k-mer 在组装中被恢复的比例。组装特有 k-mer 的比例可用于估计碱基错误率 $E$，质量值为 $QV=-10\log_{10}(E)$；例如示意值 QV 40 对应估计错误率 $10^{-4}$。这项估计依赖 reads 质量与覆盖，不直接测量染色体结构正确性。

`spectra-cn` 图横轴为 reads 中 k-mer 的频次，纵轴为不同 k-mer 的数量，颜色表示组装中的拷贝数。可信 reads 中有而组装中缺失的部分提示潜在缺失；高拷贝颜色可来自真实重复或冗余，须结合倍性与组装目标判断。低频读段错误和混入样本可能影响峰形。

## 输入、输出与植物案例
输入是 Meryl 数据库和一个或两个组装 FASTA，基本用法是 `merqury.sh read-db.meryl asm.fasta out`。输出包括 `.qv`、`.completeness.stats` 和 k-mer 频谱图。原始论文使用拟南芥数据展示方法；[官方仓库](https://github.com/marbl/merqury)提供 COL-0 × CVI-0 F1 相关数据库与示例。上游可使用 Hifiasm 或 Verkko 生成组装；应结合 BUSCO、Hi-C 及回贴结果综合判断。
