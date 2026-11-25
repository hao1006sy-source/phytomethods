---
title: SciPy 线性回归
name: SciPy
summary: 利用 Python 科学计算库执行单标记普通最小二乘线性回归 (OLS)、显著性 t 检验与表型方差解释率 (PVE) 求解，剖析 GWAS 底层统计原理与群体结构混杂偏倚。
version: "1.14.0"
dataType: 离散化等位基因剂量矩阵 (0/1/2) 与连续型植物农艺表型数值向量
principle: 一元普通最小二乘法 (OLS) 解析解、学生氏 t 检验与零假设显著性推断、群体结构分化与混杂假阳性数学机理
domainIds: [gwas-breeding]
topicIds: [m06-topic-03, m06-topic-05]
principleIds: [linear-regression]
dataIds: [variant-data, phenotype]
paper: scipy-paper
repository: https://github.com/scipy/scipy
status: published
updatedAt: 2026-11-25
---

## 软件定位与核心科学问题

全基因组关联分析（Genome-Wide Association Study, GWAS）是现代作物功能基因组学与分子育种学中解析复杂农艺性状（如株高、抽穗期、百粒重、抗逆性）遗传基础的基石方法。

无论当今的关联分析算法（如 MLM、CMLM、FarmCPU、BLINK）如何演进，其最根本的统计学内核均源于经典的**单标记线性回归模型（Single-Marker Linear Regression Model）**。

SciPy 是 Python 生态中科学计算的核心通用算法库（Virtanen 等，*Nature Methods*, 2020）。其子模块 `scipy.stats.linregress` 提供了极速、高精度的两变量一元线性回归极简实现。在生物信息学教育、轻量级快速初筛以及算法基准复核中，SciPy 常被用于阐明等位基因加性效应、回归系数 $t$ 检验以及决定系数 $R^2$ 的底层数学推导，同时也是深入理解“为何简单回归必须被混合线性模型取代”的最佳教学解构载体。

---

## 核心算法原理与数学推导

```
   [植物个体等位基因加性剂量向量 x (0, 1, 2)]  +  [连续型农艺表型数值向量 y]
                               │
                               ▼
       一元普通最小二乘法拟合 (Ordinary Least Squares, OLS)
       y_i = β_0 + β_1 * x_i + ε_i,  ε_i ~ N(0, σ^2)
                               │
                               ├─────────────────────────────────────────┐
                               ▼                                         ▼
         回归斜率加性效应量解析求解 (β_1)                 截距项解析求解 (β_0)
         β_1 = Cov(x, y) / Var(x)                        β_0 = mean(y) - β_1 * mean(x)
                               │                                         │
                               └────────────────────┬────────────────────┘
                                                    ▼
                             残差平方和与回归系数标准误求解 (SE(β_1))
                                                    │
                                                    ▼
                             学生氏 t 检验与双尾 p 值计算 (Student's t-test)
                             t = β_1 / SE(β_1) ~ t(n - 2)
                                                    │
                                                    ▼
                             表型方差解释率计算 (PVE = R^2 = r^2)
```

### 1. 单标记加性模型与普通最小二乘法 (OLS) 解析解

设样本包含 $n$ 个植物个体（自交系或天然群体），对于某一个候选双等位单核苷酸多态性（SNP）位点：
- 将等位基因按主效等位基因与次要等位基因（Minor Allele）编码为加性剂量：
  $$x_i \in \{0, 1, 2\}$$
  （0 代表纯合野生型，1 代表杂合型，2 代表纯合突变型）；
- 对应的连续型农艺表型（如植株高度，单位 cm）观测值为 $y_i$；
- 建立一元线性回归方程：
  $$y_i = \beta_0 + \beta_1 x_i + \varepsilon_i, \quad \varepsilon_i \overset{\text{i.i.d.}}{\sim} \mathcal{N}(0, \sigma^2)$$
  其中：
  - $\beta_0$ 为群体表型基线截距；
  - $\beta_1$ 为该 SNP 位点的**等位基因加性效应（Additive Effect Size）**；在生物学上代表每增加一个突变等位基因拷贝，植物表型平均增加或降低的物理数值；
  - $\varepsilon_i$ 为独立同分布的随机高斯残差。

通过最小化残差平方和（$\text{RSS} = \sum_{i=1}^n \varepsilon_i^2$），由极值条件直接推导出参数的封闭解析解：
$$\hat{\beta}_1 = \frac{\sum_{i=1}^n (x_i - \bar{x})(y_i - \bar{y})}{\sum_{i=1}^n (x_i - \bar{x})^2} = \frac{\text{Cov}(x, y)}{\text{Var}(x)}$$
$$\hat{\beta}_0 = \bar{y} - \hat{\beta}_1 \bar{x}$$

### 2. 统计假设检验与学生氏 $t$ 检验 (Student's $t$-test)

为了检验该 SNP 位点是否与目标性状显著关联，提出统计学零假设与备择假设：
$$H_0: \beta_1 = 0 \quad \text{vs} \quad H_1: \beta_1 \neq 0$$
1. **残差均方估计（Unbiased Residual Variance）**：
   $$s^2 = \frac{\sum_{i=1}^n (y_i - \hat{y}_i)^2}{n - 2}$$
2. **回归斜率的标准误差（Standard Error）**：
   $$\text{SE}(\hat{\beta}_1) = \sqrt{\frac{s^2}{\sum_{i=1}^n (x_i - \bar{x})^2}} = \frac{s}{\sqrt{n - 1} \cdot \text{SD}(x)}$$
3. **构造 $t$ 检验统计量**：
   在零假设 $H_0$ 为真的条件下，标准化的估计量服从自由度为 $n-2$ 的学生氏 $t$ 分布：
   $$t = \frac{\hat{\beta}_1 - 0}{\text{SE}(\hat{\beta}_1)} \sim t(n - 2)$$
4. **双尾显著性 $p$ 值**：
   $$p = 2 \cdot \left[ 1 - F_{t(n-2)}(|t|) \right]$$
   当 $p < 5 \times 10^{-8}$（全基因组 Bonferroni 校正阈值）时，拒绝零假设，认定该位点为具有全基因组显著性的候选关联数量性状位点（QTL）。

### 3. 表型方差解释率 (Phenotypic Variance Explained, PVE)

该标记对该农艺表型变异的解释比例由决定系数（Coefficient of Determination, $R^2$）给出：
$$\text{PVE} = R^2 = \frac{\text{SS}_{\text{reg}}}{\text{SS}_{\text{tot}}} = 1 - \frac{\sum_{i=1}^n (y_i - \hat{y}_i)^2}{\sum_{i=1}^n (y_i - \bar{y})^2} = r_{x, y}^2$$
其中 $r_{x, y}$ 恰好等于基因型剂量与表型之间的 Pearson 线性相关系数。

---

## 深刻机理：为何简单线性回归在真实植物 GWAS 中失效？

在真实植物天然群体（如涵盖不同地理来源的水稻地方种、玉米热带与温带系）中，直接使用简单线性回归（无协变量控制）会导致极其严重的全基因组假阳性灾难（Genomic Inflation）：

```
                       [深层隐藏混杂因子: 群体地理结构 Z]
                       (如: 粳稻生态型 vs 籼稻生态型)
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
       [候选等位基因频率分化 x]            [环境适应性农艺表型 y]
       (基因型在粳稻中频率 95%,            (粳稻株型矮/耐冷,
        在籼稻中频率仅 5%)                 籼稻株型高/不耐冷)
```

**数学偏倚推导（Simpson 悖论与遗漏变量偏倚）**：
假设基因 $x$ 实际上与表型 $y$ 没有任何直接因果生化联系（即在同一个生态型内部条件独立：$\text{Cov}(x, y \mid Z) = 0$）。
然而，由于两个亚群在长期驯化演化中发生了强烈的系统性分化，由全概率公式分解边际协方差：
$$\text{Cov}(x, y) = \mathbb{E}[\text{Cov}(x, y \mid Z)] + \text{Cov}(\mathbb{E}[x \mid Z], \mathbb{E}[y \mid Z]) = 0 + \text{Cov}(\bar{x}_Z, \bar{y}_Z) \neq 0$$
简单线性回归强行忽略混杂因子 $Z$，计算出的 $\hat{\beta}_1 = \frac{\text{Cov}(x, y)}{\text{Var}(x)} \gg 0$，并且其检验统计量 $t$ 伴随着微小的标准误迅速膨胀，输出虚假的极小 $p$ 值（如 $p = 10^{-15}$）。
其 QQ 图（Quantile-Quantile Plot）将发生剧烈上扬，产生数以千计由群体地理演化假象造成的伪关联位点。

因此，SciPy 简单线性回归仅适用于：
1. **教学演示与基础代数核验**；
2. **在已彻底去除群体结构与亲缘关系的残差矩阵上做快速检验**。
面对真实植物 GWAS 复杂性状，必须升级为融合了主成分（$Q$ 矩阵）与全基因组亲缘矩阵（$K$ 矩阵）的混合线性模型工具（如 **GAPIT / FarmCPU / BLINK**）。

---

## 典型调用代码与数值验证

以下为基于 Python 3.10+ 与 `scipy.stats.linregress` 执行单标记关联检验与结果解析的完整脚本：

```python
import numpy as np
import pandas as pd
from scipy import stats
import matplotlib.pyplot as plt

# 1. 模拟一个植物育种分离群体的表型与标记基因型数据 (n = 100 个自交系个体)
np.random.seed(42)
n_samples = 100

# 模拟某候选抗旱基因型剂量 x (0: 纯合敏感型, 1: 杂合型, 2: 纯合抗逆型)
genotypes = np.random.choice([0, 1, 2], size=n_samples, p=[0.25, 0.50, 0.25])

# 模拟植物叶绿素含量表型 y (基础均值 40.0, 真实等位基因加性效应 +3.5, 随机误差服从正态分布)
true_beta_0 = 40.0
true_beta_1 = 3.5
noise = np.random.normal(loc=0.0, scale=2.0, size=n_samples)
phenotypes = true_beta_0 + true_beta_1 * genotypes + noise

# 2. 调用 SciPy 进行普通最小二乘一元线性回归拟合
res = stats.linregress(genotypes, phenotypes)

# 3. 提取并打印核心统计估计参数
print("=== SciPy 单标记线性回归估计结果 ===")
print(f"等位基因加性效应 (Slope beta_1) : {res.slope:.4f} (真实设定: {true_beta_1})")
print(f"截距基线 (Intercept beta_0)       : {res.intercept:.4f} (真实设定: {true_beta_0})")
print(f"效应估计标准误 (Std Error)        : {res.stderr:.4f}")
print(f"双尾假设检验显著性 (P-value)      : {res.pvalue:.4e}")
print(f"相关系数 (Pearson r)              : {res.rvalue:.4f}")
print(f"表型方差解释率 (PVE / R-squared)  : {res.rvalue**2 * 100:.2f}%")

# 4. 手工依据数学公式复核 Student's t 统计量
t_stat_manual = res.slope / res.stderr
p_val_manual = 2 * (1 - stats.t.cdf(np.abs(t_stat_manual), df=n_samples - 2))
assert np.isclose(res.pvalue, p_val_manual), "SciPy p 值与 t 分布解析推导完全一致！"
print(f"验证通过: t 检验统计量 = {t_stat_manual:.4f}, 自由度 df = {n_samples - 2}")
```

---

## 科学研究案例与上下游分析协同

- **水稻农艺性状全基因组关联分析基础案例**：在黄学辉等（*Nature Genetics*, 2010）关于栽培稻核心种质农艺性状 GWAS 的奠基性研究中，研究团队深入论述了单标记简单线性回归在未校正地理亚种分化（籼粳分化）时的严重系统偏差，并展示了如何通过引入主成分分析（PCA）协变量与亲缘矩阵消除假阳性；
- **分析工具流转与协作边界**：
  - **定位界定**：SciPy 线性回归属于基础统计计算构件，专职于**两变量一阶线性效应的教学与初筛**；
  - **真实生信流水线承接**：在处理包含数百万个 SNPs 的真实植物重测序数据时，单标记模型计算由专用高性能工具（如 **PLINK** 的 `--linear` / `--assoc`）负责；而严谨校正 $Q+K$ 效应的复杂关联分析则全面移交至 **GAPIT**、**EMMAX** 或 **GEMMA** 开展混合模型分析。
