---
title: WGCNA
name: WGCNA
summary: 基于连续幂函数软阈值无标度拓扑准则、拓扑重叠矩阵 (TOM) 动态分层聚类与第一主成分特征基因 (Eigengene) 的加权基因共表达网络分析 R 软件包。
version: "1.74"
dataType: 样本 × 基因归一化表达矩阵（要求样本数 >= 15）与样本农艺/生理表型量化表
principle: 软阈值幂函数邻接矩阵构建、无标度网络拓扑拟合、拓扑重叠矩阵 (TOM)、动态树剪枝与 SVD 模块特征基因 (ME) 分解
domainIds: [regulatory-genomics-ai]
topicIds: [m09-topic-02]
principleIds: [coexpression]
dataIds: [expression-matrix]
paper: wgcna-paper
repository: https://cran.r-project.org/package=WGCNA
status: published
updatedAt: 2026-11-25
---

## 软件定位与核心科学问题

在植物系统生物学研究中，当研究人员测定多组织、多发育时期或不同环境逆境（干旱、冷害、盐胁迫）处理下的大规模转录组时，全基因组数万个基因并非随机游走，而是由共同的转录因子调控、协同形成紧密配合的功能模块（Modules）。

然而，传统的一对一差异表达分析（如简单提取上调/下调基因集合）面临巨大的系统性缺陷：
1. **硬阈值截断丢失丰富拓扑信息**：传统方法人为设定相关系数截断点（如 $|r| > 0.8$ 保留，$\le 0.8$ 丢弃），将连续的生物学相关性粗暴二值化，极度容易受测量噪声干扰；
2. **缺乏系统维度的降维概括**：几千个差异基因无法直观与复杂的农艺表型（如千粒重、耐旱评分、次生代谢物含量）建立量化关联；
3. **无法区分主效核心调控源**：难以在错综复杂的共变网络中识别具有最高网络连通度与生物学主导权的核心枢纽基因（Hub Genes）。

为了解决这一系列系统生物学挑战，Peter Langfelder 与 Steve Horvath 开发了 **WGCNA（Weighted Gene Co-expression Network Analysis）**（发表于 *BMC Bioinformatics*, 2008）。

WGCNA 彻底颠覆了硬阈值做法，创新性地提出了**基于幂函数的连续加权软阈值（Soft Thresholding）**；通过引入严密的**拓扑重叠矩阵（Topological Overlap Matrix, TOM）**与基于奇异值分解（SVD）的**模块特征基因（Module Eigengene, ME）**，实现了从全基因组表达矩阵到共表达模块识别、模块-性状关联以及核心 Hub 基因挖掘的完整数学闭环。

---

## 核心算法原理与数学推导

```
   [方差稳定化表达矩阵 (Samples × Genes, N >= 15)]  +  [样本生理农艺表型表 (Traits)]
                                │
                                ▼
       两两基因相关性度量 (Pearson 相关或双权重中位数相关 bicor)
                                │
                                ▼
       无标度网络拓扑准则 (Scale-Free Topology Criterion)
       └─ 扫描候选幂指数 β，选择使 log(k) 与 log(P(k)) 线性拟合 R^2 >= 0.85 的最小软阈值
                                │
                                ▼
       有符号软阈值邻接矩阵构建 (Signed Adjacency Matrix)
       └─ a_ij = ((1 + s_ij) / 2)^β (严格区分正向协同激活与负向拮抗抑制)
                                │
                                ▼
       拓扑重叠矩阵计算 (Topological Overlap Matrix, TOM)
       └─ 融合直接相关与公共邻居间接连接度，计算相异度 DissTOM = 1 - TOM
                                │
                                ▼
       分层聚类与动态树剪枝 (Hierarchical Clustering & Dynamic Tree Cut)
       └─ 自动识别紧密共表达模块 (Modules, 分配特异颜色标签)
                                │
                                ├─────────────────────────────────────────┐
                                ▼                                         ▼
         模块特征基因奇异值分解 (Module Eigengene, ME)     模块与农艺表型关联分析 (ME vs Trait)
         └─ 提取模块表达矩阵 SVD 第一主成分 (PC1)          └─ 计算相关系数与 p 值，锁定主效调控模块
                                │                                         │
                                └────────────────────┬────────────────────┘
                                                     ▼
                           模块内连接度 (k_ME) 与 Hub 基因筛选 (对接 Cytoscape)
```

### 1. 基因间相似性与有符号软阈值邻接矩阵 (Signed Adjacency Matrix)

设表达矩阵包含 $m$ 个样本和 $p$ 个基因。首先计算基因 $i$ 与基因 $j$ 在所有样本间的协同表达相关性 $s_{ij}$（可采用 Pearson 相关，或对极端离群值更稳健的 biweight midcorrelation）：

为了将相关系数转换为网络邻接权重 $a_{ij} \in [0, 1]$，WGCNA 采用幂函数连续加权：
- **无符号网络（Unsigned Network）**：
  $$a_{ij} = |s_{ij}|^\beta$$
  （无符号网络将强正相关 $r = 0.9$ 与强负相关 $r = -0.9$ 赋予完全相同的权重，无法区分正向激活与负向抑制）；
- **有符号网络（Signed Network / 官方与植物研究强烈推荐）**：
  $$a_{ij} = \left( \frac{1 + s_{ij}}{2} \right)^\beta$$
  - 当 $s_{ij} = 1$（完全正相关）时，$a_{ij} = 1$；
  - 当 $s_{ij} = 0$（无相关）时，$a_{ij} = (0.5)^\beta \approx 0$；
  - 当 $s_{ij} = -1$（完全负相关）时，$a_{ij} = 0$。
  这一设计严格保证了只有在生物学上正向协同工作的基因才被归入同一模块，彻底避免了将负反馈拮抗抑制通路错误聚类的缺陷。

### 2. 无标度网络拓扑准则选择软阈值 $\beta$ (Scale-Free Topology Criterion)

真实自然界中的生物分子网络普遍遵循**无标度网络（Scale-Free Network）**特性：即网络中极少数关键节点（Hubs）拥有极高的连接度，而绝大多数节点连接度较低。节点连接度 $k_i = \sum_{j \neq i} a_{ij}$ 的概率密度函数遵循幂律分布：
$$P(k) \sim k^{-\gamma} \implies \log P(k) = -\gamma \log(k) + C$$
WGCNA 提供系统扫描算法：
1. 遍历一系列候选幂指数 $\beta \in [1, 30]$；
2. 计算每种 $\beta$ 下全网节点连接度分布与无标度模型的线性拟合决定系数 $R^2$；
3. **选型准则**：挑选使 $R^2 \ge 0.85$（或 0.90）的**最小 $\beta$ 值**。既确保了网络符合无标度生物学先验，又最大化保留了平均连接度，避免网络过度稀疏化。

### 3. 拓扑重叠矩阵 (Topological Overlap Matrix, TOM)

仅依靠两两基因直接相关性易受单一样本随机误差影响。WGCNA 引入图论中的拓扑重叠度量：不仅考察基因 $i$ 与 $j$ 的直接连接，更考察它们是否共享相同的“邻居基因圈”：
$$\text{TOM}_{ij} = \frac{l_{ij} + a_{ij}}{\min(k_i, k_j) + 1 - a_{ij}}$$
其中：
- $l_{ij} = \sum_u a_{iu} a_{uj}$ 为通过所有中间公共邻居节点 $u$ 的间接连接强度总和；
- $k_i = \sum_u a_{iu}$ 为节点 $i$ 的全网连接度（Connectivity）；
- 对应的拓扑相异度矩阵定义为：
  $$\text{DissTOM}_{ij} = 1 - \text{TOM}_{ij}$$
  $\text{DissTOM}$ 满足数学上的伪度量空间性质，极大增强了后续聚类对噪声的容忍能力。

### 4. 模块特征基因 (Module Eigengene, ME) 的数学求解

通过对 $\text{DissTOM}$ 执行动态树剪枝（Dynamic Tree Cut），全基因组被聚类划分为若干个特异模块（每个模块赋予一种颜色标识，如 Turquoise, Blue, Brown 等）。

为了提炼出每个模块在样本间的综合表达趋势，WGCNA 对模块 $q$ 的标准化表达子矩阵 $X^{(q)} \in \mathbb{R}^{m \times p_q}$ 执行**奇异值分解（Singular Value Decomposition, SVD）**：
$$X^{(q)} = U \Sigma V^T$$
其中：
- $U \in \mathbb{R}^{m \times m}$ 为样本左奇异向量；
- $\Sigma$ 为按奇异值降序排列的对角阵；
- 模块的第一主成分（First Principal Component, PC1）对应的样本载荷即被定义为**模块特征基因（Module Eigengene, ME）**：
  $$\mathbf{E}^{(q)} = U_{\cdot, 1}$$
  $\mathbf{E}^{(q)}$ 是一个长度为 $m$（样本数）的连续一维向量。它以数学最优的方式解释了该模块内所有基因最多的表达方差，充当了整个生物模块的浓缩代号。

### 5. 模块-表型关联与核心 Hub 基因挖掘

1. **模块-表型关联（Module-Trait Relationship）**：
   直接计算各模块特征基因 $\mathbf{E}^{(q)}$ 与量化生理/农艺表型向量 $\mathbf{T}$（如花青素含量、千粒重、抗旱失水率）之间的 Pearson 相关系数与显著性 $p$ 值，快速定位与目标表型最相关的核心模块；
2. **模块内成员度（Module Membership, $k_{\text{ME}}$）**：
   基因 $i$ 与其所属模块特征基因的相关性 $k_{\text{ME}, i} = \text{cor}(x_i, \mathbf{E}^{(q)})$；$k_{\text{ME}}$ 越接近 1，代表该基因在模块中的核心枢纽地位越高；
3. **基因表型显著性（Gene Significance, GS）**：
   基因 $i$ 与表型直接的相关性 $\text{GS}_i = \text{cor}(x_i, \mathbf{T})$；
4. 综合筛选高 $k_{\text{ME}}$ 且高 $\text{GS}$ 的基因作为最有潜力的候选主效调控基因（Hub Genes）。

---

## 植物多组织共表达分析实践指南

| 植物实验特性 | 潜在统计陷阱与偏倚 | WGCNA 规范应对策略 |
| :--- | :--- | :--- |
| **样本量不足导致的假模块暴增** | 很多植物试验仅包含 2 个处理、各 3 个重复（总样本数 $N = 6$）。在此微小样本量下运行 WGCNA 会产生大量由技术噪声拟合出的随机虚假模块。 | **严格恪守样本量红线**：官方强烈要求**样本量 $N \ge 15$**（推荐 $\ge 20 \sim 30$ 个样本，如涵盖多发育时期、多组织器官、多时间点梯度的组合实验）。小样本试验应仅开展普通差异表达分析（如 DESeq2），严禁强跑 WGCNA。 |
| **输入数据尺度与非正态分布** | 直接将原始测序 counts 或未经方差稳定化的 FPKM 输入，导致高表达极值基因垄断相关系数。 | 必须使用 **DESeq2 的 `vst()`（方差稳定化变换）** 或经过对数变换的 Log2(TPM + 1) 作为输入矩阵，消除异方差性。 |
| **有符号 vs 无符号网络选择** | 使用默认的 unsigned 网络导致将胁迫诱导基因与光合受阻基因聚入同一模块。 | **植物转录组强烈推荐 `networkType = "signed"` 或 `"signed hybrid"`**，确保模块内基因具有相同的生理响应极性。 |

---

## 典型分析命令与标准操作流

以下为在 R 4.3+ 环境中基于 `WGCNA` 包构建有符号加权网络的标准流水线：

```r
library(WGCNA)
options(stringsAsFactors = FALSE)
enableWGCNAThreads() # 开启多线程加速

# 1. 读取植物样本表达矩阵 (行对应样本 Sample, 列对应基因 Gene; 需已完成 VST 变换)
expr_data <- read.csv("rice_drought_vst_expr.csv", row.names = 1)
# 样本表型数据 (行对应样本, 列包含农艺指标: 如 Chlorophyll, Proline, Yield)
trait_data <- read.csv("rice_sample_traits.csv", row.names = 1)

# 2. 检查样本离群值并执行样本分层聚类
sample_tree <- hclust(dist(expr_data), method = "average")
plot(sample_tree, main = "Sample Clustering to Detect Outliers")

# 3. 筛选最优软阈值 power (挑选符合无标度拓扑 R^2 >= 0.85 的最小 beta)
powers <- c(c(1:10), seq(from = 12, to = 20, by = 2))
sft <- pickSoftThreshold(
  expr_data,
  powerVector = powers,
  networkType = "signed",   # 严格选用有符号网络
  verbose = 5
)

# 绘制软阈值拟合指数与平均连通度图
plot(sft$fitIndices[, 1], -sign(sft$fitIndices[, 3]) * sft$fitIndices[, 2],
     xlab = "Soft Threshold (power)", ylab = "Scale Free Topology Model Fit, signed R^2",
     type = "n", main = "Scale independence")
text(sft$fitIndices[, 1], -sign(sft$fitIndices[, 3]) * sft$fitIndices[, 2],
     labels = powers, col = "red")
abline(h = 0.85, col = "red")

# 假定选定最优 power = 12
soft_power <- 12

# 4. 一步法构建有符号共表达网络并识别模块 (Blockwise Network Construction)
net <- blockwiseModules(
  expr_data,
  power = soft_power,
  networkType = "signed",
  TOMType = "signed",
  minModuleSize = 30,             # 最小模块基因数
  reassignThreshold = 0,
  mergeCutHeight = 0.25,          # 相似度 > 0.75 的模块予以合并
  numericLabels = TRUE,
  pamRespectsDendro = FALSE,
  saveTOMs = FALSE,
  verbose = 3
)

# 5. 提取模块特征基因 (Module Eigengenes) 并计算模块-表型相关矩阵
module_colors <- labels2colors(net$colors)
MEs <- moduleEigengenes(expr_data, colors = module_colors)$eigengenes
MEs <- orderMEs(MEs)

module_trait_cor <- cor(MEs, trait_data, use = "p")
module_trait_pval <- corPvalueStudent(module_trait_cor, nrow(expr_data))

# 绘制相关性热图
text_matrix <- paste(signif(module_trait_cor, 2), "\n(", signif(module_trait_pval, 1), ")", sep = "")
labeledHeatmap(
  Matrix = module_trait_cor,
  xLabels = colnames(trait_data),
  yLabels = names(MEs),
  ySymbols = names(MEs),
  colorLabels = FALSE,
  colors = blueWhiteRed(50),
  textMatrix = text_matrix,
  setStdMargins = FALSE,
  cex.text = 0.8,
  zlim = c(-1, 1),
  main = "Module-Trait Relationships"
)

# 6. 提取与抗逆指标 (如 Proline 脯氨酸) 最相关的核心 Hub 基因并导出边表
target_module <- "brown"
module_genes <- (module_colors == target_module)
kME_table <- signedKME(expr_data, MEs)
top_hub_genes <- rownames(kME_table)[order(kME_table[, paste0("kME", target_module)], decreasing = TRUE)[1:30]]

cat("目标模块前 10 个核心枢纽基因 (Hub Genes):\n", head(top_hub_genes, 10))
```

---

## 科学研究案例与上下游分析协同

- **紫米籽粒灌浆期花青素合成调控案例**：在 Sun 等（*Scientific Reports*, 2024）关于特种紫米籽粒发育与抗氧化花青素积累机制的研究中，研究团队利用 WGCNA 对灌浆期不同发育节点的转录组进行了有符号网络构建。成功鉴定了与总花青素含量呈极显著正相关的关键核心共表达模块（*r* = 0.92, *P* < 0.001），并通过模块内连通度（$k_{\text{ME}}$）高精度锁定了协同调控类黄酮合成通路的两个核心 MYB 家族转录因子与一个 bHLH 辅助调控因子；
- **分析工具流转与协作边界**：
  - **上游工具链**：原始测序 reads 由 Salmon/kallisto 定量，经 DESeq2 `vst()` 执行方差稳定化预处理后导入；
  - **下游网络精修与物理验证**：WGCNA 确定的共表达模块内部基因无方向性；可将高连通度 Hub 基因提取后，进一步输入 **GENIE3 / GRNBoost2** 确定上游调控树，并联合 **MEME Suite / FIMO** 扫描启动子顺式元件，构建可解释的植物基因调控级联。
