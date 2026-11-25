---
title: "MOFA+: a statistical framework for comprehensive integration of multi-modal single-cell data"
summary: "提出基于贝叶斯多组学潜在因子分析（MOFA+）与随机变分推断的多视图、多组单细胞与群体数据整合框架。"
authors: "Argelaguet R, Arnol D, Bredikhin D, et al."
year: 2020
journal: Genome Biology
doi: 10.1186/s13059-020-02015-1
type: method
methodIds: [mofa-plus]
domainIds: [regulatory-genomics-ai, single-cell-spatial-omics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# MOFA+: a statistical framework for comprehensive integration of multi-modal single-cell data

## 1. 研究背景与算法贡献

在现代多模态系统生物学中，针对同一生物样本（如单细胞、植物组织或作物杂交群体）同时测定多层级的分子组学数据已成为前沿趋势，包括基因组变异（SNPs/InDels）、转录组（RNA-seq）、表观组（DNA 甲基化与 ATAC-seq 可及性）以及蛋白质组/代谢组。然而，多组学数据的联合分析长期面临三大统计瓶颈：
1. **多重异质性与测序噪声交织**：不同组学模态具有截然不同的技术噪声、测序深度以及数据分布（如 RNA 的离散计数、甲基化的二值比例、蛋白质组的连续丰度）；
2. **缺乏区分“模态共享”与“模态独有”信号的机制**：简单将多模态数据拼接执行 PCA 会被变异最大的单一组学主导，无法解析哪些生物学过程是由多组学协同驱动的，哪些是特定单一模态独有的调控程序；
3. **样本缺失与批次组结构复杂**：部分样本可能缺失特定模态，且实验常包含不同的条件分组（如不同发育时期、不同地理环境）。

EMBL 与德国癌症研究中心的 Ricard Argelaguet、Damien Arnol、Danila Bredikhin 与 Oliver Stegle 等在 2020 年推出了 **MOFA+**（Multi-Omics Factor Analysis v2，发表于 *Genome Biology*）。MOFA+ 确立了非监督多组学数据整合的全新理论框架：
- 构建了高度通用的**广义分层贝叶斯潜在因子分解模型（Bayesian Latent Factor Model）**；
- 支持任意**多视图（Multi-view，不同组学类型）** 与 **多组（Multi-group，不同批次/实验条件）** 的灵活矩阵分解；
- 引入**自动相关性判定（Automatic Relevance Determination, ARD）** 层次稀疏先验，自适应无偏确定有效潜在维度；
- 借助**随机变分推断（Stochastic Variational Inference, SVI）** 实现了可无缝扩展至数十万级单细胞与大规模群体的闪电级收敛。

---

## 2. 核心数学模型与数据结构

### 2.1 多组多视图潜在因子生成模型

设数据包含 $M$ 个组学视图（Views, $m \in \{1,\dots,M\}$）与 $G$ 个实验分组（Groups, $g \in \{1,\dots,G\}$）。观测矩阵 $Y_{g,m}$（大小为 $N_g \times D_m$）被分解为低维共享因子与模态特异权重的内积加噪声：
$$Y_{g,m} = Z_g W_m^T + \epsilon_{g,m}$$

其中：
- $Z_g$ 为属于组 $g$ 的样本在 $K$ 个潜在因子（Factors）上的得分矩阵（大小为 $N_g \times K$），捕获样本间的全局生物学异质性；
- $W_m$ 为组学模态 $m$ 的特征权重矩阵（Loadings，大小为 $D_m \times K$），刻画特定分子特征（如基因、Peak、蛋白）对特定因子的贡献强度；
- $\epsilon_{g,m}$ 为模态特异的技术噪声残差。

### 2.2 自动相关性判定（ARD）与非高斯似然支持

为避免人为指定潜在因子数目 $K$：
- 对权重矩阵 $W_m$ 的每一列（即因子 $k$ 对应模态 $m$ 的权重向量）赋予分层零均值高斯先验，其精度参数 $\alpha_{mk}$ 服从 Gamma 先验：
  $$p(w_{dmk} \mid \alpha_{mk}) = \mathcal{N}\left(0, \alpha_{mk}^{-1}\right), \quad p(\alpha_{mk}) = \text{Gamma}\left(a_0, b_0\right)$$
- 若因子 $k$ 在模态 $m$ 中对数据解释度微弱，其精度 $\alpha_{mk} \to \infty$，使得整个权重向量被强力收缩为精确的零向量。这使得 MOFA+ 能够自动将因子分类为：
  - **跨模态共享因子（Shared Factors）**：在多个组学视图中权重均显著非零；
  - **模态独有因子（Private Factors）**：仅在特定单一组学视图中活跃。
- **异构似然模型**：支持连续高斯似然（微阵列/标准化表达量）、泊松似然（RNA-seq 计数）以及伯努利似然（scATAC 二值化开放状态）。

### 2.3 随机变分推断（Stochastic Variational Inference）

传统变分推断需要每轮迭代扫描全部数据。MOFA+ 实现了按样本 mini-batch 采样的随机变分推断，使得计算复杂度与单批次样本量解耦，极大提升了对数十万单细胞或海量重测序多组学群体的计算可扩展性。

---

## 4. 植物基因组学应用场景与科研价值

植物具有极其复杂的环境适应网络，多组学联合分析是现代智慧育种与功能基因组学的核心支撑：
- **作物基因组-转录组-蛋白质组-代谢组整合**：在玉米或水稻多亲本杂交群体中，MOFA+ 能够将重测序变异、表达谱、核糖体翻译谱（Ribo-seq）与靶向代谢组深度融合，清晰剥离出“基因型驱动的基础代谢共享因子”与“转录后翻译调控特有的抗逆因子”；
- **植物单细胞多模态（scRNA + scATAC）对齐**：在植物根尖或叶片原生质体单细胞多组学实验中，推断跨越染色质可及性与转录激活的连续共变轨迹；
- **全基因组关联（eQTL/pQTL）靶标降维**：将数万维度的转录组与蛋白质组压缩为少数几个具有明确生物学通路的潜在因子，作为综合表型直接对接 GWAS 关联定位。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Genome Biology 2020 DOI: 10.1186/s13059-020-02015-1](https://doi.org/10.1186/s13059-020-02015-1)
- **PubMed 记录**：[PMID: 32571353](https://pubmed.ncbi.nlm.nih.gov/32571353/)
- **MOFA2 官方主页与完整教程**：[MOFA2 Documentation](https://biofam.github.io/MOFA2/)
- **源码仓库**：[biofam/MOFA2 GitHub](https://github.com/biofam/MOFA2)
- **站内配套专题**：[单细胞多组学整合分析](../../topics/single-cell-spatial-omics/m08-topic-05/)
- **站内配套专题**：[转录组学差异表达与统计模型](../../topics/regulatory-genomics-ai/m09-topic-02/)
