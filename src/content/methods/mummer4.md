---
title: MUMmer4
name: MUMmer4
summary: 通过最大精确匹配锚点、聚类和局部延伸比较近缘基因组及组装序列。
dataType: 组装 FASTA；一个或多个核苷酸序列集合
principle: 精确匹配锚点与局部比对
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-02]
principleIds: [alignment]
dataIds: [assembly, dna-sequence]
paper: mummer4-paper
repository: https://github.com/mummer4/mummer
status: draft
updatedAt: 2026-11-21
---
## 开发背景与问题
MUMmer4 是用于基因组序列比较的工具集；`nucmer` 是其中比较核苷酸序列的主要程序，可处理已完成基因组以及由大量 contig 组成的 draft assembly。它提供组装间的候选同源区块，后续仍需根据研究目标检查重复拷贝、共线性与结构差异。[方法论文](../../../papers/mummer4-paper/)。

## 计算流程
MUMmer4 使用后缀数组索引参考序列以搜索最大精确匹配（maximal exact matches, MEMs）。`nucmer` 随后把相近的匹配聚成簇，并以 Smith–Waterman 局部比对延伸锚点，生成 delta 格式的区块比对结果。`show-coords` 可将其转为坐标摘要；`delta-filter` 能依据匹配关系筛选比对。筛选方案影响重复区域保留情况，宜留存原始 delta 文件和筛选参数。[官方仓库与命令说明](https://github.com/mummer4/mummer)。

## 输入、输出与使用注意
典型组装间比较输入为参考与查询 FASTA；`nucmer` 产生 `.delta`，可进一步用 `show-coords` 生成坐标表，或通过 `delta-filter` 得到筛选后的 delta。输出包含局部比对区间，不会自动给出经过生物学验证的共线块或结构变异结论。参考/查询顺序、FASTA 序列 ID、反向方向、重复过滤和下游工具需要的格式都应记录。MUMmer4 原论文验证其在大规模基因组序列比较中的计算性能，专题中的植物分析步骤属于方法应用说明，本站未将其描述为某一特定植物案例。

## 相关资源
- 原始方法论文：[Marçais 等，2018](../../../papers/mummer4-paper/)
- 官方代码仓库：[mummer4/mummer](https://github.com/mummer4/mummer)
- 相关专题：[植物全基因组比对](../../../topics/pangenomics-structural-variation/m03-topic-02/)
