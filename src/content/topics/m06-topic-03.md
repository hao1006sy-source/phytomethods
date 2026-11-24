---
title: GWAS 关联检验基础：一般线性模型与群体结构控制
summary: 深入推导全基因组单标记回归方程、群体分层导致的假阳性机理、PCA/Q 矩阵固定效应校正、Bonferroni 与 FDR 多重检验校正以及曼哈顿图与 Q-Q 图联合判读。
domain: gwas-breeding
methods: [gapit, scipy]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：自然群体的历史重组与统计关联

全基因组关联分析（Genome-Wide Association Study, GWAS）利用自然植物品系、地方品种（Landraces）或育种资源在成百上千世代中累积的丰富历史同源重组事件，通过扫描全基因组数百万个单核苷酸多态性（SNP），建立分子标记与复杂农艺表型之间的统计关联。

与双亲家系作图相比，自然群体的连锁不平衡（Linkage Disequilibrium, LD）衰减极其迅速（自交作物通常为数十 kb 至数百 kb，异交作物如玉米仅为数 kb 至十数 kb），因而 GWAS 具备将因果变异直接锚定至单基因甚至单碱基级别的超高定位分辨率。

![全基因组关联分析双联统计图解：曼哈顿图与 Q-Q 图协同判读](/phytomethods/images/topics/m06/gwas-manhattan-qq-plot-architecture.svg)

---

## 算法数学推导：单标记检验与多重假设校正

### 1. 单标记一般线性回归模型（General Linear Model, GLM）

对于 $n$ 个植物二倍体个体的连续农艺性状向量 $\mathbf{y} = [y_1, y_2, \dots, y_n]^T$。在第 $i$ 个双等位候选 SNP 位点上，将基因型编码为次等位基因剂量向量 $\mathbf{s}_i \in \{0, 1, 2\}^n$。

建立单标记加性效应普通最小二乘回归方程：

$$\mathbf{y} = \mathbf{X}\boldsymbol{\beta} + \mathbf{s}_i \alpha_i + \boldsymbol{\epsilon}, \quad \boldsymbol{\epsilon} \sim N(\mathbf{0}, \sigma_e^2 \mathbf{I})$$

其中：
- $\mathbf{X}$ 为 $n \times p$ 维协变量矩阵（包含截距项、环境试验区组、气温或前序已识别主成分）；
- $\boldsymbol{\beta}$ 为协变量的固定效应向量；
- $\alpha_i$ 为待估计的第 $i$ 个标记加性等位基因替代效应（Additive Effect）；
- $\boldsymbol{\epsilon}$ 为相互独立的同方差正态随机误差向量。

对该模型求解标准正规方程组，得到 $\alpha_i$ 的普通最小二乘估计量（OLS）：

$$\hat{\alpha}_i = (\mathbf{s}_i^{*T} \mathbf{s}_i^*)^{-1} \mathbf{s}_i^{*T} \mathbf{y}^*$$

其中 $\mathbf{s}_i^*$ 与 $\mathbf{y}^*$ 分别为投影剔除协变量 $\mathbf{X}$ 影响后的残差向量。检验零假设 $H_0: \alpha_i = 0$ 的统计量为 $F$ 统计量或两尾 Student's $t$ 检验：

$$t_i = \frac{\hat{\alpha}_i}{\text{SE}(\hat{\alpha}_i)} = \frac{\hat{\alpha}_i}{\sqrt{\hat{\sigma}_e^2 (\mathbf{s}_i^{*T} \mathbf{s}_i^*)^{-1}}} \sim t(n - p - 1)$$

### 2. 植物群体分层（Population Stratification）导致的严重假阳性机理

在植物自然群体中，地理生态隔离、独立的驯化中心（如亚洲栽培稻的籼稻 *indica* 与粳稻 *japonica* 双重起源）以及强烈的自交习性，形成了高度分化的亚群结构（Subpopulations）。

设群体由亚群 1 与亚群 2 构成：
- 亚群 1（如籼稻）长期适应热带低纬度气候，株型高大、开花早；
- 亚群 2（如粳稻）适应温带高纬度气候，株型紧凑、耐冷开花晚。

全基因组上成千上万个与开花基因毫无物理连锁的中性等位基因，由于长期的地理隔离漂变，在两亚群间出现了巨大的等位基因频率差异（$F_{ST} \gg 0$）。若直接采用简单的单标记回归，这些中性位点都会因为与亚群背景高度相关而表现出强烈的统计虚假显著性（False Positives），导致曼哈顿图满屏出现假阳性信号。

### 3. 主成分分析（PCA）与 Q 矩阵控制

Pritchard 等（2000）与 Price 等（2006）提出了将全基因组分子标记提取的群体亚群结构代入协变量矩阵 $\mathbf{X}$ 进行校正：

$$\mathbf{y} = \mathbf{Q}\boldsymbol{\beta}_Q + \mathbf{s}_i \alpha_i + \boldsymbol{\epsilon}$$

- **STRUCTURE $Q$ 矩阵**：基于贝叶斯聚类估计每个个体归属于 $K$ 个祖先亚群的成员概率；
- **Patterson PCA 矩阵**：利用全基因组独立 SNP 计算遗传协方差矩阵并执行奇异值分解（SVD），选取前 $k$ 个显著主成分（通常取前 3~5 个 PC，特征向量矩阵记为 $\mathbf{P}_k$）作为固定协变量。

通过在模型中固定 $\mathbf{Q}$ 或 $\mathbf{P}_k$，回归检验被限定在具有相同亚群背景的残差空间内进行，有效剔除了绝大部分因地理亚群漂变引发的宏观假阳性。

### 4. 全基因组多重假设检验校正

现代植物高通量重测序通常获得 $M = 10^6 \sim 10^7$ 个 SNP 标记。若采用常规单次检验显著性水平 $\alpha = 0.05$，理论上将产生多达 $0.05 \times 10^6 = 50,000$ 个假阳性位点。必须采用严格的多重假设校正：

1. **Bonferroni 严苛校正（控制家族错误率 FWER）**：
   假定全基因组所有检验相互独立，将名义显著性阈值收缩为：
   $$P_{\text{threshold}} = \frac{\alpha}{M} = \frac{0.05}{10^6} = 5 \times 10^{-8} \quad (-\log_{10} P \approx 7.30)$$
   Bonferroni 准则极其保守，在强连锁不平衡区会导致较高的假阴性率（漏检真实微效 QTL）。
2. **Benjamini-Hochberg 假发现率校正（FDR, 阶梯递增法）**：
   控制被判定为显著关联的集合中，错误发现所占的期望比例（如 $q < 0.05$）：
   - 将全基因组 $M$ 个检验的原始 $p$ 值从小到大排序：$p_{(1)} \le p_{(2)} \le \dots \le p_{(M)}$；
   - 找到满足下式的最大索引 $k$：
     $$p_{(k)} \le \frac{k}{M} \cdot Q$$
   - 将所有序号 $i \le k$ 的标记判定为显著关联。

---

## 经典植物科研案例与证据链

1. **水稻 517 份地方品种全基因组关联分析（Huang et al., 2010）**：
   - 在发表于 Nature Genetics 的突破性研究中，作者对收集自东亚及东南亚的 517 份水稻地方品种进行低深度重测序，获得约 360 万个高质量 SNP。
   - 研究揭示水稻天然群体存在极强的籼粳分化亚群结构，直接分析株高与落粒性时 Q-Q 图严重失真。在引入前 3 个 PCA 主成分作为协变量后，成功消除了背景伪关联，定位到了控制粒型的经典基因 *GS3* 以及落粒性基因 *sh4*。
2. **795 份水稻多样性群体根系构型 GWAS（PGen, 2018）**：
   - 针对根系深扎角（RDR）性状，研究者先利用 PLINK 对 330 万个 SNP 执行独立性剪枝（LD pruning, `--indep-pairwise 50 5 0.2`），提取 154,516 个近独立标记；输入 ADMIXTURE 评估最优亚群结构 $K=8$；最后在 GAPIT 中将前 3 个 PC 纳入模型，为后续复杂性状解析提供了标准化范式。
