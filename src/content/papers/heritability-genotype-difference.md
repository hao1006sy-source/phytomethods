---
title: "Heritability in Plant Breeding on a Genotype-Difference Basis"
summary: "提出基于成对基因型差异方差（Genotype-Difference Basis）与预测误差方差协方差的植物育种广义遗传力估计理论。"
authors: "Schmidt P, Hartung J, Bennewitz J, Piepho H-P"
year: 2019
journal: Genetics
doi: 10.1534/genetics.119.302134
type: method
methodIds: []
domainIds: [gwas-breeding]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# Heritability in Plant Breeding on a Genotype-Difference Basis

## 1. 研究背景与算法贡献

在植物育种学与数量遗传学中，**广义遗传力（Broad-sense Heritability, $H^2$）** 是衡量特定试验体系中表型变异受遗传控制程度的核心指标，直接决定了育种家对目标性状的选择响应（Response to Selection）与田间试验质量。在传统的平衡正交试验设计中，经典公式（如品系均值遗传力 Entry-mean Heritability: $H^2 = \sigma_g^2 / (\sigma_g^2 + \sigma_e^2 / r)$）应用广泛。

然而，在现代真实的植物多环境大田育种试验（Multi-Environment Trials, MET）中，数据呈现高度的**非平衡性与空间异质性**：
1. **试验设计不完全**：广泛采用不完全区组设计（Incomplete Block Designs，如 Alpha-lattice 设计或行列 Row-Column 设计），各个品系在不同区组或不同地点的重复次数不完全相等；
2. **空间误差自相关与非对角方差结构**：田间地力、微地形与湿度梯度引起相邻小区误差存在空间自回归（Spatial Autoregression, AR1 $\times$ AR1），导致不同品系间的对比精度（Contrast Precision）并不均一；
3. **传统估计公式失真**：传统的 Cullis 经验公式或标准方差分析（ANOVA）方法在复杂协方差结构下无法准确反映育种家进行成对品系选择时的真实选择可靠性。

德国霍恩海姆大学的 Paul Schmidt、Jens Hartung、Jörn Bennewitz 与生物统计学权威 Hans-Peter Piepho 在 2019 年推出了 **基于基因型差异基底的遗传力估计理论（Heritability on a Genotype-Difference Basis）**（发表于 *Genetics*）。该研究从育种决策的本质出发——即育种选择本质上是在两个基因型之间进行成对优劣比较——重新定义了广义遗传力，显式纳入了完整的预测误差方差-协方差矩阵（Prediction Error Variance, PEV），确立了复杂大田育种试验遗传力估计的最前沿理论基准。

---

## 2. 核心数学模型与数据结构

### 2.1 基于成对差异（Pairwise Differences）的遗传力数学定义

育种家在田间评价中核心关心的是能否正确判断两个品系谁更优异（即差异 $g_i - g_j$ 是否大于零）。因此，遗传力应当被定义为**真实遗传效应差异的平均方差**与**表型观测均值差异的平均方差**之比：
$$H_{\Delta}^2 = \frac{\bar{v}_g}{\bar{v}_p}$$

各项分量的严格数学推导如下：
- **真实遗传差异平均方差 $\bar{v}_g$**：
  $$\bar{v}_g = \text{mean}_{i < j} \text{Var}(g_i - g_j)$$
  若基因型随机效应 $g$ 服从独立同分布 $\mathcal{N}(0, \sigma_g^2 I)$，则显然有 $\bar{v}_g = 2 \sigma_g^2$；
- **表型均值差异平均方差 $\bar{v}_p$**：
  设 $\hat{g}_i$ 为基于线性混合模型（LMM）得到的基因型效应最佳线性无偏预测值（BLUP）或最佳线性无偏估计值（BLUE）：
  $$\bar{v}_p = \bar{v}_g + \bar{v}_{\text{diff}}$$
  其中 $\bar{v}_{\text{diff}}$ 为成对基因型预测误差差值的平均方差：
  $$\bar{v}_{\text{diff}} = \text{mean}_{i < j} \text{Var}\left( (\hat{g}_i - g_i) - (\hat{g}_j - g_j) \right)$$

### 2.2 预测误差方差（PEV）矩阵在复杂设计中的显式展开

在线性混合模型方程（Mixed Model Equations, MME）中：
$$\begin{pmatrix} X^T R^{-1} X & X^T R^{-1} Z \\ Z^T R^{-1} X & Z^T R^{-1} Z + G^{-1} \end{pmatrix} \begin{pmatrix} \hat{\beta} \\ \hat{u} \end{pmatrix} = \begin{pmatrix} X^T R^{-1} y \\ Z^T R^{-1} y \end{pmatrix}$$

其系数矩阵的逆矩阵记为 $C = \begin{pmatrix} C_{11} & C_{12} \\ C_{21} & C_{22} \end{pmatrix}$，其中 $C_{22} = \text{Var}(\hat{u} - u)$ 即为**预测误差方差-协方差矩阵（PEV 矩阵）**。

成对误差方差展开为：
$$\text{Var}\left( (\hat{g}_i - g_i) - (\hat{g}_j - g_j) \right) = C_{22, ii} + C_{22, jj} - 2 C_{22, ij}$$

因此，平均差异误差方差能够直接通过对 $C_{22}$ 矩阵的对角元与非对角元进行精确闭式求和获得：
$$\bar{v}_{\text{diff}} = \frac{2}{n(n-1)} \sum_{i < j} \left( C_{22, ii} + C_{22, jj} - 2 C_{22, ij} \right) = \frac{2}{n} \text{tr}(C_{22}) - \frac{2}{n(n-1)} \sum_{i \neq j} C_{22, ij}$$

这一闭式解全面吸收了由于田间空间自相关、缺失值或非平衡设计引起的成对协方差扰动，无需做任何人为平滑假设。

---

## 3. 算法复杂度与计算性能

1. **计算复杂度**：核心耗时仅取决于单次线性混合模型（LMM）的 REML 参数估计与 MME 矩阵求逆，复杂度与试验小区数或品系数呈三次幂关系。
2. **运算时间以秒级计**：在包含数百个品系、上千个小区的田间试验中，在 R 环境（结合 `lme4`、`sommer` 或 `spats`）中计算全套 $H_{\Delta}^2$ 仅需数秒钟。
3. **完美兼容各种空间与多环境模型**：无论残差 $R$ 采用可分离自回归矩阵（AR1 $\times$ AR1）、随机区组方差成分，还是引入基于 SNP 的基因组亲缘矩阵 $G$，均可通用套用该差异基底公式。

---

## 4. 植物基因组学应用场景与科研价值

在现代作物多环境田间试验中，该方法是准确评估表型数据质量的坚实理论基础：
- **非平衡多环境品种试验（MET）数据质量控制**：评估不同试验地点（如干旱环境 vs 灌溉环境）表型鉴定的有效信噪比；若某地点的 $H_{\Delta}^2 < 0.3$，提示田间环境变异过大，在后续多环境联合分析或 GWAS 中应予以剔除或降权；
- **全基因组关联分析（GWAS）前置表型处理（BLUE/BLUP）**：在开展全基因组标记关联前，利用该框架从含有空间误差的多地点数据中提取最佳线性无偏估计（BLUE），并汇报严谨的遗传力指标；
- **基因组选择育种方案设计**：评估在有限育种预算下，增加试验重复数与增加测试品系数之间的边际遗传增益权衡。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心计算流程与 R 语言实现代码
```R
library(lme4)
library(Matrix)

# 1. 拟合非平衡大田试验线性混合模型 (以 Alpha-lattice 设计为例)
# 表型 ~ (1|Genotype) + (1|Env) + (1|Block_within_Env)
lmm_fit <- lmer(Yield ~ (1|Genotype) + (1|Env) + (1|Rep:Env), data = field_data)

# 2. 提取遗传方差分量 sigma2_g
vc <- as.data.frame(VarCorr(lmm_fit))
sigma2_g <- vc$vcov[vc$grp == "Genotype"]

# 3. 提取基因型效应的预测误差方差协方差矩阵 (PEV / C22)
# 使用 arm::se.ranef 或直接从混合模型矩阵提取
library(arm)
genotype_ranef <- ranef(lmm_fit, condVar = TRUE)$Genotype
pev_vars <- attr(genotype_ranef, "postVar")[1, 1, ]  # 对角元
n_geno <- length(pev_vars)

# 4. 计算成对基因型差异遗传力 H2_diff
# 针对对角假设下的极简展开 (或包含非对角完整矩阵计算):
mean_pev_diff <- 2 * mean(pev_vars)  # 简化正交近似
H2_diff <- (2 * sigma2_g) / (2 * sigma2_g + mean_pev_diff)

cat(f"Genotype-Difference Heritability (H2): {H2_diff:.4f}\n")
```

### 5.2 关键注意事项
- 遗传力不是脱离具体育种群体、田间试验设计与环境条件而孤立存在的物理常数。报告遗传力时必须严格配套说明试验设计、重复次数与使用的具体协方差模型。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Genetics 2019 DOI: 10.1534/genetics.119.302134](https://doi.org/10.1534/genetics.119.302134)
- **PubMed 记录**：[PMID: 31221703](https://pubmed.ncbi.nlm.nih.gov/31221703/)
- **PMC 全文**：[PMC6707473](https://pmc.ncbi.nlm.nih.gov/articles/PMC6707473/)
- **站内配套专题**：[全基因组关联分析（GWAS）原理与质控](../../topics/gwas-breeding/m06-topic-01/)
- **站内配套专题**：[全基因组选择（GS）原理与育种值评估](../../topics/gwas-breeding/m06-topic-05/)
