---
title: AnchorWave
name: AnchorWave
summary: 基于锚点和全基因组复制信息进行植物全基因组比对。
dataType: 基因组 FASTA / 基因注释
principle: 锚点识别与区块比对
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-02]
principleIds: [alignment]
dataIds: [assembly]
paper: anchorwave-paper
repository: https://github.com/baoxingsong/AnchorWave
status: draft
updatedAt: 2026-11-20
---
## 问题与计算原理
AnchorWave 面向具有序列多样性、结构变化和全基因组复制的基因组比较。该方法利用基因注释识别可比较的锚点，考虑全基因组复制带来的一对多对应，再对共线区块执行碱基级全局比对。论文描述了两段仿射间隙代价，以处理长度不同的间隙。

## 输入与输出
输入通常包含参考与查询基因组、参考注释及用于锚定的序列；输出包括锚点和区块比对文件。基因命名、倍性和参数应依据[官方仓库](https://github.com/baoxingsong/AnchorWave)所用版本核对。

## 植物研究与上下游
原始论文针对重复、转座子和复制丰富的植物基因组评估了方法。[方法论文](https://doi.org/10.1073/pnas.2113075119)。输入组装及注释需要质量控制，下游可对可比较区域进行重排或序列差异分析；并非所有比对结果都能直接作为任一工具输入。
