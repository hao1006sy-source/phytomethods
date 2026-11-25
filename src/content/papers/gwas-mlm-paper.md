---
title: "A unified mixed-model method for association mapping that accounts for multiple levels of relatedness"
summary: "提出同时整合宏观群体结构（Q）与多层次亲缘关系（K）的统一混合线性模型（Unified MLM）关联分析理论框架。"
authors: "Yu J, Pressoir G, Briggs WH, et al."
year: 2006
journal: Nature Genetics
doi: 10.1038/ng1702
type: method
methodIds: []
domainIds: [gwas-breeding]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# A unified mixed-model method for association mapping that accounts for multiple levels of relatedness: The Q+K MLM

## 1. 研究背景与算法贡献

在动植物遗传学与人类遗传学领域，全基因组关联分析（GWAS）利用自然历史演化过程中数千代减数分裂积累的重组事件，能够在极小物理尺度上实现数量性状基因（Quantitative Trait Loci, QTL）的单基因乃至单碱基水平高精度定位。然而，在 GWAS 诞生初期，自然种质资源群体中普遍存在着严峻的混杂因素：
1. **宏观群体历史分化（Population Stratification / Structure）**：由于地理隔离、人工驯化选择或适应性分化，不同亚群（如水稻籼粳亚种、玉米热带与温带自交系）在全基因组等位基因频率与表型均值上存在系统性差异；
2. **多层次亲缘交织（Complex Relatedness / Family Kinship）**：个体之间往往具有不同程度的血缘亲近关系（如全同胞、半同胞、近交系或远系表亲）。

若直接采用常规广义线性模型（GLM）或基于等位基因的卡方检验，由于因果标记与全基因组背景多态性的假性连锁，会导致全基因组范围内产生灾难性的**假阳性膨胀（False Positives Inflation）**。

2006 年，康奈尔大学与 USDA-ARS 的 Jianming Yu（喻九阳）、Gael Pressoir、William H. Briggs、Edward S. Buckler 等在 *Nature Genetics* 上推出了里程碑式的 **$Q+K$ 统一混合线性模型（Unified Mixed-Model Method）**。该方法首次在数学上将**群体宏观分层（以固定效应矩阵 $Q$ 建模）** 与 **全基因组多基因背景微观亲缘关系（以随机效应协方差矩阵 $K$ 建模）** 完美统合在一个严谨的统计框架中，在彻底压制系统性假阳性的同时保持了极佳的检验灵敏度，确立了全球动植物与人类复杂性状遗传关联分析的奠基性理论范式。

---

## 2. 核心数学模型与数据结构

### 2.1 统一混合线性方程（Unified Mixed Model Formulation）

对于包含 $n$ 个个体的表型测量值向量 $y$（大小为 $n \times 1$），$Q+K$ 混合线性模型表示为：
$$y = X\alpha + Q\beta + Zu + e$$

各项参数的严密统计学定义如下：
- $X\alpha$：**候选候选位点标记固定效应**。$X$ 为标记基因型设计矩阵（通常按纯合参考、杂合、纯合突变编码为 0, 1, 2），$\alpha$ 为待估计与检验的等位基因加性效应值；
- $Q\beta$：**群体宏观结构固定效应**。$Q$（大小为 $n \times k$）通常为利用 STRUCTURE 软件推导的个体归属于各个分层亚群的后验血统比例矩阵，或基于全基因组主成分分析（PCA）得到的前几个主成分得分矩阵（即 $P$ 矩阵）；$\beta$ 为各亚群的效应向量；
- $Zu$：**多基因背景微观亲缘随机效应**。$Z$ 为关联个体与表型记录的设计矩阵（通常为单位阵 $I$），$u$ 为个体未知的加性多基因遗传背景向量，假定服从多元正态分布：
  $$u \sim \mathcal{N}\left(0, 2K\sigma_a^2\right)$$
  其中 $\sigma_a^2$ 为加性遗传方差分量，$K$（大小为 $n \times n$）为基于全基因组高密度中性标记计算的**个体间成对亲缘关系矩阵（Kinship Matrix / Realized Relationship Matrix）**；
- $e$：**环境与不可测误差随机向量**，服从独立同分布的多元正态分布：
  $$e \sim \mathcal{N}\left(0, I\sigma_e^2\right)$$
  其中 $\sigma_e^2$ 为残差方差分量。

### 2.2 表型方差-协方差结构与方差组分估计

表型向量 $y$ 的总方差-协方差矩阵 $V$ 为：
$$V = \text{Var}(y) = 2 Z K Z^T \sigma_a^2 + I \sigma_e^2 = \sigma_a^2 \left( 2 Z K Z^T + \lambda I \right)$$

其中 $\lambda = \sigma_e^2 / \sigma_a^2$ 为方差组分比率。

在参数求解过程中：
1. 采用**受限极大似然法（Restricted Maximum Likelihood, REML）** 或基于期望最大化（EM）算法估计方差组分 $\sigma_a^2$ 与 $\sigma_e^2$；
2. 在方差组分固定后，通过广义最小二乘法（GLS）求解固定效应：
   $$\begin{pmatrix} \hat{\alpha} \\ \hat{\beta} \end{pmatrix} = \left( W^T V^{-1} W \right)^{-1} W^T V^{-1} y, \quad W = (X, Q)$$
3. 构建基于 Wald 检验或 $F$ 检验的统计量，评估候选位点效应 $\alpha \neq 0$ 的显著性 $p$ 值。

---

## 4. 植物基因组学应用场景与科研价值

植物具有极其复杂的地理演化与交配生活史（自交、异交、无融合生殖）：
- **玉米开花期核心因果基因精细定位**：在原始论文中，Yu 等人利用该模型对包含热带与温带系混合的 277 份玉米自然多样性面板进行了开花期（Days to Pollen shed）关联分析，成功消除了背景群体结构的假关联，以极高的信噪比精准定位了经典开花关键基因 *d8*（Dwarf8）和 *vgt1*；
- **水稻籼粳分化与耐冷耐盐碱 QTL 定位**：水稻天然分为籼稻（*indica*）与粳稻（*japonica*）两大亚种，两者在成千上万个位点上存在等位基因频率巨大分化。$Q+K$ 模型成为在混合水稻群体中开展 GWAS 的强制性标准模型；
- **全基因组曼哈顿图与 Q-Q 图的统计规范**：确立了利用 Q-Q 图偏离度评估模型是否有效控制通胀因子（Genomic Inflation Factor, $\lambda_{GC} \approx 1$）的标准范式。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Nature Genetics 2006 DOI: 10.1038/ng1702](https://doi.org/10.1038/ng1702)
- **PubMed 记录**：[PMID: 16380716](https://pubmed.ncbi.nlm.nih.gov/16380716/)
- **TASSEL 软件官方主页**：[TASSEL Official Website](https://www.maizegenetics.net/tassel)
- **站内配套专题**：[全基因组关联分析（GWAS）原理与质控](../../topics/gwas-breeding/m06-topic-01/)
- **站内配套专题**：[多位点 GWAS 模型与统计功效](../../topics/gwas-breeding/m06-topic-02/)
