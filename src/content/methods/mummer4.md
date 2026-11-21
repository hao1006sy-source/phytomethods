---
title: MUMmer4
name: MUMmer4
summary: 通过最大精确匹配锚点、聚类和局部延伸比较近缘基因组及组装序列。
version: 4.0.1
dataType: 组装 FASTA；一个或多个核苷酸序列集合
principle: 精确匹配锚点与局部比对
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-02]
principleIds: [alignment]
dataIds: [assembly, dna-sequence]
paper: mummer4-paper
repository: https://github.com/mummer4/mummer
status: published
updatedAt: 2026-11-21
---
## 开发背景与问题
MUMmer4 是用于基因组序列比较的工具集；`nucmer` 是其中比较核苷酸序列的主要程序，可处理已完成基因组以及由大量 contig 组成的 draft assembly。它提供组装间的候选同源区块，后续仍需根据研究目标检查重复拷贝、共线性与结构差异。[方法论文](../../papers/mummer4-paper/)。

## 计算流程
MUMmer4 使用后缀数组索引参考序列以搜索最大精确匹配（maximal exact matches, MEMs）。`nucmer` 随后把相近的匹配聚成簇，并以 Smith–Waterman 局部比对延伸锚点，生成 delta 格式的区块比对结果。`show-coords` 可将其转为坐标摘要；`delta-filter` 能依据匹配关系筛选比对。筛选方案影响重复区域保留情况，宜留存原始 delta 文件和筛选参数。[官方仓库与命令说明](https://github.com/mummer4/mummer)。

## 输入、输出与使用注意
典型组装间比较输入为参考与查询 FASTA；`nucmer` 产生 `.delta`，可进一步用 `show-coords` 生成坐标表，或通过 `delta-filter` 得到筛选后的 delta。输出包含局部比对区间，不会自动给出经过生物学验证的共线块或结构变异结论。参考/查询顺序、FASTA 序列 ID、反向方向、重复过滤和下游工具需要的格式都应记录。`nucmer` 默认匹配策略和 `--mum`、`--maxmatch` 等选项会影响重复区域中的匹配集合，需结合下游问题检查，而非将筛选后的唯一对应视为生物学同源的充分证明。

## 植物应用案例
Guo 等对野生稻和栽培稻泛基因组开展的研究报告使用 MUMmer v4.0.0beta2：以叶绿体和线粒体参考序列筛除候选细胞器 contig；以 `nucmer` 比较 Nipponbare 与四个代表材料的基因组共线性；并对组装 contig 与参考基因组比对，经 `delta-filter` 选取一对一比对，再以 `show-snps` 识别组装比对变异。作者还在长读段组装集合上使用 MUMmer 进行组装比对变异分析。不同用途对应不同输入和过滤目标，不能把细胞器筛查、共线分析与 SNP 检测混作同一步。[论文全文与方法](../../papers/wild-rice-pangenome-2025/)。

## 版本与许可
对照官方发布页记录，当前版本快照为 MUMmer4 v4.0.1；上游项目标注 Artistic-2.0 许可。版本和许可应以具体下载的发布包及其附带文本为准。[官方发布页](https://github.com/mummer4/mummer/releases)；[项目许可标识](https://github.com/mummer4)。

## 相关资源
- 原始方法论文：[Marçais 等，2018](../../papers/mummer4-paper/)
- 官方代码仓库：[mummer4/mummer](https://github.com/mummer4/mummer)
- 相关专题：[植物全基因组比对](../../topics/pangenomics-structural-variation/m03-topic-02/)
