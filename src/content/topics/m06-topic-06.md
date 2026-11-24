---
title: 全基因组选择：GBLUP、rrBLUP 与贝叶斯育种值预测理论
summary: 深入推导 Meuwissen 2001 标记效应模型、GBLUP 与 rrBLUP 数学等价性证明、Henderson 混合模型方程组求解、贝叶斯字母表 (BayesA/B/C) 以及五折交叉验证与数据泄漏规避。
domain: gwas-breeding
methods: [gapit, rrblup]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：从标记辅助选择（MAS）到全基因组微效捕获

传统分子标记辅助选择（Marker-Assisted Selection, MAS）仅聚焦于极少数具有大效应的主效 QTL 或抗病抗虫单基因（如水稻 *Xa21*、*Sub1A*）。然而，对于决定最终粮食产量与品质的大多数关键数量性状（如玉米单株粒重、小麦出粉率、大豆百粒重），其遗传架构由全基因组成千上万个微效多基因（Minor Polygenes）共同决定。这些微效基因单个的统计检验效应均无法达到严苛的 Bonferroni 显著性阈值，因而在常规 GWAS 中被彻底漏检。

Meuwissen, Hayes & Goddard（2001）提出了颠覆性的**全基因组选择**（Genomic Selection, GS）理论：不再强求鉴别单个标记的显著性，而是将全基因组所有高密度分子标记同时作为随机效应纳入模型，综合评估每个候选个体的**基因组估计育种值**（Genomic Estimated Breeding Value, GEBV），在作物幼苗期即可直接进行精准淘汰与优良亲本选配，使作物育种周期大幅缩短 50% 以上。

![全基因组选择与 GBLUP 育种值预测及交叉验证机制](/phytomethods/images/topics/m06/genomic-selection-gblup-and-cross-validation.svg)

---

## 算法数学推导：GBLUP、rrBLUP 等价性与贝叶斯字母表

### 1. 岭回归最佳线性无偏预测（rrBLUP，标记效应模型）

设训练群体包含 $n$ 个个体，$m$ 个双等位 SNP 标记（$m \gg n$）。建立标记效应线性回归模型：

$$\mathbf{y} = \mathbf{X}\boldsymbol{\beta} + \mathbf{Z}\mathbf{a} + \boldsymbol{\epsilon}$$

其中：
- $\mathbf{X}\boldsymbol{\beta}$ 为环境、地点等固定效应；
- $\mathbf{Z} \in \mathbb{R}^{n \times m}$ 为中心化标记基因型矩阵（元素为 $M_{ij} - 2p_j$）；
- $\mathbf{a} \in \mathbb{R}^m$ 为每个标记的微效加性效应向量，假定所有标记独立服从均值为 0、方差相同的正态先验分布：
  $$\mathbf{a} \sim N(\mathbf{0}, \mathbf{I}_m \sigma_a^2)$$
- $\boldsymbol{\epsilon} \sim N(\mathbf{0}, \mathbf{I}_n \sigma_e^2)$ 为独立随机误差向量。

对标记效应施加 $L_2$ 范数惩罚（岭回归 Ridge Regression），求解目标函数：

$$\min_{\boldsymbol{\beta}, \mathbf{a}} \|\mathbf{y} - \mathbf{X}\boldsymbol{\beta} - \mathbf{Z}\mathbf{a}\|_2^2 + \lambda \|\mathbf{a}\|_2^2, \quad \lambda = \frac{\sigma_e^2}{\sigma_a^2}$$

解得标记效应的最佳线性无偏预测值（BLUP）：

$$\hat{\mathbf{a}} = (\mathbf{Z}^T \mathbf{Z} + \lambda \mathbf{I}_m)^{-1} \mathbf{Z}^T (\mathbf{y} - \mathbf{X}\hat{\boldsymbol{\beta}})$$

### 2. 基因组最佳线性无偏预测（GBLUP，个体效应模型）

在 GBLUP 中，我们将模型视角由 $m$ 个标记维度切换回 $n$ 个个体维度，直接将个体遗传效应聚合为一个多变量复合随机效应：

$$\mathbf{y} = \mathbf{X}\boldsymbol{\beta} + \mathbf{u} + \boldsymbol{\epsilon}, \quad \mathbf{u} \sim N(\mathbf{0}, \mathbf{G}\sigma_g^2)$$

其中 $\mathbf{G}$ 为基于标记构建的 VanRaden（2008）基因组关系矩阵：

$$\mathbf{G} = \frac{\mathbf{Z}\mathbf{Z}^T}{c}, \quad c = 2\sum_{j=1}^m p_j(1 - p_j)$$

总加性遗传方差与单个标记方差之间满足解析关系：$\sigma_g^2 = c \cdot \sigma_a^2$。

### 3. rrBLUP 与 GBLUP 的完全数学等价性证明

定义个体遗传效应向量为所有标记效应的线性累加：$\mathbf{u} = \mathbf{Z}\mathbf{a}$。计算 $\mathbf{u}$ 的理论方差-协方差矩阵：

$$\text{Var}(\mathbf{u}) = \text{Var}(\mathbf{Z}\mathbf{a}) = \mathbf{Z} \text{Var}(\mathbf{a}) \mathbf{Z}^T = \mathbf{Z} (\mathbf{I}_m \sigma_a^2) \mathbf{Z}^T = \mathbf{Z}\mathbf{Z}^T \sigma_a^2$$

将 $c = 2\sum p_j(1-p_j)$ 代入 $\mathbf{G} = \frac{\mathbf{Z}\mathbf{Z}^T}{c}$ 与 $\sigma_g^2 = c \sigma_a^2$：

$$\text{Var}(\mathbf{u}) = \mathbf{Z}\mathbf{Z}^T \left( \frac{\sigma_g^2}{c} \right) = \left( \frac{\mathbf{Z}\mathbf{Z}^T}{c} \right) \sigma_g^2 = \mathbf{G}\sigma_g^2$$

根据矩阵求逆引理（Woodbury Matrix Identity）：

$$\mathbf{Z}^T (\mathbf{Z}\mathbf{Z}^T + \lambda \mathbf{I}_n)^{-1} = (\mathbf{Z}^T \mathbf{Z} + \lambda \mathbf{I}_m)^{-1} \mathbf{Z}^T$$

**结论**：在先验假定所有位点效应方差一致的条件下，rrBLUP 与 GBLUP 在数学上**严格等价**。对于任何未知候选植株 $k$（基因型向量为 $\mathbf{z}_k$），利用 rrBLUP 预测的育种值 $\hat{y}_k = \mathbf{z}_k^T \hat{\mathbf{a}}$ 与利用 GBLUP 亲缘矩阵推导的 $\hat{y}_k = \mathbf{g}_{k, \text{train}} \mathbf{G}_{\text{train}}^{-1} \hat{\mathbf{u}}$ 结果完全相同。计算时，当 $n < m$ 时求解 GBLUP 更快，当 $n > m$ 时求解 rrBLUP 更快。

### 4. 混合模型方程组（Henderson's MME）数值求解

构建 Henderson（1975）混合模型方程组：

$$\begin{bmatrix} \mathbf{X}^T \mathbf{X} & \mathbf{X}^T \\ \mathbf{X} & \mathbf{I}_n + \mathbf{G}^{-1}\frac{\sigma_e^2}{\sigma_g^2} \end{bmatrix} \begin{bmatrix} \hat{\boldsymbol{\beta}} \\ \hat{\mathbf{u}} \end{bmatrix} = \begin{bmatrix} \mathbf{X}^T \mathbf{y} \\ \mathbf{y} \end{bmatrix}$$

通过 Cholesky 分解或预条件共轭梯度法（PCG）直接求解该稀疏块状矩阵，获得个体基因组估计育种值 $\hat{\mathbf{u}}$。

### 5. 贝叶斯字母表（Bayesian Alphabet）多元先验模型

rrBLUP / GBLUP 假设全基因组所有标记效应服从相同方差的正态分布，这对于纯多基因微效性状（如株高、产草量）表现极佳，但若性状受少数几个具有大效应的主效基因控制（如大豆油酸含量、玉米抗南方锈病），rrBLUP 会过度平滑（Over-shrink）大效应位点。贝叶斯字母表通过引入可变方差与稀疏先验克服了这一限制：

```
贝叶斯字母表先验分布对比：

模型名称      标记效应先验分布特征                              适用性状遗传架构
─────────────────────────────────────────────────────────────────────────────
rrBLUP / GBLUP 统一正态分布：a_j ~ N(0, σ_a²)                   纯微效、无穷小多基因性状
BayesA        每个标记方差独立服从逆卡方：a_j ~ t(df, S²)       允许位点间效应差异较大
BayesB        双峰混合先验：(1-π) 概率为 0，π 概率服从逆卡方    少数大效应位点 + 大量零效应中性位点
BayesCπ       双峰混合先验：(1-π) 概率为 0，π 概率服从同一正态   稀疏主效位点建模，π 由数据自适应推断
```

---

## 交叉验证评估标准与数据泄漏防范

### 1. 预测能力与预测准确度评估指标

利用五折交叉验证（5-fold Cross-Validation），在未参与模型拟合的独立验证折（Validation Fold）上计算：
- **预测能力（Predictive Ability, $r_{pa}$）**：预测育种值与实测表型值之间的 Pearson 相关系数：
  $$r_{pa} = \text{cor}(\mathbf{y}_{\text{test}}, \hat{\mathbf{u}}_{\text{test}})$$
- **理论预测准确度（Prediction Accuracy, $r_{acc}$）**：剔除环境误差影响，度量预测值与真实加性育种值之间的相关：
  $$r_{acc} = \frac{r_{pa}}{\sqrt{h^2}}$$
  其中 $h^2$ 为该性状的狭义遗传力。

### 2. 避免数据泄漏（Data Leakage）的黄金法则

在自动化评估 GS 流程中，必须严格恪守以下数据隔离防范红线：
1. **特征工程严格折内拟合**：次等位基因频率（MAF）过滤、缺失位点填补（Imputation）与 SNP 中心化均值，必须**仅在当前训练折**（Training Fold）内计算，严禁在交叉验证划分前对全量数据统一执行填补；
2. **家系结构隔离验证**：若材料存在明显的家系亲缘聚类，采用**留一家系验证（Leave-one-family-out）**，避免将同胞株分别划分至训练集和测试集导致预测能力被严重虚高估计。
