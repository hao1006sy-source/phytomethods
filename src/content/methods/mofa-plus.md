---
title: MOFA+
name: MOFA+
summary: 采用贝叶斯多视图矩阵因子分解 (BMFA)、自动相关性确定 (ARD) 与随机变分推断 (SVI)，无监督整合植物多组学异质数据并定量分解跨组学共享与特异方差。
dataType: 配对的植物多组学矩阵（转录组、表观组、蛋白质组、代谢组等多视图，可分实验分组）
principle: 贝叶斯多视图低秩因子分解、自动相关性确定先验 (ARD)、随机变分推断 (SVI) 与多组学生物方差分解
domainIds: [regulatory-genomics-ai]
topicIds: [m09-topic-05]
principleIds: [latent-factor-integration]
dataIds: [multi-omics-view-matrix]
paper: mofa-plus-paper
repository: https://github.com/bioFAM/MOFA2
version: "1.12.0"
status: published
updatedAt: 2026-11-25
---

## 软件定位与核心科学问题

随着系统生物学技术的跃升，植物科研人员越来越倾向于对同一批植物个体、自交系材料或发育组织，开展全方位的多层多组学立体测定：从染色质开放性（ATAC-seq）、基因转录水平（RNA-seq），到功能分子翻译（Proteomics）以及最终代谢产物积聚（Metabolomics）。

然而，将这些高维度、强异质性的多组学数据集进行联合系统整合面临巨大的数学与统计学壁垒：
1. **数据维度极不对称**：转录组通常包含 30,000+ 基因，蛋白质组仅定量到 3,000~6,000 个蛋白，而靶向/非靶向代谢组通常只有数百个代谢物；直接拼接矩阵会导致转录组在方差中占据压倒性统治地位，彻底淹没代谢组信号；
2. **多视图技术噪声与分布差异**：不同组学检测技术的数据尺度与信噪比截然不同（测序计数 vs 质谱连续强度）；
3. **样本缺失（Missing Data）极其普遍**：受实验成本或样本量限制，并非每个植物个体都能成功测全所有组学层；
4. **共享与特异变异的解耦需求**：传统 PCA 只能给出模糊的综合主成分，无法回答：哪些生物学变异是由转录组与代谢组协同驱动的？哪些表型变异仅仅是特定组学层（如表观修饰）独有的？

为了系统破解多组学整合难题，Argelaguet 等开发了 **MOFA+（Multi-Omics Factor Analysis v2）**。该方法构建在严格的贝叶斯多视图层级概率模型之上，通过引入自动相关性确定（ARD）先验与高效的随机变分推断（SVI），实现了在容忍大面积数据缺失的同时，自动识别潜在生物学因子并量化其在各组学层中的方差贡献率。

---

## 核心算法原理与数学推导

```
   [植物多组学异质数据视图 (Views)]
   ├─ View 1: 转录组 (RNA-seq)      ──► N × D_1
   ├─ View 2: 蛋白质组 (Proteomics)  ──► N × D_2
   ├─ View 3: 代谢组 (Metabolomics)  ──► N × D_3
                      │
                      ▼
        贝叶斯多视图潜在因子分解 (Bayesian Matrix Factorization)
        Y^(m) = Z · W^(m)T + ε^(m)
                      │
                      ├─────────────────────────────────────────┐
                      ▼                                         ▼
         样本潜在因子矩阵 Z (N × K)                 各视图特征权重 W^(m) (D_m × K)
         (刻画植物个体所处的综合生物状态)            (指示哪些基因/蛋白/代谢物驱动该因子)
                      │                                         │
                      ├─────────────────────────────────────────┤
                      ▼
         自动相关性确定先验 (ARD Prior on W^(m))
         └─ 精确关闭无关因子，区分【跨组学共享因子】与【单组学特异因子】
                      │
                      ▼
         随机变分推断 (Stochastic Variational Inference, SVI)
         └─ 极大化证据下界 (ELBO)，线性时间复杂度快速收敛
                      │
                      ▼
         方差解释率分解 (Variance Explained R^2 Analysis)
```

### 1. 概率生成矩阵分解模型 (Probabilistic Matrix Factorization)

设共有 $M$ 个组学视图（$m = 1, \dots, M$），对于第 $m$ 个组学矩阵 $Y^{(m)} \in \mathbb{R}^{N \times D_m}$（包含 $N$ 个共享样本，$D_m$ 个分子特征），模型将其低秩分解为：
$$Y^{(m)} = Z W^{(m)T} + \varepsilon^{(m)}$$
其中：
- $Z \in \mathbb{R}^{N \times K}$ 为**潜在因子矩阵（Latent Factors）**。每一行 $z_i \in \mathbb{R}^K$ 刻画第 $i$ 个植物样本在 $K$ 个潜在生物学主轴上的坐标；所有组学视图共享相同的 $Z$，从而建立起跨组学的语义桥梁；
- $W^{(m)} \in \mathbb{R}^{D_m \times K}$ 为第 $m$ 视图的**特征载荷权重矩阵（Feature Weights）**。每一列 $w_{\cdot, k}^{(m)}$ 刻画该组学中各分子特征与第 $k$ 个因子的关联强度；
- $\varepsilon^{(m)} \in \mathbb{R}^{N \times D_m}$ 为残差矩阵，其元素服从高斯分布 $\varepsilon_{id}^{(m)} \sim \mathcal{N}(0, 1/\tau_d^{(m)})$（支持高斯似然及泊松/伯努利广义指数族扩展）。

### 2. 自动相关性确定 (Automatic Relevance Determination, ARD)

为了让模型自主学习潜在因子的最优数量，并识别出哪些因子跨组学共享、哪些因子为某一组学特异，MOFA+ 引入了两级分层共轭先验：
1. 样本因子 $z_i$ 服从标准多元正态先验：
   $$z_{i, k} \sim \mathcal{N}(0, 1)$$
2. 权重矩阵中，第 $m$ 视图第 $k$ 因子的全列元素共享一个尺度精度超参数 $\alpha_{m, k}$：
   $$w_{d, k}^{(m)} \sim \mathcal{N}\left(0, \frac{1}{\alpha_{m, k}}\right)$$
   超参数 $\alpha_{m, k}$ 服从共轭 Gamma 先验：$\alpha_{m, k} \sim \text{Gamma}(a_0, b_0)$；
3. **ARD 物理意义**：
   - 若因子 $k$ 对视图 $m$ 的方差解释无贡献，模型在后验更新中将促使精度 $\alpha_{m, k} \to \infty$；
   - 结果导致该视图在该因子上的权重整列坍缩为 0（$w_{\cdot, k}^{(m)} \approx 0$），该因子在该组学中被完全“静音”；
   - 由此，若因子 $k$ 在所有组学中的 $\alpha$ 均有限，则其为**全组学共享核心因子**；若仅在代谢组有限，则为**代谢特异因子**。

### 3. 随机变分推断 (Stochastic Variational Inference, SVI)

由于真实后验分布 $P(Z, W, \alpha, \tau \mid Y)$ 在数学上不可积，早期基于马尔可夫链蒙特卡洛（MCMC）的方法难以计算。

MOFA+ 采用基于平均场假设（Mean-field Approximation）的随机变分推断：
1. 构建可分解的变分后验族 $q(Z, W, \alpha, \tau) = \prod q(z) \prod q(w) \dots$；
2. 目标是极大化证据下界（Evidence Lower Bound, ELBO）：
   $$\text{ELBO}(q) = \mathbb{E}_q [\log P(Y, Z, W, \alpha, \tau)] - \mathbb{E}_q [\log q(Z, W, \alpha, \tau)]$$
3. MOFA+ 通过引入小批量样本抽样（Mini-batching），在每次迭代中仅使用部分样本估计全局参数梯度的无偏估计，使得算法时间复杂度与样本量呈线性关系，不仅将单次拟合速度提升数十倍，更能轻松扩展至数万个单细胞多组学细胞矩阵中。

### 4. 方差解释率分解 ($R^2$ Decomposition)

为了对复杂的拟合结果进行无偏定量解读，MOFA+ 计算每个因子 $k$ 在各组学视图 $m$ 中解释的变异方差占比：
$$R^2_{m, k} = 1 - \frac{\sum_{i=1}^N \sum_{d=1}^{D_m} \left( y_{id}^{(m)} - z_{ik} w_{dk}^{(m)} \right)^2}{\sum_{i=1}^N \sum_{d=1}^{D_m} (y_{id}^{(m)})^2}$$
最终产出一幅 $M \times K$ 的方差贡献率热图，让科研人员直观洞察各层多组学变异的内在解耦关系。

---

## 植物多组学分析实践考量与避坑指南

| 植物组学特殊性 | 潜在统计与分析风险 | MOFA+ 规范对策与参数配置 |
| :--- | :--- | :--- |
| **特征维度极度失衡** | 转录组特征（30,000）是代谢组（300）的 100 倍。直接输入会导致隐变量全被 RNA 方差牵引。 | **特征预过滤与方差对齐**：对每个组学独立执行特征筛选（如转录组保留高变基因 top 2,500，蛋白质组保留 top 1,500，代谢组保留全部）。在运行 `create_mofa` 时开启 `scale_views = TRUE`，对每个视图的总方差进行等权缩放。 |
| **田间实验样本严重缺失** | 恶劣天气或取样损伤常导致部分单株未能测定蛋白质组或代谢组。 | **天然容忍缺失**：MOFA+ 会自动将缺失点在似然函数中掩盖（Masked out），直接基于可观测视图后验更新 $Z$；无需做粗暴的均值填充或直接删除宝贵的植物个体。 |
| **潜在因子的旋转不确定性** | 矩阵分解存在正负符号任意性（即 $Z \times W = (-Z) \times (-W)$）。因子的正负号本身不具备绝对生物学方向。 | 解释因子时，严禁单独根据 $z_i > 0$ 宣称“促进”；必须将样本因子得分 $Z$ 与该因子的特征载荷 $W$ 协同观察，或直接将 $Z$ 与已知生理农艺指标（如耐旱存活率、株高、生物量）进行多元回归分析。 |

---

## 典型分析命令与标准操作流

以下为基于 R 4.3+ 与 `MOFA2` 的标准多组学分析流程：

```r
library(MOFA2)
library(ggplot2)

# 1. 准备多组学表达矩阵列表 (所有矩阵列名对齐为植物样本 ID)
# 推荐对各组学分别完成标准化 (如 RNA-seq 经过 VST, 代谢组经过 Log 变换与 Pareto 缩放)
data_list <- list(
  Transcriptomics = as.matrix(read.csv("corn_rna_vst.csv", row.names = 1)),
  Proteomics      = as.matrix(read.csv("corn_protein_imputed.csv", row.names = 1)),
  Metabolomics    = as.matrix(read.csv("corn_metabolites_log.csv", row.names = 1))
)

# 2. 创建 MOFA 核心对象
mofa_obj <- create_mofa(data_list)

# 3. 设定模型训练超参数
# 设定初始因子数 K = 15; 模型将通过 ARD 自动关闭不显著因子
model_opts <- get_default_model_options(mofa_obj)
model_opts$num_factors <- 15

train_opts <- get_default_training_options(mofa_obj)
train_opts$convergence_mode <- "medium"    # 保证收敛充分
train_opts$seed <- 42
train_opts$verbose <- FALSE

data_opts <- get_default_data_options(mofa_obj)
data_opts$scale_views <- TRUE              # 极其关键: 消除组学间总体方差尺度的巨大偏倚

# 4. 准备并拟合 MOFA+ 模型 (底层调用 Python mofapy2 变分推断核心)
mofa_obj <- prepare_mofa(
  object = mofa_obj,
  data_options = data_opts,
  model_options = model_opts,
  training_options = train_opts
)

trained_mofa <- run_mofa(mofa_obj, outfile = "corn_multiomics_mofa.hdf5")

# 5. 可视化各组学方差解释率热图 (Variance Explained)
plot_variance_explained(trained_mofa, plot_total = TRUE)
plot_variance_explained(trained_mofa, x = "view", y = "factor")

# 6. 提取与农艺表型最相关的潜在因子 (关联分析)
sample_metadata <- read.csv("corn_phenotypes.csv", row.names = 1)
samples_metadata(trained_mofa) <- sample_metadata

correlate_factors_with_covariates(
  trained_mofa,
  covariates = c("Drought_Score", "Grain_Yield", "Chlorophyll_Content"),
  plot = "r"
)

# 7. 提取主效多组学因子 Top 权重驱动分子 (如 Factor 1 核心基因与代谢物)
top_weights_rna <- plot_top_weights(trained_mofa, view = "Transcriptomics", factor = 1, nfeatures = 10)
top_weights_met <- plot_top_weights(trained_mofa, view = "Metabolomics", factor = 1, nfeatures = 10)
```

---

## 科学研究案例与上下游分析协同

- **玉米多组学协同调控网络案例**：在玉米基因组、转录组、翻译组与代谢组的综合整合研究中，研究团队利用多视图潜在因子分解策略，成功在非监督状态下捕获了解释干旱与冷胁迫下生物量差异的核心共变潜变量。该因子在转录组层高度对应玉米抗逆转录因子（如 ZmNAC、ZmWRKY），同时在代谢组层强力负荷脯氨酸和脱落酸（ABA）等相容性渗透调节溶质，证实了多组学因子模型挖掘跨组学协同调控轴的高超能力；
- **分析工具流转与协作边界**：
  - **上游工具链**：转录组由 DESeq2/tximport 提供方差稳定矩阵，蛋白质组与代谢组分别由各自质谱定量流水线完成批次校正与质控后导入；
  - **下游分析承接**：MOFA+ 输出的低维样本坐标 $Z$ 可直接用于聚类分型，而其高权重特征子集（Top Loadings）则可无缝导入 WGCNA 或 Cytoscape 进行功能富集与调控通路深拓。
