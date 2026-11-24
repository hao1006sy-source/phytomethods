---
title: GWAS 模型演进：从 Q+K 混合线性模型到多位点 FarmCPU 与 BLINK
summary: 深入推导 Yu 2006 统一混合模型方程、VanRaden 亲缘矩阵算法、EMMA 谱分解加速、全基因组过度惩罚机理、FarmCPU 固定与随机模型循环交替以及 BLINK 贝叶斯迭代优化。
domain: gwas-breeding
methods: [gapit]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：统计功效与假阳性控制的终极平衡

在植物自然变异群体中，除了宏观的地理生态亚群分化（可通过 PCA 或 $Q$ 矩阵作为固定效应吸收）之外，个体之间还普遍存在着复杂的近缘交配、半同胞/全同胞家系以及系谱嵌套结构（Cryptic Relatedness）。

如果仅仅控制 $Q$ 矩阵（GLM 模型），个体间未被解释的亲缘关系会导致残差项之间严重相关，违反高斯-马尔可夫定理中残差独立同分布的经典假设，引发大量由于亲缘相近而造成的假阳性关联。混合线性模型（Mixed Linear Model, MLM）应运而生，并在过去二十年间完成了从传统 $Q+K$ 单位点模型向 FarmCPU 与 BLINK 多位点循环迭代模型的革命性跃升。

![混合线性模型与多位点 FarmCPU 循环迭代算法架构](/phytomethods/images/topics/m06/gwas-mixed-linear-model-farmcpu.svg)

---

## 算法数学推导：混合模型与多位点解耦机制

### 1. 经典统一混合线性模型（Yu et al., 2006, Nature Genetics）

Yu 等（2006）提出了将固定群体分层效应与随机多基因亲缘效应有机融合的 $Q+K$ 统一混合模型：

$$\mathbf{y} = \mathbf{X}\boldsymbol{\beta} + \mathbf{s}_i \alpha_i + \mathbf{Z}\mathbf{u} + \boldsymbol{\epsilon}$$

其中：
- $\mathbf{X}\boldsymbol{\beta}$：包含截距与群体分层协变量（如前 3~5 个主成分或 STRUCTURE $Q$ 矩阵）；
- $\mathbf{s}_i \alpha_i$：待测定的第 $i$ 个候选 SNP 的加性基因效应；
- $\mathbf{Z}\mathbf{u}$：个体多基因随机背景效应向量，服从多维正态分布：
  $$\mathbf{u} \sim N(\mathbf{0}, 2\mathbf{K}\sigma_g^2)$$
  $\mathbf{K}$ 为全基因组亲缘关系矩阵（Kinship Matrix），$\sigma_g^2$ 为加性遗传方差；
- $\boldsymbol{\epsilon}$：独立同分布随机误差向量，$\boldsymbol{\epsilon} \sim N(\mathbf{0}, \mathbf{I}\sigma_e^2)$。

全群体表型向量 $\mathbf{y}$ 的方差-协方差矩阵为：

$$\mathbf{V} = \text{Var}(\mathbf{y}) = \mathbf{Z}(2\mathbf{K}\sigma_g^2)\mathbf{Z}^T + \mathbf{I}\sigma_e^2 = \sigma_g^2 (2\mathbf{Z}\mathbf{K}\mathbf{Z}^T + \delta \mathbf{I})$$

其中 $\delta = \sigma_e^2 / \sigma_g^2$ 为方差分量比值。

### 2. VanRaden (2008) 基因组亲缘关系矩阵算法推导

亲缘关系矩阵 $\mathbf{K}$（或基因组关系矩阵 $\mathbf{G}$）基于全基因组双等位 SNP 标记构建。设个体数规模为 $n$，标记数为 $m$。
1. 设原始基因型矩阵为 $\mathbf{M} \in \{0, 1, 2\}^{n \times m}$（记录次等位基因计数）；
2. 记第 $j$ 个标记的次等位基因频率为 $p_j$。构造期望中心化矩阵 $\mathbf{P}$，其第 $j$ 列所有元素恒等于 $2p_j$；
3. 中心化基因型标记矩阵定义为：
   $$\mathbf{Z} = \mathbf{M} - \mathbf{P}$$
4. 根据 VanRaden（2008）第一方法，亲缘关系矩阵 $\mathbf{K}$ 解析式为：
   $$\mathbf{K} = \frac{\mathbf{Z}\mathbf{Z}^T}{2 \sum_{j=1}^m p_j (1 - p_j)}$$
分母为全基因组所有位点杂合度期望之和，确保了对角线元素度量个体自身的纯合度（均值约为 1），而非对角线元素精准反映个体对之间的遗传关联度（IBD 期望）。

### 3. 经典 MLM 的计算瓶颈与谱分解加速（EMMA 与 FaST-LMM）

在原始 MLM 中，对每一个 SNP 位点进行检验都需要求解广义最小二乘估计：

$$\hat{\alpha}_i = (\mathbf{s}_i^T \mathbf{V}^{-1} \mathbf{s}_i)^{-1} \mathbf{s}_i^T \mathbf{V}^{-1} \mathbf{y}$$

由于求逆矩阵 $\mathbf{V}^{-1}$ 复杂度高达 $O(n^3)$，扫描 $m = 10^6$ 个标记的总计算量为不可承受的 $O(m \cdot n^3)$。

- **EMMA 算法（Kang et al., 2008）**：
  注意到亲缘矩阵 $\mathbf{K}$ 在扫描所有标记时保持恒定不变。对对称正定矩阵 $\mathbf{K}$ 预先执行一次谱分解（Spectral Decomposition）：
  $$\mathbf{K} = \mathbf{U} \mathbf{S} \mathbf{U}^T$$
  通过将数据左乘旋转矩阵 $\mathbf{U}^T$，将协方差矩阵 $\mathbf{V}$ 转化为完全对角矩阵。每次扫描仅需对标量进行运算，计算复杂度由 $O(m \cdot n^3)$ 锐减至 $O(n^3 + m \cdot n)$。
- **FaST-LMM 与 GEMMA 算法**：
  进一步在全基因组范围内将方差分量比值 $\delta$ 估算固定，实现了数十分钟内完成数百万位点全基因组关联扫描。

### 4. 传统 MLM 的理论缺陷：假阴性与过度惩罚（Over-correction）

尽管传统 MLM 完美压制了假阳性膨胀，但它暴露了致命的**统计功效低下**（Power Loss）问题：
- 全基因组亲缘矩阵 $\mathbf{K}$ 是由包含真实因果突变在内的全基因组所有 SNP 共同计算而来的；
- 当测试某个真实大效应因果位点（Causal QTN）时，该位点的遗传变异不可避免地早已被包含在背景亲缘矩阵 $\mathbf{K}$ 中；
- 混合模型的随机多基因效应项 $\mathbf{Z}\mathbf{u}$ 会将这个候选位点自身的表型方差当做随机背景噪音强行吸收并惩罚掉；
- 导致真实的因果信号在曼哈顿图上萎缩跌落至显著性红线之下，产生极其严重的**假阴性（False Negatives）**。

### 5. FarmCPU 多位点循环解耦算法（Liu et al., 2016, PLOS Genetics）

为了彻底破除全基因组亲缘矩阵的过度吸收，Liu 等（2016）提出了**固定效应与随机效应循环统一算法（FarmCPU）**，将传统单一模型拆解为两个分步交替循环的子模型：

1. **固定效应模型（Fixed Effect Model, FEM）**：
   在固定效应模型中检验每个候选位点，但**不引入**全基因组亲缘矩阵 $\mathbf{K}$。取而代之的是，将先前迭代中筛选出的一组最显著伪辅因子标记（Pseudo-QTNs, 记为 $\mathbf{S}_{\text{pseudo}}$）作为协变量纳入：
   $$\mathbf{y} = \mathbf{X}\boldsymbol{\beta} + \mathbf{s}_i \alpha_i + \sum_{k \in \text{Pseudo-QTNs}} \mathbf{s}_k \gamma_k + \boldsymbol{\epsilon}$$
   这一步骤不仅消除了局部连锁不平衡导致的伴随假阳性，而且由于没有全基因组亲缘惩罚，保留了极高的检测功效。
2. **随机效应模型（Random Effect Model, REM）**：
   从固定效应模型输出的显著位点中，利用 SUPER 算法挑选出最强的一组伪辅因子，**仅利用这组伪辅因子**重新计算稀疏亲缘矩阵 $\mathbf{K}_{\text{pseudo}}$，并重新优化估计遗传方差分量：
   $$\mathbf{y} = \mathbf{1}\mu + \mathbf{u}^* + \boldsymbol{\epsilon}, \quad \text{Var}(\mathbf{u}^*) = 2\mathbf{K}_{\text{pseudo}}\sigma_g^2$$
3. **循环迭代（Circulating Iteration）**：
   将 REM 优化后的伪辅因子集合反馈回 FEM 开始下一轮扫描。循环迭代直至伪辅因子集合完全稳定收敛（通常仅需 2~4 次迭代）。

### 6. BLINK 贝叶斯信息准则极速优化（Huang et al., 2019, GigaScience）

Huang 等（2019）在 FarmCPU 的基础上提出了进一步优化的 **BLINK（Bayesian-information and Linkage-disequilibrium Iteratively Nested Keyway）** 算法：
- **完全剔除随机效应模型**：彻底免除方差分量估计与限制性最大似然（REML）迭代；
- **基于贝叶斯信息准则（BIC）**：在固定效应模型中利用两轮迭代，结合染色体物理距离窗口与连锁不平衡 $r^2$ 剪枝，直接通过 BIC 最小化选择最优辅因子组合；
- **计算性能提升**：在保持与 FarmCPU 相同高功效与低假阳性率的同时，分析速度相比 FarmCPU 进一步提升 30~100 倍，可在数十秒内完成数十万材料的高密度 GWAS 扫描。

---

## 常用植物 GWAS 模型特征横向对比

```
植物常用 GWAS 统计模型对比：

模型名称      控制混杂机制                方差分量估计      假阳性率    假阴性率    推荐适用场景
─────────────────────────────────────────────────────────────────────────────────────────────
GLM          仅固定协变量 (PCA/Q)        无需估计 (OLS)    极高 (膨胀) 极低        均一结构人工分离群体 (F2/RIL)
MLM (Q+K)    固定 PCA/Q + 随机全基因组 K REML 谱分解       极低 (稳健) 偏高 (过度吸收)自然复杂群体、初步基线评估
CMLM / ECMLM 聚类压缩亲缘矩阵             分群方差估计      低          中          大群体快速初筛
FarmCPU      FEM(伪辅因子) + REM(循环更新) 稀疏方差迭代      极低        极低        作物复杂农艺与抗逆性状解析
BLINK        双轮 BIC 迭代 + 物理 LD 剪枝 纯固定效应模型    极低        极低        超大规模重测序群体与多性状批量分析
```
