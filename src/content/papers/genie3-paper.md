---
title: "Inferring Regulatory Networks from Expression Data Using Tree-Based Methods"
summary: "提出 GENIE3，通过逐靶基因的树集成回归从表达数据产生候选调控边排序。"
authors: "Huynh-Thu VA, Irrthum A, Wehenkel L, Geurts P"
year: 2010
journal: PLOS ONE
doi: 10.1371/journal.pone.0012776
type: method
methodIds: [genie3]
domainIds: [regulatory-genomics-ai]
speciesIds: []
status: published
updatedAt: 2026-11-22
---
## 研究问题

表达矩阵中的基因变化可用于提出调控关系候选，但网络推断需要把整体网络搜索拆为可计算任务。GENIE3 对每个目标基因拟合预测模型，利用候选调控因子表达解释目标表达，再将模型特征重要性整理为有向候选边分数。

## 方法创新与算法

该方法分别训练 target-specific 的 Random Forest 或 Extra-Trees 回归器。每个模型将候选调控因子的表达向量作为输入特征，将单个靶基因表达作为响应；训练后以 TF 特征重要性为 TF→target 候选边赋权。对全部靶基因重复后得到边排名。该分数来自预测模型的特征使用贡献，不含直接结合验证、激活/抑制符号或因果估计。

## 研究结果与限制

论文评估了 DREAM4 in silico 网络推断挑战，并在大肠杆菌表达数据上分析网络。其结果显示树方法能够对候选调控边排序，具体性能应结合网络规模、正例定义和挑战评价指标阅读。原始研究不是植物应用论文。对植物表达数据，转录因子表达不总等于蛋白活性，组织混合、相关特征和多倍体同源基因均可能影响重要性；motif、开放染色质、结合实验与扰动数据可提供互补证据。

## 阅读重点与植物研究路径

重点阅读每个靶基因单独建模的建模假设、候选调控因子集合、随机森林/Extra-Trees 选择和 DREAM4 评价协议。拟南芥 iGRN 与氮响应调控网络可作为植物领域整合证据的案例，但未据此声称使用 GENIE3：[拟南芥 iGRN](https://doi.org/10.1038/s41477-021-00894-1)、[氮响应网络](https://doi.org/10.1038/s41467-019-09522-1)。[论文全文](https://doi.org/10.1371/journal.pone.0012776)；[官方实现](https://github.com/aertslab/GENIE3)。
