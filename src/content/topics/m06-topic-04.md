---
title: GWAS 模型：GLM、混合模型与多位点方法
summary: 理解固定效应、亲缘关系及 FarmCPU、BLINK 的模型定位。
domain: gwas-breeding
methods: [gapit]
status: published
updatedAt: 2026-11-22
---
## 研究问题
植物自然群体中的个体常具有复杂亲缘、群体结构和多基因性状背景。GWAS 模型需要在控制混杂、保留统计功效和计算成本之间作出明确选择。模型比较应在相同数据、表型处理与评价标准下进行，不能仅凭某次分析产生的显著位点数判断优劣。

## 线性模型与固定效应
对连续性状，一个简化线性模型可写为

$$\mathbf y=\mathbf X\boldsymbol\beta+\mathbf m\alpha+\boldsymbol\varepsilon.$$

$\mathbf y$ 为表型向量，$\mathbf X$ 是包含截距及环境、群体主成分等协变量的设计矩阵，$\boldsymbol\beta$ 是其固定效应；$\mathbf m$ 是当前标记的基因型编码，$\alpha$ 是待检验效应，$\boldsymbol\varepsilon$ 是残差。模型假设、表型分布、样本和协变量定义需要事先检查。对于二元或其他类型表型，应选择适合的数据模型。

## 混合线性模型与亲缘矩阵
混合线性模型（mixed linear model，MLM）进一步加入随机遗传效应：

$$\mathbf y=\mathbf X\boldsymbol\beta+\mathbf m\alpha+\mathbf Z\mathbf u+\boldsymbol\varepsilon,\qquad \mathbf u\sim N(\mathbf 0,\mathbf K\sigma_g^2).$$

这里 $\mathbf Z$ 将随机效应映射到观测，$\mathbf K$ 为亲缘或基因组关系矩阵，$\sigma_g^2$ 为相应方差参数。$\mathbf K$ 根据标记数据与所用方法构造，其尺度、缺失处理与样本顺序需要记录。固定协变量可描述已知环境或主成分；随机效应通过协方差结构描述样本间相似性。[混合模型原始论文](https://doi.org/10.1038/ng1702)。

亲缘校正可减少部分由相关性造成的虚假信号，同时模型设置、标记与亲缘估计之间的关系可能影响功效。应检查 QQ 图、效应估计与模拟或独立数据中的表现，而非认为加入矩阵后所有偏差都已消失。

## 多位点与迭代方法
FarmCPU 在固定效应模型中检验标记，并与用于选择协变量标记的模型迭代，旨在处理多位点背景与标记混杂问题。[原始论文](https://doi.org/10.1371/journal.pgen.1005767)。BLINK 使用连锁不平衡和模型选择思想迭代选择相关标记，以不同方式组织多位点检验。[BLINK 论文](https://doi.org/10.1093/gigascience/giy154)。它们的迭代过程、参数与假设不同，输出的候选信号仍需验证。

GAPIT 是包含多种 GWAS 和基因组预测方法的 R 工具，版本 3 论文介绍 GLM、MLM、FarmCPU 和 BLINK 等实现。[GAPIT 3 论文](https://doi.org/10.1016/j.gpb.2021.08.005)。GAPIT 是软件平台，FarmCPU 与 BLINK 是其中可调用的方法；软件实际支持的版本及参数应查看对应文档。

## 分析步骤与比较
1. 准备与核对表型、基因型和样本 ID，检查缺失、频率、倍性及环境协变量。
2. 根据研究设计计算 PCA 和亲缘矩阵，明确标记集合、标准化及样本顺序。
3. 指定性状类型和模型，对可比较数据运行 GLM、MLM 或多位点方法并记录版本与参数。
4. 比较 P 值分布、效应估计和候选区域；对全基因组多重检验使用预定方案。
5. 使用模拟数据、重复群体或独立试验评估功效与假阳性；结合 LD、注释和功能证据验证。

## 植物案例与注意事项
水稻地方品种 GWAS 展示自然群体的高密度变异和农艺性状分析。[原始研究](https://doi.org/10.1038/ng.695)。该研究在本专题作为应用背景，不能因此推断其使用了后续发表的 FarmCPU 或 BLINK。

模型对低频等位基因、强亲缘、环境差异和表型异常值的敏感性各不相同。多环境重复测量应采用符合试验设计的表型模型；关联显著性不能代替功能验证。

## 延伸阅读
[统一混合模型](https://doi.org/10.1038/ng1702)、[FarmCPU](https://doi.org/10.1371/journal.pgen.1005767)、[BLINK](https://doi.org/10.1093/gigascience/giy154)和[GAPIT 3](https://doi.org/10.1016/j.gpb.2021.08.005)。

## 研究案例与关联入口
在水稻地方品种研究中，关联结果应回到原文的群体、性状和当时可用方法解读；发表时间晚于该研究的算法不能追溯性地归为其分析工具。[Huang 等，2010](../../../papers/rice-gwas-2010/)提供 GWAS 设计背景；GAPIT 的后续软件实现见[工具页](../../../methods/gapit/)及[2021 方法论文](../../../papers/gapit3-paper/)。关联结果进一步解释见[GWAS 结果专题](../m06-topic-05/)，预测育种目标见[基因组选择专题](../m06-topic-06/)。
