---
title: rrBLUP
name: rrBLUP
summary: 基于岭回归最佳线性无偏预测 (rrBLUP) 与基因组最佳线性无偏预测 (GBLUP) 的植物基因组育种值推断与跨环境预测 R 软件包。
dataType: SNP 变异矩阵 (数值编码 -1/0/1 或 0/1/2)、表型数据 (单环境/多环境)、加性亲缘矩阵
principle: 岭回归 (Ridge Regression)、谱分解快速求解 (Spectral Decomposition)、GBLUP 与连续核方法 (RKHS)
domainIds: [gwas-breeding]
topicIds: [m06-topic-06, m06-topic-07]
principleIds: [ridge-regression-blup]
dataIds: [variant-data, phenotype]
paper: rrblup-paper
repository: https://cran.r-project.org/web/packages/rrBLUP/index.html
version: "4.6.3"
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在现代植物分子育种与数量遗传学中，**基因组选择（Genomic Selection, GS）**由 Meuwissen 等人于 2001 年奠基提出。其核心思想是利用覆盖全基因组的高密度标记，建立全基因组统计模型直接预测幼苗期早期材料的**基因组估计育种值（Genomic Estimated Breeding Value, GEBV）**，从而在无需田间表型鉴定的情况下提前进行亲本淘汰与优质单株选拔，使作物育种的世代周期缩短 50% 以上，显著加速年遗传增益。

然而在基因组预测中，科研人员面临的核心数学困境是典型的“大 $p$ 小 $n$”维度灾难：全基因组测序标记数 $m$ 通常为数万至数百万，而田间精确鉴定的样本表型数 $n$ 通常仅数百至数千（$m \gg n$）。传统的普通最小二乘法（OLS）由于矩阵严重欠秩而彻底失效。

**rrBLUP** 由威斯康星大学麦迪逊分校 Jeffrey Endelman 于 2011 年发表在 *The Plant Genome* 上（CRAN 最新版本 4.6.3）。作为植物基因组预测领域最经典的里程碑工具，rrBLUP 通过对所有微效标记赋予高斯收缩先验（$L_2$ 正则化），并利用高效的特征值谱分解算法极速估计方差组分，在确保极高预测准确率的同时提供了无与伦比的计算稳健性，是国际动植物育种界公认的基准金标准模型。

---

## 核心算法数学原理与推导

rrBLUP 统一了标记效应模型与个体亲缘模型的对偶数学结构：

### 1. 岭回归最佳线性无偏预测（rrBLUP 标记效应模型）

将表型建模为固定环境效应与全基因组所有 SNP 标记的微效加性随机效应之和：

$$\mathbf{y} = \mathbf{X}\boldsymbol{\beta} + \mathbf{Z}\mathbf{u} + \mathbf{e}$$

- $\mathbf{y} \in \mathbb{R}^{n \times 1}$：个体表型观测向量；
- $\mathbf{X}\boldsymbol{\beta}$：固定效应（试验区组、地点、年份均值）；
- $\mathbf{Z} \in \{-1, 0, 1\}^{n \times m}$：经过中心化与标准化处理的基因型矩阵（标记数为 $m$）；
- $\mathbf{u} \in \mathbb{R}^{m \times 1}$：所有标记的加性效应向量，假定所有微效标记服从均值为 0、方差同质的独立正态分布：
  $$\mathbf{u} \sim \mathcal{N}\left( \mathbf{0}, \mathbf{I}_m \sigma_u^2 \right)$$
- $\mathbf{e} \sim \mathcal{N}\left( \mathbf{0}, \mathbf{I}_n \sigma_e^2 \right)$：独立随机残差。

目标函数等价于带 $L_2$ 惩罚项的正则化最小二乘求解：

$$\min_{\boldsymbol{\beta}, \mathbf{u}} \|\mathbf{y} - \mathbf{X}\boldsymbol{\beta} - \mathbf{Z}\mathbf{u}\|_2^2 + \lambda \|\mathbf{u}\|_2^2, \qquad \lambda = \frac{\sigma_e^2}{\sigma_u^2}$$

通过限制性极大似然法（REML）估计出收缩比率 $\lambda$ 后，标记效应的最优解满足：

$$\hat{\mathbf{u}} = \left( \mathbf{Z}^{\mathsf{T}}\mathbf{Z} + \lambda \mathbf{I}_m \right)^{-1} \mathbf{Z}^{\mathsf{T}} (\mathbf{y} - \mathbf{X}\hat{\boldsymbol{\beta}})$$

### 2. GBLUP（基因组最佳线性无偏预测）的数学等价性

定义个体的全基因组总加性遗传值向量为 $\mathbf{g} = \mathbf{Z}\mathbf{u}$。根据多元正态分布线性变换性质，$\mathbf{g}$ 服从：

$$\mathbf{g} \sim \mathcal{N}\left( \mathbf{0}, \mathbf{G}\sigma_g^2 \right)$$

其中 $\mathbf{G} \in \mathbb{R}^{n \times n}$ 即为著名的 VanRaden（2008）第一类全基因组亲缘矩阵：

$$\mathbf{G} = \frac{\mathbf{Z}\mathbf{Z}^{\mathsf{T}}}{2 \sum_{j=1}^m p_j (1 - p_j)}$$

- **数学对偶定理**：无论是在标记维度直接求解 $\hat{\mathbf{u}}$ 并计算个体育种值 $\hat{\mathbf{g}} = \mathbf{Z}\hat{\mathbf{u}}$，还是直接在个体维度求解 GBLUP 获得 $\hat{\mathbf{g}}$，**两者的预测结果在数学上严格恒等**！
- 当标记数 $m$ 远大于样本数 $n$ 时（如 $m=100,000, n=500$），直接在 $n \times n$ 的个体亲缘矩阵 $\mathbf{G}$ 上求解 GBLUP，计算速度比标记空间求解快数百倍。

### 3. 谱分解极大似然加速算法（Spectral Decomposition）

为了彻底克服每次迭代都需要对 $n \times n$ 协方差矩阵求逆的 $O(n^3)$ 运算瓶颈，rrBLUP 对亲缘矩阵 $\mathbf{G}$ 预先执行正交特征值分解：

$$\mathbf{G} = \mathbf{U} \mathbf{D} \mathbf{U}^{\mathsf{T}}$$

通过投影变换 $\mathbf{y}^* = \mathbf{U}^{\mathsf{T}}\mathbf{y}$，样本间相关的误差结构被解耦为完全对角化的独立变量，使复杂的多元高维 REML 优化转化为纯粹的一维 Brent 单调标量寻优，计算速度产生质的飞跃。

---

## 生产环境标准流水线

以下展示利用 rrBLUP 执行严格的 5 折交叉验证（Cross-Validation）、计算预测准确率（Prediction Accuracy $r_{\text{predict}}$）并输出未测材料 GEBV 的标准 R 脚本：

```r
library(rrBLUP)

# 步骤 1：准备基因型矩阵 M (编码为 -1, 0, 1；行对应样本, 列对应 SNP) 与表型数据 Y
# A.mat() 自动计算高保真 VanRaden 亲缘关系矩阵
G_mat <- A.mat(M)

# 步骤 2：建立 5 折交叉验证框架评估模型预测能力
set.seed(42)
n_samples <- nrow(Y)
folds <- sample(rep(1:5, length.out = n_samples))
cor_results <- numeric(5)

for (k in 1:5) {
  # 掩蔽测试集表型为 NA
  y_train <- Y$Trait
  y_train[folds == k] <- NA
  
  # 调用 kin.blup 基于亲缘矩阵求解 GBLUP
  ans <- kin.blup(
    data = data.frame(id = Y$Taxa, y = y_train),
    geno = "id",
    pheno = "y",
    K = G_mat
  )
  
  # 提取测试集的基因组估计育种值 (GEBV)
  pred_val <- ans$g[folds == k]
  true_val <- Y$Trait[folds == k]
  
  # 计算皮尔逊相关系数 r 作为预测准确率
  cor_results[k] <- cor(pred_val, true_val, use = "complete.obs")
}

mean_accuracy <- mean(cor_results)
cat(sprintf("5-Fold Cross Validation Mean Accuracy: %.3f\n", mean_accuracy))

# 步骤 3：利用全量训练集预测全新候选育种系 (无表型材料) 的 GEBV
final_fit <- kin.blup(
  data = data.frame(id = Y_all$Taxa, y = Y_all$Trait),
  geno = "id",
  pheno = "y",
  K = G_mat_all
)
# final_fit$g 包含所有待选亲本的综合育种值排名
```

---

## 核心参数科学解析与植物调优指南

| 函数指令 | 推荐设置 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `A.mat(X)` | `min.MAF = 0.05` | **加性亲缘矩阵计算**；内部自动执行均值中心化与缺失值填补（默认采用位点均值填补）。 |
| `kin.blup()` | 推荐模型入口 | **基于个体的 GBLUP 求解器**；适合表型包含固定协变量（如试验地点、区组设计）的复杂场景。 |
| `mixed.solve()` | 底层核心接口 | **直接求解标记效应**；适合需要提取单个 SNP 效应估计值（$\hat{\mathbf{u}}$）以研究性状遗传结构的场景。 |
| `GAUSS = TRUE` | 视性状遗传架构 | **高斯核再生核希尔伯特空间 (RKHS)**；若性状具有强烈的上位性（Epistasis）互作，启用核方法可显著提升预测力。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 交叉验证中的“近亲泄漏陷阱（Data Leakage）”
- **机制与风险**：在作物育种群体中，材料往往按杂交组合（Crosses/Families）分组。如果采用完全随机抽样进行 $K$ 折交叉验证，同一个全同胞家系的姊妹品系将被随机分散在训练集和测试集之中。
- **严重后果**：模型实际上仅仅是在“家系内近亲识别”，计算出的测试准确率可能虚高达 $r = 0.85$；**然而一旦将该模型部署到田间去预测全新的未知杂交组合（跨家系预测）时，预测准确率常雪崩断崖式暴跌至 0.1~0.2！**
- **科学准则**：在评估育种模型的真实迁移能力时，**必须采用家系留出（Family-wise split）或跨环境/跨年份留出验证**，严禁使用盲目随机打乱的简单抽样。

### 2. 多倍体作物的基因型剂量编码
- rrBLUP 的标准实现假定二倍体双等位基因型（$-1, 0, 1$）。
- 在同源四倍体马铃薯、紫花苜蓿或六倍体小麦中，基因型存在连续等位基因剂量（$0, 1, 2, 3, 4$）。
- **对策**：多倍体作物必须使用专门的多倍体加性亲缘矩阵算法（如 AGHmatrix 软件包），将构建出的多倍体亲缘矩阵传入 `kin.blup(K = K_poly)` 进行求解。

---

## 植物应用案例与真实文献证据

1. **国际小麦耐旱与抗锈病性状基因组选择**：
   在 CIMMYT（国际玉米小麦改良中心）全球小麦育种网络中（Crossa et al., *Frontiers in Genetics*, 2017），科学家利用 rrBLUP/GBLUP 对数千份春小麦品系开展了多环境田间预测。研究表明，在结合主成分协变量与 VanRaden 亲缘矩阵后，rrBLUP 对小麦产量与条锈病抗性的跨地点预测准确度达到 0.45~0.60，成功支撑了 CIMMYT 早期世代的分子辅助亲本淘汰（[Crossa et al., *Frontiers in Genetics*, 2017](https://doi.org/10.3389/fgene.2017.00192)）。

---

## 实践排错与质控规范

- **错误 1：`A.mat` 报错 `Error: NA present in marker matrix`**
  - *排查原因*：输入的基因型矩阵包含非数字字符（如字母、短横线）或未被编码为数值。
  - *解决方案*：将基因型严格编码为 $-1, 0, 1$（缺失值设为 `NA`），`A.mat(impute.method = "mean")` 可自动进行频率均值填补。
- **错误 2：`mixed.solve` 求解时返回方差组分 $\sigma_u^2 \approx 0$**
  - *排查原因*：表型数据未做方差缩放，或者该性状为纯环境方差主导的极低遗传力性状（$h^2 < 0.05$）。
  - *解决方案*：检查表型测量质量，剔除极端离群异常值，并在模型中增加田间区组固定效应以消除微环境噪音。
