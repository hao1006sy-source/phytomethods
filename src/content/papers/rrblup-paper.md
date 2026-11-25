---
title: "Ridge Regression and Other Kernels for Genomic Selection with R Package rrBLUP"
summary: "提出基于谱分解极大似然估计的岭回归最佳线性无偏预测（rrBLUP）与多核基因组选择（GS）算法。"
authors: "Endelman JB"
year: 2011
journal: The Plant Genome
doi: 10.3835/plantgenome2011.08.0024
type: method
methodIds: [rrblup]
domainIds: [gwas-breeding]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# Ridge Regression and Other Kernels for Genomic Selection with R Package rrBLUP

## 1. 研究背景与算法贡献

在动植物分子育种领域，**基因组选择（Genomic Selection, GS）** 旨在利用覆盖全基因组的高密度单核苷酸多态性（SNP）分子标记，在不依赖大田表型鉴定的前提下，直接预测未测试个体的**基因组估计育种值（Genomic Estimated Breeding Values, GEBV）**。基因组选择极大缩短了育种世代周期（如在多年生或世代周期长的作物中可跳过多轮田间测试），显著提高了年遗传增益。

然而，在统计计算上，基因组选择面临经典的“$p \gg n$”超高维共线性难题：标记数 $p$（通常在数万至数十万）远远超过测序训练群体的个体数 $n$（通常在数百至数千），导致常规最小二乘多元线性回归无解。早期的基因组预测算法多依赖计算开销极大的贝叶斯马尔可夫链蒙特卡洛（MCMC，如 BayesA/B/C$\pi$），计算极度缓慢，难以在作物育种常规多环境与交叉验证中高效部署。

威斯康星大学麦迪逊分校的 Jeffrey B. Endelman 在 2011 年推出了著名的 **rrBLUP**（Ridge Regression and Other Kernels for Genomic Selection，发表于 *The Plant Genome*）。rrBLUP 在植物育种界首次实现了极简、高度稳健且运算速度极快的岭回归最佳线性无偏预测（rrBLUP）与基因组最佳线性无偏预测（GBLUP）算法。其核心学术贡献在于**利用矩阵谱分解（Spectral Decomposition）极大化似然函数**，彻底消除了冗长的迭代矩阵求逆，为作物分子育种提供了基准级的高性能 R 软件包。

---

## 2. 核心数学模型与数据结构

### 2.1 标记效应岭回归模型（Ridge Regression BLUP）

在标记水平模型中，假定所有标记均对表型具有微小的加性遗传贡献，且效应服从相同的正态先验分布：
$$y = \mu \mathbf{1}_n + Z u + e$$

其中：
- $y$ 为表型测量向量（$n \times 1$）；
- $\mu$ 为群体均值截距；
- $Z$ 为标准化基因型矩阵（$n \times p$），元素通常按等位基因剂量编码为 $\{-1, 0, 1\}$ 并按频率进行中心化；
- $u$ 为标记随机效应向量（$p \times 1$），假定服从独立同分布正态分布：
  $$u \sim \mathcal{N}\left(0, \mathbf{I}_p \sigma_u^2\right)$$
- $e \sim \mathcal{N}(0, \mathbf{I}_n \sigma_e^2)$ 为环境残差向量。

### 2.2 个体水平等价的 GBLUP 与 VanRaden 亲缘矩阵

通过定义个体的总加性遗传育种值 $g = Z u$（大小为 $n \times 1$），标记模型可精确等价转换为个体水平的混合模型：
$$y = \mu \mathbf{1}_n + g + e, \quad g \sim \mathcal{N}\left(0, G \sigma_g^2\right)$$

其中 $G$ 为著名的 **VanRaden 基因组亲缘关系矩阵（Realized Genomic Relationship Matrix）**：
$$G = \frac{Z Z^T}{2 \sum_{k=1}^p p_k (1 - p_k)}$$

在此表达下，估计标记效应向量与估计个体育种值完全对偶，且将高维 $p \times p$ 问题直接转化为仅由个体样本量决定的 $n \times n$ 问题。

### 2.3 基于谱分解（Spectral Decomposition）的极大似然极速求解

rrBLUP 算法的核心计算突破在于利用矩阵特征值分解（Eigen-decomposition）：
- 对亲缘矩阵进行正交分解：$G = U D U^T$（其中 $U$ 为正交特征向量矩阵，$D$ 为对角特征值矩阵）；
- 将表型向量投影到特征空间：$y^* = U^T y$；
- 此时，原本耦合的高维表型协方差矩阵 $V = G \sigma_g^2 + I \sigma_e^2$ 被彻底**对角化**！
- 受限极大似然函数（REML）的对数似然表达式退化为一维标量方差比率 $\lambda = \sigma_e^2 / \sigma_g^2$ 的简单单变量优化，无需在迭代中进行任何高维矩阵求逆，使参数求解速度提升了上千倍。

---

## 3. 算法复杂度与计算性能

1. **计算复杂度**：仅需在算法开始时对 $n \times n$ 的亲缘矩阵进行一次特征值分解，复杂度为 $O(n^3)$。后续任意交叉验证折数的参数优化与育种值预测复杂度均为 $O(n)$。
2. **内存消耗极低**：在标准 R 环境下，处理 2000 个体与 10 万个标记的预测与交叉验证仅需几十兆内存，数秒钟内即可完成 100 次重复抽样验证。
3. **支持高斯核与非加性核扩展**：原生支持再生核希尔伯特空间（RKHS）高斯核，能够灵活捕捉部分非线性微观上位效应。

---

## 4. 植物基因组学应用场景与科研价值

植物自交系繁育、杂交种制种以及多亲本重组近交系高度适配 GBLUP 理论：
- **作物品种田间多环境产量与农艺性状预测**：在小麦、大麦、玉米与大豆中，利用测试集品系在少数环境的表型预测其在未知环境的综合表现，大幅精简昂贵的多地点田间试验网络；
- **全基因组选择（GS）交叉验证模型建立**：作为所有新型复杂机器学习/深度学习预测算法（如 Random Forest、LightGBM、DNNGP）的**官方标准对比基准（Benchmark Baseline）**；
- **多亲本杂交组合优选**：计算双亲杂交后代预期均值与遗传方差，助力育种家从数万个潜在杂交组合中精准锁定优势配对。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心分析流程与执行代码 (R / rrBLUP)
```R
library(rrBLUP)

# 1. 载入表型与基因型标记矩阵
# 基因型矩阵编码为 -1 (AA), 0 (Aa), 1 (aa)，行: 标记, 列: 个体 (或其转置)
genotypes <- as.matrix(read.table("plant_genotypes_num.txt", header = TRUE))
phenotypes <- read.table("plant_phenotypes.txt", header = TRUE)

# 2. 构建 VanRaden 基因组亲缘关系矩阵 (A.mat)
# 自动执行缺失标记均值插补与 MAF 过滤
A <- A.mat(t(genotypes), min.MAF = 0.05, impute.method = "mean")

# 3. 使用 mixed.solve 求解 GBLUP 育种值
# 掩码测试集个体的表型为 NA 以模拟未知样本
y_train <- phenotypes$Yield
y_train[sample(1:length(y_train), 50)] <- NA  # 模拟 50 个验证样本

ans <- mixed.solve(y = y_train, K = A)

# 4. 提取估计的遗传方差、残差方差与个体 GEBV
sigma2_g <- ans$Vu
sigma2_e <- ans$Ve
gebv <- ans$u  # 包含所有个体 (含 NA 样本) 的预测育种值

# 5. 计算预测准确率 (Pearson r)
# cor(gebv[is.na(y_train)], phenotypes$Yield[is.na(y_train)])
```

### 5.2 关键参数说明
- `K = A`：指定的亲缘关系协方差核矩阵；如不指定 $K$ 而传入 $Z$ 矩阵，则自动切换为标记水平的岭回归（rrBLUP）。
- `impute.method = "mean"`：针对微量标记缺失的自动均值填充选项。

---

## 6. 阅读与复现资源

- **原始研究论文**：[The Plant Genome 2011 DOI: 10.3835/plantgenome2011.08.0024](https://doi.org/10.3835/plantgenome2011.08.0024)
- **CRAN 官方软件包**：[rrBLUP on CRAN](https://cran.r-project.org/web/packages/rrBLUP/index.html)
- **Endelman 实验室主页**：[Endelman Lab Software](https://potatobreeding.cals.wisc.edu/software/)
- **站内配套专题**：[全基因组选择（GS）原理与育种值评估](../../topics/gwas-breeding/m06-topic-05/)
- **站内配套专题**：[全基因组关联分析（GWAS）原理与质控](../../topics/gwas-breeding/m06-topic-01/)
