---
title: InterProScan
name: InterProScan
summary: 通过蛋白签名数据库识别蛋白家族和结构域。
dataType: 蛋白 FASTA
principle: 蛋白签名与结构域匹配
domainIds: [genome-annotation]
topicIds: [m02-topic-01, m02-topic-06]
principleIds: [annotation]
dataIds: [annotation-input]
paper: interproscan-paper
repository: https://github.com/ebi-pf-team/interproscan
updatedAt: 2026-11-20
---
## 研究问题与方法
InterProScan 针对蛋白序列运行多个成员数据库的签名识别方法，输出家族、结构域和其他特征匹配，可关联 InterPro 和 GO 术语。它提供功能推断证据，需要结合序列覆盖、同源和上下文解释。

## 输入输出
输入通常为预测蛋白 FASTA；官方程序支持多种结果格式，具体分析模块、数据库版本及 GO 映射设置以所用版本文档为准。记录数据库版本有助于复现；输出的匹配不等同于实验功能验证。

## 植物案例
[芒果基因组论文](https://doi.org/10.1002/tpg2.20441)报告使用 InterProScan 进行注释。[InterProScan 5 方法论文](https://doi.org/10.1093/bioinformatics/btu031)；[官方文档](https://interproscan-docs.readthedocs.io/)。
