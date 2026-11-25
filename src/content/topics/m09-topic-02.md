---
title: 加权基因共表达网络分析 (WGCNA)：无标度拓扑、TOM 矩阵与农艺性状关联推导
summary: 深入推导 WGCNA 软阈值幂律无标度网络准则、拓扑重叠矩阵 (TOM) 共享近邻相似度、动态树剪枝模块识别以及模块特征基因 (ME) 性状关联模型。
domain: regulatory-genomics-ai
methods: [wgcna]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：系统生物学多基因协同模块与农艺性状解析

植物绝大多数重要农艺性状（如水稻千粒重、抗旱耐盐性、作物抗倒伏性）均是极其复杂的多基因控制性状。在细胞内，行使特定生化功能或响应环境胁迫的基因，往往在时空转录上呈现出高度协同的**共表达模块**（Co-expression Modules）。

加权基因共表达网络分析（WGCNA, *Langfelder & Horvath, BMC Bioinformatics, 2008*）通过挖掘全基因组范围内的表达协同关联，将数万个基因凝聚为数十个功能高度聚焦的共表达色块模块，进而将模块的综合表达特征与田间测定的物理表型性状进行线性关联，成为作物功能基因挖掘的最主流系统生物学范式。

![WGCNA 加权基因共表达网络：无标度拓扑、TOM 矩阵与模块-性状关联](/phytomethods/images/topics/m09/wgcna-scale-free-network-and-tom-matrix.svg)

---

## 算法数学推导：软阈值、TOM 重叠与特征基因关联

### 1. 软阈值与无标度网络拓扑准则（Scale-Free Topology）

自然界真实的生物分子网络与随机网络（Random Networks，遵循泊松分布）截然不同，它严格遵循**无标度网络特性**（Scale-Free Network）：网络中绝大多数节点只有很少的连接，而存在极少数具有超高连接度的**枢纽节点**（Hub Genes）。其节点度分布服从幂律分布：
$$P(k) \sim k^{-\gamma}, \quad (2 \le \gamma \le 3)$$
对数形式下为一条直线：$\log P(k) = -\gamma \log k + C$。

**软阈值加权邻接矩阵推导**：
设基因 $i$ 与基因 $j$ 在所有测试样本中的标准化表达谱 Pearson 相关系数为 $s_{ij} = \text{cor}(\mathbf{x}_i, \mathbf{x}_j)$。

1. **加权邻接矩阵形式（Adjacency Matrix）**：
   - **无符号网络（Unsigned Network）**：
     $$a_{ij} = |s_{ij}|^\beta$$
     将负相关绝对值化，保留协同强度但不区分调控正负方向；
   - **符号网络（Signed Network，官方推荐）**：
     $$a_{ij} = \left(\frac{1 + s_{ij}}{2}\right)^\beta$$
     将强负相关（$s_{ij} \to -1$）平滑映射至 0，强正相关保留为 1，精准分离具有相反调控极性的共表达模块；
   - 相比传统硬阈值（如 $|r| \ge 0.8$ 取 1，其余取 0）导致的生物信息人为割裂，连续幂函数 $\beta$ 在保留连续数值谱的同时，能指数级压低微弱技术噪声，强力放大强相关生物信号；

2. **软阈值 $\beta$ 的确定原则**：
   遍历 $\beta \in [1, 20]$，计算对应的连接度 $k_i = \sum_{j \neq i} a_{ij}$，并在线性回归 $\log_{10} P(k) \sim \log_{10} k$ 中计算拟合决定系数 $R^2$：
   - 官方推荐参考准则为选取使**标度游离拟合指数 $R^2 \ge 0.80 \sim 0.85$ 的最小整数 $\beta$**（在典型植物 RNA-seq 样本集中，Unsigned 网络通常为 $\beta \approx 6$，Signed 网络通常建议 $\beta \approx 12$）；
   - 需结合样本量与平均连接度综合评估：若样本较少或异质性大导致难以达到 0.85 时，应在无标度拓扑拟合与网络连通性之间平衡，避免 $\beta$ 过大导致网络发生过度稀疏解体。

### 2. 拓扑重叠矩阵（Topological Overlap Matrix, TOM）

两个基因之间若仅仅是表达相关，可能源于偶然的技术协变；但如果它们在全网络中拥有高度重叠的“共同朋友”（共享近邻连接），则它们属于同一生物功能复合体的置信度极高。

**TOM 数学方程推导**：
$$\text{TOM}_{ij} = \frac{l_{ij} + a_{ij}}{\min(k_i, k_j) + 1 - a_{ij}}$$
- $a_{ij}$：基因 $i$ 与基因 $j$ 之间的直接加权连通度；
- $l_{ij} = \sum_u a_{iu} a_{uj}$：基因 $i$ 与基因 $j$ 经过中间节点 $u$ 的二阶共享路径权重和；
- $k_i = \sum_u a_{iu}, \ k_j = \sum_u a_{ju}$：两节点的节点度；
- 分母中包含 $\min(k_i, k_j)$ 起到了严格的归一化作用，使得 $\text{TOM}_{ij} \in [0, 1]$。
定义**拓扑相异度矩阵**：
$$d_{ij}^{\text{TOM}} = 1 - \text{TOM}_{ij}$$
以 $d^{\text{TOM}}$ 为输入执行系统分层聚类（Hierarchical Clustering），并使用**动态树剪枝算法**（Dynamic Tree Cut）自动识别各个离散共表达模块。

### 3. 模块特征基因（Module Eigengene, ME）与性状关联

每个共表达模块通常包含数百甚至数千个基因，如何用一个代表性变量概括整个模块在各个样本中的表达起伏？

1. **第一主成分特征提取**：
   将模块 $q$ 内的标准化表达矩阵记为 $\mathbf{X}^{(q)} \in \mathbb{R}^{n \times m}$。对其执行奇异值分解（SVD）：
   $$\mathbf{X}^{(q)} = \mathbf{U} \mathbf{\Sigma} \mathbf{V}^T$$
   取第一左奇异向量与奇异值的乘积作为**模块特征基因**（Module Eigengene, ME）：
   $$\mathbf{E}^{(q)} = \mathbf{u}_1 \sigma_1$$
   $\mathbf{E}^{(q)}$ 解释了该模块内所有基因在样本间表达变异的最大比例（通常超出 50%）；
2. **模块-表型性状相关性检验（Module-Trait Correlation）**：
   将样本的农艺生理指标向量 $\mathbf{y}$（如干旱存活率、千粒重、花青素含量）与各模块特征基因 $\mathbf{E}^{(q)}$ 计算 Pearson 相关系数：
   $$r_q = \text{cor}\left( \mathbf{E}^{(q)}, \mathbf{y} \right), \quad P_q = \text{Student's } t(r_q, n-2)$$
   筛选出具有极显著强相关（如 $|r| > 0.7, P < 10^{-4}$）的靶标模块；
3. **模块成员度（$kME$）与枢纽基因（Hub Genes）锁定**：
   计算单个基因与模块特征基因的关联系数 $kME_i = \text{cor}(\mathbf{x}_i, \mathbf{E}^{(q)})$，排名位居最顶端的基因（$kME > 0.85$ 且基因显著性 $GS > 0.7$）即为该模块的核心主控**枢纽基因（Hub Gene）**。

---

## 真实植物科研案例：紫米花青素生物合成调控网络

### 紫米籽粒发育共表达与花青素积累机制（*Sun et al., Scientific Reports, 2024*）
在对紫米与普通白米在不同籽粒灌浆期（花后 7, 14, 21, 28 天）的转录组比较中：
- 采用 WGCNA 在软阈值 $\beta = 8$ 下构建无标度网络，成功识别出 14 个共表达模块；
- 模块-性状关联分析锁定 `MEturquoise` 模块与籽粒花青素总含量呈现极其显著的正相关（$r = 0.88, P = 2 \times 10^{-7}$）；
- 网络拓扑分析挖掘出该模块的核心 Hub 基因包括查尔酮合成酶（*OsCHS*）、二氢黄酮醇还原酶（*OsDFR*）以及典型的 MYB-bHLH-WD40 转录因子复合体亚基，确立了紫米色素富集的分子协同网络。

---

## 关联工具与复现入口

- **WGCNA**：R 语言系统生物学核心包，提供 `pickSoftThreshold`、`adjacency`、`TOMsimilarity`、`cutreeDynamic` 与 `moduleEigengenes` 全流程实现。
- 参见[WGCNA 原始方法论文解读](../../../papers/wgcna-paper/)与[紫米花青素共表达案例文献](../../../papers/purple-rice-wgcna/)。
