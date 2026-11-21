---
title: "Enhancements to the ADMIXTURE algorithm for individual ancestry estimation"
summary: "介绍 ADMIXTURE 的交叉验证、监督估计、惩罚估计和多处理器扩展。"
authors: "Alexander DH, Lange K"
year: 2011
journal: BMC Bioinformatics
doi: 10.1186/1471-2105-12-246
type: method
methodIds: [admixture]
domainIds: [population-genetics]
speciesIds: []
status: published
updatedAt: 2026-11-22
---
## 方法扩展

Alexander 和 Lange 报告了 ADMIXTURE 的四类扩展：用交叉验证比较不同成分数 $K$ 的预测误差；利用已知群体归属的参考个体进行监督估计（supervised estimation）；通过惩罚小的祖先比例系数实现惩罚估计（penalized estimation），提高模型简约性；利用多处理器加速大规模数据分析。[PubMed 书目与摘要](https://pubmed.ncbi.nlm.nih.gov/21682921/)；[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC3146885/)。

交叉验证将非缺失基因型划分为若干折，逐折遮蔽一部分观测、在剩余矩阵上重新估计参数，再对留出的观测计算预测误差。其目标是比较预测能力，而不是计算贝叶斯边际似然。监督模式的 `.ind` 文件为样本指定已知群体；该设置适用于参考个体归属确定且参考群体具有代表性的研究设计。原文提醒，错误的群体标签或不均一参考群体会破坏这一前提。

惩罚估计向对数似然目标加入控制小成分比例的惩罚项，以减少小数据或群体高度相近时过度分配混合比例的情况。惩罚强度需要按具体数据评估，不提供跨物种统一默认值。多处理器模式针对大规模样本/位点矩阵并行化核心计算，实际速度取决于硬件和数据规模。

本文书目信息：Alexander DH, Lange K. BMC Bioinformatics. 2011;12:246. DOI: [10.1186/1471-2105-12-246](https://doi.org/10.1186/1471-2105-12-246)。论文正文以 ADMIXTURE 算法扩展为中心，不提供植物应用案例。[ADMIXTURE 工具详情](../../methods/admixture/)；[M05-03 群体结构专题](../../topics/population-genetics/m05-topic-03/)。
