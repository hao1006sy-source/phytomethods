---
title: BRAKER3
name: BRAKER3
summary: 整合 RNA-seq 与同源蛋白证据的真核基因注释流程。
dataType: 软屏蔽基因组 / RNA-seq / 蛋白
principle: 统计预测与证据整合
domainIds: [genome-annotation]
topicIds: [m02-topic-01, m02-topic-03, m02-topic-04]
principleIds: [annotation]
dataIds: [annotation-input]
paper: braker3-paper
repository: https://github.com/Gaius-Augustus/BRAKER
updatedAt: 2026-11-20
---
## 研究问题与方法
BRAKER3 是组合多个软件的工作流。它利用基因组、RNA-seq 和蛋白证据，结合 GeneMark-ETP 与 AUGUSTUS 预测，再由 TSEBRA 选择基因模型；其模型输出应与测序和组装质量一起评估。

## 输入、输出和步骤
准备软屏蔽基因组 FASTA、按官方指南处理的 RNA-seq 比对和同源蛋白数据；记录工具版本、物种和运行参数。输出包含基因结构注释以及预测序列，具体文件取决于版本与运行模式。RNA 数据不足或蛋白来源偏窄可能影响证据覆盖。

## 植物应用
原始方法论文以拟南芥、蒺藜苜蓿、杨树和番茄等物种进行基准评估。[论文](https://doi.org/10.1101/gr.278090.123)；[官方仓库](https://github.com/Gaius-Augustus/BRAKER)。
