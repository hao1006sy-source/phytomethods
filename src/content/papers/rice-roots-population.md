---
title: "Loci and natural alleles underlying robust roots and adaptive domestication of upland ecotype rice in aerobic conditions"
summary: "结合水稻群体数据和表型研究根系变异与适应。"
authors: "Zhao Y, Zhang H, Xu J, et al."
year: 2018
journal: PLOS Genetics
doi: 10.1371/journal.pgen.1007521
type: application
methodIds: [plink, admixture, gapit]
domainIds: [population-genetics, gwas-breeding]
speciesIds: [rice]
status: draft
updatedAt: 2026-11-21
---
## 研究问题与数据

Zhao 等研究 795 份栽培稻材料的根系性状、群体结构与适应相关遗传变异。作者以参考基因组比对获得 SNP，先按缺失率不高于 50% 和次要等位基因频率不低于 5%筛选，再在该集合中按论文的 LD 阈值构建群体结构标记。该研究的统计结果针对其材料集合和分析设计。

## 软件任务与结果

| 工具 | 原文中执行的任务 |
| --- | --- |
| PLINK | 从 3.3 百万个未填补 SNP 中提取 154,516 个缺失率不高于 50%、次要等位基因频率不低于 5% 且 $r^2\leq0.3$ 的 SNP，用于群体结构分析的 LD 剪枝集合。 |
| ADMIXTURE 1.3 | 对 $K=1$–10 的模型进行拟合；作者将 $K=8$ 作为一个合适的结构模型，并结合主成分图与籼稻/粳稻分群进行解释。 |
| GAPIT | 用 3.3 百万个未填补 SNP 计算 795 份材料的 PCA 和亲缘矩阵，前 3 个 PC 用于 GWAS 协变量；作者报告 CMLM 使用 PC 与 kinship，GLM 使用 PC。 |

PLINK 的 154,516 个 LD 剪枝 SNP 集与 GAPIT 计算前三个 PC、亲缘矩阵所用的 3.3 百万个 SNP 集合是不同步骤。ADMIXTURE 的 $K=8$、PCA 坐标和 GWAS 混合模型各自回答不同问题，不能互换解释。[出版方原文](https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.1007521)；[DOI](https://doi.org/10.1371/journal.pgen.1007521)。

## 研究边界

论文的 SNP 缺失率、频率、LD 条件和 $K$ 值均对应 795 份栽培稻样本及其研究目标。本站关联 PLINK、ADMIXTURE 与 GAPIT，分别表示原文报告的 LD 标记筛选、祖先成分估计和 PCA/亲缘及关联模型步骤；工具关联不表示这些程序彼此包含其算法实现。
