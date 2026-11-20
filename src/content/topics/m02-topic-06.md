---
title: 基因功能注释
summary: 从同源、结构域和受控词表解释蛋白功能。
domain: genome-annotation
methods: [interproscan]
updatedAt: 2026-11-20
---
## 研究问题
结构注释产生蛋白序列，功能注释为其分配可追溯的家族、结构域和功能术语。相似性支持同源关系，但家族成员可能已发生功能分化，因此预测功能应保留证据来源。

## 方法流程
使用 BLAST 或 DIAMOND 比对蛋白序列，结合覆盖度、相似性和比对质量筛选候选；InterProScan 运行成员数据库的签名模型，识别结构域、家族和其他序列特征，并可映射 GO 术语。InterPro 和 Pfam 汇集蛋白签名；GO 描述分子功能、生物过程和细胞组分；KEGG 组织通路等知识。不同数据库版本、授权和覆盖范围应记录。

## 注释与富集的区别
功能注释为单个基因或蛋白提供证据；富集分析比较基因集合中功能类别出现的比例，需要适当背景集和多重检验。多数据库一致支持可提高解释可信度，短比对、通用结构域或过度外推可能造成误注释。

## 植物应用与阅读
[芒果基因组研究](https://doi.org/10.1002/tpg2.20441)的方法报告使用 InterProScan 进行注释。[InterProScan 方法论文](https://doi.org/10.1093/bioinformatics/btu031)；[官方文档](https://interproscan-docs.readthedocs.io/)。
