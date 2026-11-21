---
title: "Fast model-based estimation of ancestry in unrelated individuals"
summary: "使用最大似然模型估计个体的祖先成分比例。"
authors: "Alexander DH, Novembre J, Lange K"
year: 2009
journal: Genome Research
doi: 10.1101/gr.094052.109
type: method
methodIds: [admixture]
domainIds: [population-genetics]
speciesIds: []
status: draft
updatedAt: 2026-11-21
---
## 方法价值
Alexander、Novembre 和 Lange 提出 ADMIXTURE，用于从多位点基因型估计相互独立个体在指定 $K$ 下的模型祖先比例及成分等位基因频率。论文说明该软件使用与 STRUCTURE 相同的似然模型，以最大似然点估计代替 MCMC 后验抽样，并通过交替块优化、序列二次规划和准牛顿加速提高计算效率。该推断的输出是给定数据及模型条件下的参数估计，不能单独确定真实人口史。

论文的模型近似要求关注标记间连锁不平衡，样本筛选和位点集合会影响 $Q$ 与 $P$ 的估计。论文报告模拟及真实数据比较，显示其实现可在保持估计精度的同时减少相对 STRUCTURE 的计算时间；性能结论属于论文实验所用数据和软件版本的结果。[期刊全文及 DOI](https://doi.org/10.1101/gr.094052.109)；[PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/19648217/)；[官方算法说明](https://dalexander.github.io/admixture/publications.html)。

Alexander 和 Lange 后续论文介绍区块自助标准误、投影和并行处理等算法增强。[后续方法论文](https://doi.org/10.1186/1471-2105-12-246)。当前工具页记录了官方版本 1.4.0、输入输出文件、主要命令、软件分发信息及水稻和拟南芥应用边界；本项目尚未用真实植物基因型数据运行该软件。[工具详情](../../methods/admixture/)；[3,010 份水稻应用案例](../rice-3010-pangenome/)。
