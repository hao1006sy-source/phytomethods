---
title: "WGCNA: an R package for weighted correlation network analysis"
summary: "提出加权基因共表达网络分析（WGCNA）理论框架、无标度软阈值准则、拓扑重叠拓扑与性状关联算法。"
authors: "Langfelder P, Horvath S"
year: 2008
journal: BMC Bioinformatics
doi: 10.1186/1471-2105-9-559
type: method
methodIds: [wgcna]
domainIds: [regulatory-genomics-ai]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# WGCNA: an R package for weighted correlation network analysis

## 1. 研究背景与算法贡献

在全基因组转录组学研究中，数以万计的基因在细胞生理生化通路中并非孤立运行，而是高度协同、形成复杂的分子调控与共表达网络。传统的共表达分析主要依赖简单的双变量相关系数硬截断（例如人为设定相关系数阈值 $|r| > 0.8$ 将基因间关系二值化为“有边”或“无边”）。这种硬截断方法存在显著缺陷：
1. **连续强度信息严重丢失**：无法区分极强相关（如 $r = 0.95$）与临界相关（如 $r = 0.81$）的本质区别；
2. **对阈值选取极其敏感**：微小的阈值扰动会导致网络拓扑连通度发生剧烈剧烈跳变；
3. **缺乏与表型直接关联的系统生物学抓手**：难以将全局成千上万个基因的波动转化为解释植物复杂农艺性状的紧凑模块。

加利福尼亚大学洛杉矶分校（UCLA）的 Peter Langfelder 与 Steve Horvath 在 2008 年推出了 **WGCNA**（Weighted Gene Co-expression Network Analysis，发表于 *BMC Bioinformatics*）。WGCNA 的核心理论与方法学创新在于：
- 确立了**无标度拓扑准则（Scale-free Topology Criterion）**，通过连续乘方变换将相关系数映射为连续权重的加权邻接矩阵；
- 引入了**拓扑重叠矩阵（Topological Overlap Matrix, TOM）**，在考量直接连接的同时全面纳入基因对共享的全局间接邻域拓扑相似性；
- 提出了**模块特征基因（Module Eigengene, ME）** 概念与动态树剪切（Dynamic Tree Cut）算法，实现了模块识别、性状直接关联与核心枢纽（Hub）基因挖掘的闭环流程。

---

## 2. 核心数学模型与数据结构

### 2.1 软阈值乘方与无标度网络准则

为了保持共表达强度的连续性，WGCNA 计算所有基因对之间的皮尔逊相关系数 $s_{ij} = cor(x_i, x_j)$，并通过软阈值指数 $\beta \ge 1$ 转换为**邻接权重（Adjacency）** $a_{ij}$：
- **无符号网络（Unsigned）**：$a_{ij} = |s_{ij}|^\beta$（同时捕获强正相关与强负相关）；
- **有符号网络（Signed，强烈推荐）**：$a_{ij} = \left( 0.5 \times (1 + s_{ij}) \right)^\beta$（正相关保留高权重，负相关权重压制至接近 0）。

软阈值参数 $\beta$ 依据**无标度拓扑网络准则**进行客观挑选：真实生物网络节点度 $k$ 的分布应近似遵循幂律分布 $p(k) \propto k^{-\gamma}$，即 $\log p(k)$ 与 $\log k$ 呈现线性负相关。通过计算不同 $\beta$ 下的决定系数 $R^2$，通常选择使 $R^2 \ge 0.85$ 且平均连通度适中的最小 $\beta$。

### 2.2 拓扑重叠矩阵（Topological Overlap Matrix, TOM）

单纯两个基因直接相连不足以证明其处于同一生物通路中。TOM 不仅考量基因 $i$ 与基因 $j$ 的直接边权 $a_{ij}$，更系统统计两者共享的所有共同邻居节点 $u$ 的交互强度：
$$TOM_{ij} = \frac{\sum_u a_{iu} a_{uj} + a_{ij}}{\min(k_i, k_j) + 1 - a_{ij}}$$

其中 $k_i = \sum_u a_{iu}$ 为基因 $i$ 的节点连接度（Connectivity）。

基于拓扑重叠差异度 $dissTOM_{ij} = 1 - TOM_{ij}$ 进行层次聚类（Hierarchical Clustering），并使用动态剪枝算法（Dynamic Tree Cut）自动自适应切割聚类树，生成用不同颜色标记的共表达功能模块。

### 2.3 模块特征基因（Module Eigengene, ME）与表型关联

对于识别出的每个共表达模块 $q$：
- 其内部所有基因在全部样本中的表达矩阵进行第一主成分分解（SVD/PCA），其第一主成分得分向量定义为**模块特征基因（$ME_q$）**；
- 计算各个模块的 $ME_q$ 与植物表型测量指标（如株高、分蘖数、产量、抗逆理化指标等）之间的相关系数与 $p$ 值，直观输出**模块-性状关联热图（Module-Trait Relationships）**；
- **模块内连接度（kME）与 Hub 基因识别**：计算基因表达量与所属模块特征基因的相关系数：
  $$kME_i = cor(x_i, ME_q)$$
  $kME$ 越接近 1，表明该基因在该模块内处于中心调控地位，通常为关键核心转录因子。

---

## 3. 算法复杂度与计算性能

1. **计算瓶颈在于大矩阵相乘**：全基因组 TOM 矩阵计算复杂度为 $O(N^3)$（基于 BLAS 矩阵乘法加速）。
2. **块式并行策略（Blockwise Modules）**：当基因数量超过 2 万至 4 万时，WGCNA 提供了 `blockwiseModules()` 算法，先通过两步预聚类将全基因组划分为多个计算块（Blocks），在每个块内独立构建 TOM 并在最后合并模块，极大节省了物理内存。
3. **C 级多线程支持**：通过编译优化支持 OpenMP 多线程相关系数矩阵计算。

---

## 4. 植物基因组学应用场景与科研价值

在作物遗传改良与逆境生理学中，WGCNA 是解释转录组与宏观表型桥梁的核心分析方法：
- **复杂农艺性状的协同基因群锁定**：例如在水稻籽粒灌浆、玉米籽粒淀粉合成或油菜种子含油量研究中，WGCNA 能够将全基因组表达数据归纳为特定的共表达模块，直接鉴定出与灌浆速率显著相关的“碳水化合物代谢模块”或“脂质转运模块”；
- **非生物胁迫响应时空网络解析**：在干旱或低温渐进处理时序样本中，追踪模块特征基因（ME）的动态升降，发掘在特定处理时期特异性启动的胁迫早期响应 Hub 转录因子（如 DREB、NAC）；
- **异源多倍体模块保守性比较**：利用模块保留性统计量（Module Preservation Statistics），评估全基因组复制（WGD）后同源基因网络在不同亚基因组间的功能保守性与分化。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心分析流程与执行代码 (R / CRAN)
```R
library(WGCNA)
enableWPT(nThreads = 16)  # 启用多线程

# 1. 载入经过标准化且去除低表达基因的表达矩阵 (行: 样本, 列: 基因)
datExpr <- read.table("normalized_expression.txt", header = TRUE, row.names = 1)

# 2. 软阈值参数客观筛选 (无标度拓扑拟合)
powers <- c(c(1:10), seq(from = 12, to = 20, by = 2))
sft <- pickSoftThreshold(datExpr, powerVector = powers, networkType = "signed", verbose = 5)

# 3. 一步法块式模块识别与网络构建 (推荐 power 设为 sft$powerEstimate)
net <- blockwiseModules(
  datExpr,
  power = 12,
  networkType = "signed",
  TOMType = "signed",
  minModuleSize = 30,
  mergeCutHeight = 0.25,        # 相似模块合并截断高度 (相关性 > 0.75 合并)
  numericLabels = TRUE,
  pamRespectsDendro = FALSE,
  saveTOMs = FALSE,
  verbose = 3
)

# 4. 计算模块特征基因 (ME) 与外部表型关联
moduleColors <- labels2colors(net$colors)
MEs <- net$MEs
moduleTraitCor <- cor(MEs, traitData, use = "p")
moduleTraitPvalue <- corPvalueStudent(moduleTraitCor, nrow(datExpr))

# 5. 计算模块内基因连接度 (kME) 筛选核心 Hub 基因
geneModuleMembership <- as.data.frame(cor(datExpr, MEs, use = "p"))
```

### 5.2 关键参数说明
- `networkType = "signed"`：强烈推荐构建有符号网络，避免将强负相关基因错误聚集在同一功能协作模块内。
- `mergeCutHeight = 0.25`：模块特征基因相似度阈值（$1 - 0.25 = 0.75$），将高度相关的冗余小分支进行合并。
- `minModuleSize = 30`：设定单个模块所包含的最小基因数目。

---

## 6. 阅读与复现资源

- **原始研究论文**：[BMC Bioinformatics 2008 DOI: 10.1186/1471-2105-9-559](https://doi.org/10.1186/1471-2105-9-559)
- **PubMed 记录**：[PMID: 19114008](https://pubmed.ncbi.nlm.nih.gov/19114008/)
- **CRAN 官方软件包**：[WGCNA on CRAN](https://cran.r-project.org/package=WGCNA)
- **Horvath 实验室官方教程**：[WGCNA Tutorials](https://horvath.genetics.ucla.edu/html/CoexpressionNetwork/Rpackages/WGCNA/Tutorials/)
- **站内配套专题**：[基因共表达网络与 WGCNA 分析](../../topics/regulatory-genomics-ai/m09-topic-04/)
- **站内实操教程**：[WGCNA 共表达网络构建实战教程](../../tutorials/wgcna-synthetic/)
