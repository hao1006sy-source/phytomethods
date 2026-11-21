---
title: rrBLUP
name: rrBLUP
summary: R 包实现岭回归 BLUP 与核方法，用于基因组育种值预测。
dataType: SNP 基因型、表型与育种试验设计
principle: 岭回归与线性混合模型
domainIds: [gwas-breeding]
topicIds: [m06-topic-06, m06-topic-07]
principleIds: [gwas-mixed-model]
dataIds: [variant-data, phenotype]
paper: rrblup-paper
repository: https://cran.r-project.org/web/packages/rrBLUP/index.html
version: 4.6.3
status: published
updatedAt: 2026-11-22
---
## 软件定位与研究问题
rrBLUP 是用于基因组选择和数量遗传分析的 R 软件包。它以标记数据估计基因组育种值（genomic estimated breeding value，GEBV），适用于以预测育种材料表现为目的的分析。其经典方法论文介绍了 R 包中的岭回归与核方法实现。[Endelman，2011](https://doi.org/10.3835/plantgenome2011.08.0024)；[CRAN 包页面](https://cran.r-project.org/web/packages/rrBLUP/index.html)。

## 计算原理
在标记效应参数多于个体数的设置下，岭回归通过惩罚项收缩效应估计，避免普通最小二乘解不稳定。随机效应表达中，标记效应可设为均值为零、方差相同的随机变量；基于标记构造的加性关系矩阵则可在个体层面拟合 BLUP。核方法可表达非线性相似关系。不同模型的遗传假设和目标不同，预测值的含义需与目标群体、训练群体及性状设计一并说明。

## 输入、输出与分析步骤
输入包含样本对应的标记矩阵、表型，以及需要时的设计协变量或关系结构。典型流程为核对样本 ID 和等位基因编码、过滤缺失与低质量标记、建立训练/验证划分、拟合模型、预测验证集并计算相关、RMSE 等指标。输出为标记效应或个体预测值。交叉验证划分应模拟真实育种部署：随机折叠可能高估跨家系、跨地点或跨年份的预测能力；亲缘近邻泄漏也会夸大性能。

## 植物应用与方法边界
rrBLUP 的方法论文以植物基因组选择为应用背景。跨研究比较时需报告训练群体、标记密度、性状遗传力、验证策略及预测准确度定义。它与 GWAS 的目标不同：基因组选择关注预测，标记效应不自动构成单个位点的显著性证据。本文未将 rrBLUP 声称为任何特定植物案例的独占工具；实际案例应以原文方法部分核对模型和软件版本。

## 版本、代码与关联资源
CRAN 当前索引列出 rrBLUP 4.6.3，包页面提供源代码、手册和依赖信息。可由 R 环境安装：

```r
install.packages("rrBLUP")
```

实际命令及函数参数应以安装版本手册为准。本项目当前未运行 rrBLUP。上游为变异质控、样本与表型核验；下游为独立群体预测评估和育种决策。延伸阅读：[基因组选择专题](../../topics/gwas-breeding/m06-topic-06/)及[方法论文](../../papers/rrblup-paper/)。
