---
title: RNA-seq 差异表达分析：负二项广义线性模型、经验贝叶斯离散度收缩与 Wald 检验
summary: 深入推导 RNA-seq 计数过度离散负二项模型、中位数比值法文库因子估计、经验贝叶斯离散度向趋势收缩、apeglm 对数倍数变化稳健估计及 Wald 假设检验。
domain: regulatory-genomics-ai
methods: [deseq2]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：离散计数、小样本重复与过度离散噪声

转录组高通量测序（RNA-seq）测定的是离散的核酸读段计数（Read Counts）。在理想的技术重复抽样中，计数严格遵循泊松分布（Poisson Distribution），其理论方差等于均值（$\text{Var}(Y) = \mu$）。

然而，在植物真实的生物学实验中：
1. **过度离散现象**（Overdispersion）：受植物个体遗传变异、生长微环境以及生理状态波动的叠加影响，生物学重复间的实际方差往往**远大于均值**（$\text{Var}(Y) > \mu$）。若强行套用泊松模型，会导致方差被严重低估，产生灾难性的假阳性爆发；
2. **小样本量瓶颈**：受制于高昂的实验成本与繁杂的采样制样限制，植物转录组测序通常仅设置 $3 \sim 4$ 个独立生物学重复。在如此微小的样本量下，单个基因独立估计的方差极不可靠，必须依赖**经验贝叶斯跨基因信息借用**（Empirical Bayes Shrinkage）来稳定统计推断。

![DESeq2 差异表达分析：经验贝叶斯离散度收缩与稳健 MA 模型](/phytomethods/images/topics/m09/deseq2-dispersion-shrinkage-and-ma-plot.svg)

---

## 算法数学推导：负二项广义线性模型与经验贝叶斯收缩

### 1. 负二项分布（Negative Binomial, NB）广义线性模型

设基因 $i$ 在样本 $j$ 中的原始比对读段计数为 $K_{ij}$，DESeq2（*Love et al., Genome Biology, 2014*）假定其服从负二项分布：
$$K_{ij} \sim \text{NB}(\mu_{ij}, \alpha_i)$$
其概率质量函数为：
$$P(K_{ij} = k) = \frac{\Gamma(k + \alpha_i^{-1})}{\Gamma(k + 1)\Gamma(\alpha_i^{-1})} \left( \frac{\alpha_i^{-1}}{\mu_{ij} + \alpha_i^{-1}} \right)^{\alpha_i^{-1}} \left( \frac{\mu_{ij}}{\mu_{ij} + \alpha_i^{-1}} \right)^k$$
其期望均值与方差分解方程为：
$$\mathbb{E}[K_{ij}] = \mu_{ij}$$
$$\text{Var}(K_{ij}) = \mu_{ij} + \alpha_i \mu_{ij}^2$$
其中 $\alpha_i$ 为基因特异的**离散度参数**（Dispersion Parameter）：
- 当 $\alpha_i \to 0$ 时，退化为泊松分布；
- $\alpha_i \mu_{ij}^2$ 项精准刻画了独立于技术泊松噪声的植物真实生物学变异。

### 2. 中位数比值法（Median of Ratios）文库大小因子估计

不同文库的测序深度和植物组织中超高丰度转录本（如 Rubisco 核酮糖二磷酸羧化酶小亚基）的极端占比，会引起系统性组成偏倚。DESeq2 引入样本尺度因子（Size Factor, $s_j$）：
$$\mu_{ij} = s_j q_{ij}, \quad \log_2(q_{ij}) = \mathbf{x}_j^T \boldsymbol{\beta}_i$$

**中位数比值法推导**：
1. 构建所有样本几何平均构成的伪参考样本（Pseudo-reference）：
   $$K_{i, \text{geom}} = \left( \prod_{r=1}^{m} K_{ir} \right)^{1/m}$$
2. 对样本 $j$，计算所有基因原始计数与几何平均的比值，取非零中位数作为其文库大小因子：
   $$s_j = \text{median}_{i: K_{i, \text{geom}} > 0} \left( \frac{K_{ij}}{K_{i, \text{geom}}} \right)$$
*数学优势*：中位数具有极高的稳健崩溃点（Breakdown Point 达 50%），即使组织中有高达 40% 的基因在处理后发生剧烈上调，该因子也能精准锁定未变基因的真实基准线。

### 3. 经验贝叶斯局部离散度收缩（Empirical Bayes Dispersion Shrinkage）

1. **极大似然单基因估计**（Gene-wise MLE）：
   对每个基因单独求解对数似然最大化，得到离散度初值 $\hat{\alpha}_i^{\text{MLE}}$；
2. **全基因组平均趋势拟合**（Fitted Trend）：
   在 $(\bar{\mu}_i, \hat{\alpha}_i^{\text{MLE}})$ 坐标系上利用局部多项式伽马 GLM 拟合平滑先验趋势曲线：
   $$\alpha_{\text{trend}}(\mu) = \frac{a_0}{\mu} + a_1$$
3. **最大后验估计**（MAP Shrinkage）：
   构建经验贝叶斯正态先验分布，求解最大后验概率估计 $\hat{\alpha}_i^{\text{MAP}}$：
   $$\log \hat{\alpha}_i^{\text{MAP}} = \arg\max_{\alpha} \left[ \ell_i(\alpha) - \frac{(\log \alpha - \log \alpha_{\text{trend}}(\mu_i))^2}{2 \sigma_{\text{prior}}^2} \right]$$
   - 散点围绕红线强力收缩，大幅平抑低样本量下的抽样随机性；
   - 若某基因的原始离散度极大（偏离趋势线超过 3 倍残差标准差），算法自动认定其为生物学特异离群值，保留原值不强行收缩（Outlier Protection）。

### 4. 假设检验与假发现率（FDR）多重校正

对设计矩阵中的处理效应参数 $\beta_{ir}$（即对数倍数变化 $\log_2\text{FC}$），构建 **Wald 检验统计量**：
$$W_i = \frac{\hat{\beta}_{ir}}{\text{SE}(\hat{\beta}_{ir})}$$
在零假设（$H_0: \beta_{ir} = 0$）下，$W_i \sim \mathcal{N}(0, 1)$。
随后采用 **Benjamini-Hochberg (BH) 算法** 对全基因组 $P$ 值进行多重校正：
$$q_i = \min_{k \ge i} \left( \frac{m \cdot P_{(k)}}{k} \right)$$
严格将全基因组差异基因筛选的假发现率控制在预设水平（如 $q < 0.05$）。

---

## 真实植物科研案例：玉米抗旱转录组分析

### 玉米苗期干旱胁迫转录组差异分析（*Zhang et al., PLOS ONE, 2019*）
在对玉米耐旱自交系（Han21）与干旱敏感自交系（Ye478）进行梯度脱水胁迫试验中：
- 采用 DESeq2 负二项广义线性模型设定双因素交互设计 `~ Genotype + Treatment + Genotype:Treatment`；
- 利用经验贝叶斯离散度收缩，成功在 3 个生物学重复的约束下，从 39,000 个检测基因中精准锁定了 2,140 个具有极显著基因型×环境交互效应的抗旱候选基因；
- 差异基因高度富集于脱落酸（ABA）信号转导通路（*NCED3*、*PP2C*）与脯氨酸合成酶系。

---

## 关联工具与复现入口

- **DESeq2**：基于 R/Bioconductor 的差异表达分析黄金标准包，提供 `DESeqDataSetFromMatrix`、`DESeq` 与 `lfcShrink` 核心功能。
- 参见[DESeq2 原始方法文献解读](../../../papers/deseq2-2014/)与[玉米干旱胁迫差异表达文献](../../../papers/maize-drought-deseq2-2019/)。
