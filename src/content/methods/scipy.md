---
title: SciPy 线性回归
name: SciPy
summary: 用 Python 科学计算函数执行简单线性回归及统计检验。
dataType: 数值型基因型与表型
principle: 线性回归与 t 检验
domainIds: [gwas-breeding]
topicIds: [m06-topic-03, m06-topic-05]
principleIds: [linear-regression]
dataIds: [variant-data, phenotype]
paper: scipy-paper
repository: https://github.com/scipy/scipy
status: published
updatedAt: 2026-11-22
---
## 定位与计算
SciPy 是通用 Python 科学计算库，`scipy.stats.linregress` 可对一组数值自变量与因变量拟合一元线性回归，并返回斜率、截距和斜率检验 P 值。[SciPy 方法论文](https://doi.org/10.1038/s41592-019-0686-2)、[函数文档](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.linregress.html)。它不是专用 GWAS 软件；本页面使用其统计函数说明单标记模型的基本计算。

在示例中，基因型用 0、1、2 表示等位基因剂量，表型为连续值，对每个标记分别计算线性回归。P 值依赖模型假设及数据质量；该一元模型没有调整群体结构、亲缘关系或其他协变量，不能替代复杂植物群体的正式混合模型分析。

## 输入、输出与参数
输入为同一批样本按相同顺序排列的数值向量；输出包含效应斜率、截距、相关系数、标准误和假设检验 P 值。分析前应检查样本匹配、缺失值、常量标记及表型分布。分析多个标记后还需要恰当的多重检验控制，并结合群体结构与实验设计解释。

## 教学与应用边界
本项目已使用 SciPy 1.18.1 对模拟的 80 个样本、60 个标记执行回归；结果与相关系数 t 检验独立复算一致。数据与图是模拟教学结果，不是植物 GWAS。水稻农艺性状研究可以作为真实 GWAS 生物学问题的延伸阅读，[Huang 等，2010](https://doi.org/10.1038/ng.695)；该论文未在此被作为 SciPy 使用案例。

## 版本、许可与上下游
本次执行版本见关联教程；[SciPy 官方项目](https://github.com/scipy/scipy)提供文档及 BSD 3-Clause 许可。真实分析上游需完成基因型与表型质控，下游需考虑混合模型、多重检验、候选区域和独立功能验证。
