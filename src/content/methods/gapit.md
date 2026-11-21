---
title: GAPIT
name: GAPIT
summary: 整合多种 GWAS 与基因组预测方法的 R 工具。
dataType: 基因型、表型与样本协变量
principle: 混合模型与多位点关联分析
domainIds: [gwas-breeding, population-genetics]
topicIds: [m05-topic-03, m06-topic-03, m06-topic-04, m06-topic-05, m06-topic-06]
principleIds: [gwas-mixed-model]
dataIds: [variant-data, phenotype]
paper: gapit3-paper
repository: https://github.com/jiabowang/GAPIT
status: draft
updatedAt: 2026-11-21
---
## 研究问题和软件定位
GAPIT（Genome Association and Prediction Integrated Tool）是面向全基因组关联和基因组预测的 R 工具。GAPIT 3 方法论文介绍其数据处理、质量控制、多种模型及结果展示。[Wang 与 Zhang，2021](https://doi.org/10.1016/j.gpb.2021.08.005)。同一软件支持多个统计模型，报告结果时必须指明实际选择的模型。

## 计算原理
单标记线性模型可将表型表示为标记效应、协变量和误差；混合线性模型进一步以亲缘矩阵描述个体间相关的随机遗传效应。FarmCPU、BLINK 等多位点方法使用不同的候选位点选择与模型更新策略，具体迭代和假设不同。GAPIT 对这些方法提供实现，不能将软件名称直接等同于某一个模型。[GAPIT 3 原论文](https://doi.org/10.1016/j.gpb.2021.08.005)。

## 输入、输出和参数
分析需要样本标识一致的基因型和表型，以及可选的标记位置、协变量和亲缘信息；实际支持的文件格式和调用方式以安装版本文档为准。需要明确模型、次要等位基因频率过滤、主成分、亲缘估计以及缺失处理。常见输出包括标记关联结果及 Manhattan、QQ 等图。多重检验、群体结构和表型测量设计均影响解释；显著标记不自动等同于致因基因。

## 植物案例
水稻籽粒相关研究使用 GAPIT 的 MLM 和 FarmCPU 等方法分析基因相关标记，并比较基因组预测模型。[Anilkumar 等，2023](https://doi.org/10.1038/s41437-023-00599-5)。论文中的不同模型和数据筛选应按其方法部分区分，不将全部分析归因于某一个算法。

水稻根系群体研究在 795 份材料中用 GAPIT 计算前三个主成分及亲缘矩阵，并把这些协变量用于 CMLM/GLM；相同论文中的 PLINK 负责另一个步骤，即生成 LD 剪枝 SNP 集。[原始案例](../../papers/rice-roots-population/)；[出版方全文](https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.1007521)。

## 版本及上下游
2026-11-21 查阅[官方 DESCRIPTION](https://github.com/jiabowang/GAPIT/blob/master/DESCRIPTION)，开发分支声明版本 4.1.0、GPL（≥2）与 R ≥4.3.0；版本 3 方法论文描述的是对应历史版本。此环境未运行 GAPIT。上游为基因型过滤和表型质控，下游为候选位点、连锁不平衡及独立验证。
