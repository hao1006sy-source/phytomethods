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
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
旱稻（upland rice）在通气良好的旱作土壤中演化出发达的深根系以适应水分胁迫。Zhao 等（2018）对 **795 份栽培稻材料**（涵盖旱稻与水稻生态型）开展全基因组重测序与根系表型测定，解析强健根系（robust roots）及旱稻适应性驯化的遗传基础。

## 分析流程
1. **SNP 过滤与 LD 剪枝**：从参考基因组比对获得的 **330 万个未填补 SNP** 出发，按缺失率 $\le 50\%$、次要等位基因频率 $\text{MAF} \ge 5\%$ 筛选，并使用 **PLINK** 按 $r^2 \le 0.3$ 剪枝，提取 **154,516 个独立 SNP** 用于群体结构推断。
2. **群体结构推断**：使用 **ADMIXTURE 1.3** 对 $K=1$–10 进行祖先成分拟合，结合主成分分析确定 $K=8$ 作为合适的群体结构模型，并区分籼稻/粳稻及旱稻生态型分群。
3. **全基因组关联分析（GWAS）**：使用 **GAPIT** 基于 330 万个未填补 SNP 计算 795 份材料的 PCA 与亲缘关系矩阵（kinship），以前 3 个 PC 作为协变量运行压缩混合线性模型（CMLM）与一般线性模型（GLM）。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **PLINK** | 从 3.3M SNP 中按缺失率、MAF 与 $r^2 \le 0.3$ 剪枝提取 154,516 个 SNP | 构建无连锁冗余的标记集，用于无偏估计群体祖先成分 |
| **ADMIXTURE 1.3** | 拟合 $K=1$–10 群体结构模型 | 在 $K=8$ 下清晰解析栽培稻亚群及旱稻生态型的遗传分化 |
| **GAPIT** | 基于 3.3M SNP 计算 PCA、亲缘矩阵并执行 CMLM/GLM GWAS | 控制群体分层后定位多个根系性状显著关联位点与自然等位变异 |

## 主要科研发现
- 揭示了旱稻在适应旱作环境过程中根系性状（如根长、根重、深根比例）受到的强选择信号与自然等位变异。
- 明确区分了 LD 剪枝标记集（154,516 SNP，用于群体结构）与全量标记集（3.3M SNP，用于 PCA/kinship 及 GWAS）的分工。

## 阅读与数据复现资源
- **原始论文**：[PLOS Genetics (2018)](https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.1007521) | [DOI](https://doi.org/10.1371/journal.pgen.1007521)
- **数据复现**：原始重测序与表型数据详见原文 Data Availability 部分。
