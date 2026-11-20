---
title: Hi-C 辅助染色体挂载
summary: 利用染色质接触信息聚类、排序和定向 contig。
domain: genome-assembly
methods: []
updatedAt: 2026-11-20
---
## 研究背景和生物学问题
Hi-C 记录细胞核中染色质片段的空间接触，通过交联、连接、测序和比对得到成对 reads。同一染色体上距离较近的区域通常具有较强接触信号；细胞结构、重复序列和比对偏差也会影响信号。

## Contact map 与计算流程
将 Hi-C read 对比对到 contig，按基因组区间汇总，得到接触矩阵（contact map）。挂载流程通常包括过滤低质量和不可靠配对、按接触强度将 contig 聚为染色体组、推断同组 contig 的排序和方向，再生成 scaffold 序列及坐标。组装和实际 Hi-C 矩阵必须分别保存以供复核。

## 工具与方法比较
[YaHS](https://github.com/c-zhou/yahs)利用 Hi-C 联系辅助 scaffold 构建；[ALLHiC](https://github.com/tangerzhang/ALLHiC)针对多倍体染色体级组装中的等位关系；[HapHiC](https://doi.org/10.1038/s41477-024-01755-3)用于单倍型解析组装的 Hi-C 挂载。不同工具的输入、倍性处理和假设不同，应依据具体样本及版本文档选择。

## 结果检查与植物应用
正确排序的接触图常在对角线附近出现较强信号；大块非预期的远距离信号、断裂或翻转模式可以提示需复核的连接。重复比对、结构变异及覆盖不均也会改变图案，需与长 reads、遗传图谱或其他证据联合检查。HapHiC 方法论文报告了植物多倍体数据的应用与验证。

## 延伸阅读
[YaHS 方法论文](https://doi.org/10.1093/bioinformatics/btac808)；[HapHiC 方法论文](https://doi.org/10.1038/s41477-024-01755-3)。
