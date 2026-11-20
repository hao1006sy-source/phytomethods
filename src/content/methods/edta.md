---
title: EDTA
name: EDTA
summary: 植物基因组转座子从头注释与重复序列库构建。
dataType: 基因组 FASTA
principle: 结构识别与重复分类
domainIds: [genome-annotation]
topicIds: [m02-topic-02]
principleIds: [annotation]
dataIds: [annotation-input]
paper: edta-paper
repository: https://github.com/oushujun/EDTA
updatedAt: 2026-11-20
---
## 研究问题与方法
EDTA（Extensive de novo TE Annotator）面向转座子库构建与注释，整合结构特征检测、过滤、分类和去冗余，并可利用构建的库进行全基因组同源注释。完整元件与残片需要不同证据；重复家族和宿主基因相似区域应仔细过滤。

## 输入、输出和步骤
输入是基因组 FASTA；可选提供编码序列用于过滤潜在基因污染。`--genome` 指定基因组，`--threads` 控制线程，`--anno 1` 请求全基因组注释；可选参数、依赖与具体输出名称依版本而定。结果包括候选 TE 库、分类及基因组注释文件。

## 植物案例与证据
原始研究使用水稻人工整理的重复序列库进行基准评估。[原论文](https://doi.org/10.1186/s13059-019-1905-y)；[官方仓库](https://github.com/oushujun/EDTA)。后续可用软屏蔽基因组辅助基因预测。
