---
title: 基因组组装基础
summary: 从序列片段理解连续组装与染色体挂载。
domain: genome-assembly
methods: [hifiasm, verkko]
updatedAt: 2026-11-20
---
## 研究背景和生物学问题
从头组装（de novo assembly）直接利用样本测序片段推断基因组序列。植物的转座子、相似重复、杂合差异和多倍性会增加候选连接，研究目标决定应保留哪些单倍型及拷贝。

## Reads、contig 和 scaffold
Read 是测序仪读取的片段；contig 是由重叠片段形成的连续序列；scaffold 根据长程证据连接、排序和定向多个 contig，可以包含间隙。染色体级 scaffold 是染色体尺度的序列表示，端粒和着丝粒是否完整需要独立检查。

## 计算思想和步骤
重叠—布局—一致序列（OLC）先查找 reads 间重叠，再确定布局并生成 consensus。de Bruijn 图利用 k-mer 邻接关系表达序列；string graph 精简 reads 的重叠关系。组装器在纠错、图清理和路径选择后生成 contig，Hi-C 等数据可提供跨 contig 的长距离线索。

## 评价与方法比较
N50 与 L50 描述长度分布；BUSCO 使用保守基因集合评估基因空间；k-mer 完整度、QV 和长 reads 回贴提供其他证据。连续性高的结果仍需检查错接、塌缩和碱基错误。Hifiasm 利用高准确度 reads 的相位感知组装图；Verkko 使用多重 de Bruijn 图并可整合超长 reads。

## 植物案例和阅读
[四倍体马铃薯组装](https://doi.org/10.1038/s41588-022-01015-0)展示了多倍体单倍型组装的研究背景。[Hifiasm](https://doi.org/10.1038/s41592-020-01056-5)、[Verkko](https://doi.org/10.1038/s41587-023-01662-6)和[Merqury](https://doi.org/10.1186/s13059-020-02134-9)论文提供方法细节。
