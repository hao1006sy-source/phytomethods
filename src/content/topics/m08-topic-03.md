---
title: 单细胞流形降维与图聚类：高变基因筛选、Leiden 模块度与 UMAP 空间拓扑推导
summary: 深入推导高变基因均值-方差拟合、截断奇异值分解 (PCA)、k-NN 模糊单纯形网络构建、Leiden 模块度最优化图聚类以及 UMAP 非线性流形投影交叉熵损失。
domain: single-cell-spatial-omics
methods: [scanpy]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：高维稀疏特征与非线性生物学流形

经过质控与文库归一化的单细胞表达矩阵通常包含上万个细胞与 $30,000 \sim 40,000$ 个植物基因。直接在几万维的超高维稀疏空间中计算欧氏距离，会遭遇严重的**维度灾难**（Curse of Dimensionality）——所有细胞对之间的欧氏距离趋近于均等，使得最近邻与最远邻失去统计判别力。

生物学上，决定特定细胞类型分化状态的核心转录程序往往由少数功能基因模块协同驱动。单细胞降维与聚类的核心目标，是**在大幅过滤技术采样泊松噪声的同时，将细胞投影至低维空间流形（Manifold）**，并依据拓扑近邻关系将功能相似的细胞归为独立的离散亚群。

![单细胞流形降维、Leiden 图聚类与 RNA Velocity 动力学矢量场](/phytomethods/images/topics/m08/single-cell-clustering-umap-and-rna-velocity.svg)

---

## 算法数学推导：特征选择、线性分解与图社团聚类

### 1. 高变基因（Highly Variable Genes, HVGs）选择模型

单细胞矩阵中绝大部分持家基因（如核糖体蛋白、细胞骨架）的表达波动主要源于技术抽样噪声。HVG 算法通过建模基因表达量与方差的依赖关系，筛选出方差显著超出技术泊松期望的生物学异质性基因（通常保留 $2,000 \sim 3,000$ 个）：

1. 计算每个基因在全细胞中的平均表达量 $\mu_g$ 与原始样本方差 $\sigma_g^2$；
2. 利用局部加权多项式回归（LOESS）在对数尺度上拟合期望方差曲线：
   $$\log_{10}(\sigma_g^2) = f\left(\log_{10}(\mu_g)\right)$$
3. 计算每个基因的标准差偏离度：
   $$z_g = \frac{\sigma_g^2 - \hat{\sigma}_g^2}{\text{SE}(\hat{\sigma}_g^2)}$$
   按 $z_g$ 降序排序，截取前 $2,000$ 个基因作为后续降维与聚类的核心特征集。

### 2. 主成分分析（PCA）截断奇异值分解

将 $N$ 个细胞在 $P$ 个高变基因上的标准化表达矩阵记为 $\mathbf{X} \in \mathbb{R}^{N \times P}$（均值为 0，方差为 1）。
PCA 通过正交线性变换将特征压缩至方差最大的低维子空间：
$$\mathbf{X} = \mathbf{U} \mathbf{\Sigma} \mathbf{V}^T$$
- $\mathbf{V} \in \mathbb{R}^{P \times d}$：前 $d$ 个特征向量（载荷矩阵，通常取 $d = 30 \sim 50$）；
- $\mathbf{Z} = \mathbf{U}_d \mathbf{\Sigma}_d = \mathbf{X} \mathbf{V}$：$N$ 个细胞在主成分空间中的低维坐标矩阵；
- **碎石图**（Scree Plot / Elbow Plot）：绘制各主成分解释方差比例曲线，拐点（Elbow Point）之后的主成分方差趋于平缓且主要为随机泊松噪声，据此客观确定截断维度 $d$。

### 3. $k$ 最近邻图（$k$-NN Graph）与模糊单纯形集

在 $d$ 维 PCA 空间中，利用欧氏距离计算细胞间的拓扑图网络：
1. 对每个细胞 $i$，搜索与其几何距离最近的 $k$ 个邻居细胞（通常取 $k = 15 \sim 30$）；
2. **UMAP 模糊单纯形集权重方程**：
   为适应植物细胞密度在流形上的不均匀分布，引入局部测地距离缩放因子 $\sigma_i$ 与到第 1 个最近邻的距离 $\rho_i$：
   $$w_{i \to j} = \exp\left( -\frac{\max(0, d_{ij} - \rho_i)}{\sigma_i} \right)$$
3. 建立无向对称图邻接矩阵：
   $$W_{ij} = w_{i \to j} + w_{j \to i} - w_{i \to j} \cdot w_{j \to i}$$
   $W_{ij}$ 精确表征了细胞 $i$ 与细胞 $j$ 在局部高维流形上的拓扑相连概率。

### 4. Leiden 模块度最大化图聚类算法

Louvain 算法是经典的社区发现算法，但在单细胞网络中经常出现**内部不连通的病态孤岛**（Disconnected Communities）。Leiden 算法（*Traag et al., Scientific Reports, 2019*）引入快速局部细化步骤，彻底保证了所有聚类亚群的连通性与最优性。

**优化目标质量函数（Constant Potts Model, CPM）**：
$$\mathcal{H} = \sum_{c \in \mathcal{C}} \left[ e_c - \gamma \binom{n_c}{2} \right]$$
- $e_c$：社区 $c$ 内部的实际边权重之和；
- $n_c$：社区 $c$ 内部的细胞节点总数；
- $\gamma$：**分辨率参数**（Resolution）：
  - $\gamma$ 较小（如 $0.2 \sim 0.5$）：偏向划分较少的大细胞群（如粗分：表皮、中柱、皮层）；
  - $\gamma$ 较大（如 $1.0 \sim 2.0$）：偏向细分亚群（如细分：原生木质部、后生木质部、原形成层、筛管伴胞）。
Leiden 通过**局部节点移动 -> 社区细化分裂 -> 图粗化聚合**三阶段快速迭代收敛。

### 5. UMAP（均匀流形逼近与投影）低维嵌入数学原理

UMAP（*McInnes et al., arXiv, 2018*）在低维二维平面（$\mathbf{y}_i \in \mathbb{R}^2$）中放置细胞点，使低维距离分布逼近高维拓扑：
1. **低维概率相似度**：
   $$q_{ij} = \left( 1 + a \|\mathbf{y}_i - \mathbf{y}_j\|_2^{2b} \right)^{-1}$$
   其中常数 $a \approx 1.577, b \approx 0.895$；
2. **模糊集交叉熵损失函数**（Cross-Entropy Loss）：
   $$\mathcal{L} = \sum_{i \neq j} \left[ W_{ij} \log \frac{W_{ij}}{q_{ij}} + (1 - W_{ij}) \log \frac{1 - W_{ij}}{1 - q_{ij}} \right]$$
   - 第 1 项（吸引力）：将高维邻居拉向低维邻近；
   - 第 2 项（排斥力）：将非高维邻居强力推开。
3. 利用随机梯度下降（SGD）更新二维坐标 $\mathbf{y}_i$。

*学术警示*：UMAP 二维图上群之间的物理空白间距或团块几何面积，并不等同于真实的欧氏进化距离或组织实际细胞数量，生物学判定必须回到高维主成分与特异标记基因。

---

## 真实植物科研案例：玉米茎尖分生组织单细胞拓扑解析

### 玉米茎尖分生组织（SAM）单细胞图谱（*Xu et al., Cell, 2021*）
在对玉米幼苗茎尖分生组织（Shoot Apical Meristem）的单细胞测序中：
- 采用 PCA 提取前 40 个主成分，构建 $k=20$ 的邻近图；
- 利用 Leiden 聚类在 resolution=0.8 下成功将 15,000 余个单细胞解析为外被层（L1）、亚表层（L2）与原体层（L3）分生组织；
- UMAP 二维投影完美再现了从中央多能干细胞区（Stem Cell Zone）向叶原基（Leaf Primordia）起始侧生器官分化的连续空间拓扑轨迹。

---

## 关联工具与复现入口

- **Scanpy**：通过 `sc.pp.highly_variable_genes`、`sc.pp.pca`、`sc.pp.neighbors`、`sc.tl.leiden` 与 `sc.tl.umap` 实现全套降维与图聚类流程。
- 参见[玉米茎尖单细胞论文 (Cell, 2021)](https://doi.org/10.1016/j.cell.2021.04.019)、[水稻根单细胞文献解读](../../../papers/rice-root-single-cell-2021/)与[Scanpy 降维与聚类实战教程](../../../tutorials/scanpy-synthetic/)。
