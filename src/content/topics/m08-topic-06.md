---
title: 空间转录组与细胞组成反卷积：Moran's I 空间自相关、Cell2location 贝叶斯推断与 Squidpy 邻域图谱
summary: 深入推导空间转录组原位捕获机制、Spot 组织混杂效应、Moran's I 空间自相关统计、Cell2location 层次贝叶斯负二项反卷积以及 Squidpy 空间微环境互作分析。
domain: single-cell-spatial-omics
methods: [cell2location, squidpy]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：空间位置丢失与多细胞 Spot 混杂

常规的单细胞 RNA 测序（scRNA-seq）必须将植物组织彻底酶解消化或匀浆打碎。虽然获得了单细胞维度的转录本谱，但**完全丢失了细胞在植物器官三维解剖结构中的物理空间坐标**，使得研究者无法解析细胞与其微环境邻近细胞之间的物理接触、空间通讯与极性排列。

空间转录组学（Spatial Transcriptomics，如 10x Visium、Stereo-seq、Slide-seq）直接在贴有新鲜冰冻或石蜡切片的阵列玻片上原位原位捕获 RNA：
- **阵列 Spot 分辨率局限**：10x Visium 捕获阵列的每个点（Spot）物理直径为 $55\ \mu\text{m}$，点间距为 $100\ \mu\text{m}$。对于植物幼嫩组织或紧密分生区，一个 Spot 直径通常覆盖 **$5 \sim 20$ 个植物细胞**（例如同时包含中柱鞘、韧皮部伴胞与内皮层细胞）；
- **空间反卷积（Spatial Deconvolution）使命**：借助纯净的高质量单细胞 scRNA-seq 参考图谱作为“字典”，利用计算统计学算法将每个 Spot 混合观测到的转录本计数，精确拆解为各个单细胞类型的绝对细胞数量与物理空间丰度。

![空间转录组学原位捕获机制与 Cell2location 贝叶斯反卷积模型](/phytomethods/images/topics/m08/spatial-transcriptomics-cell2location-deconvolution.svg)

---

## 算法数学推导：空间自相关、贝叶斯反卷积与邻域图谱

### 1. 空间自相关统计（Spatial Autocorrelation: Moran's $I$）

在空间切片上，如何客观判断某个基因的表达并非随机白噪声分布，而是呈现显著的**空间局部聚集结构域**（Spatial Variable Genes, SVGs）？

**Moran's $I$ 空间自相关方程推导**：
设空间切片包含 $N$ 个有效 Spots，基因 $g$ 在位置 $i$ 的标准化表达量为 $z_i = x_i - \bar{x}$。
1. 定义空间邻接权重矩阵 $\mathbf{W}$（如基于物理欧氏坐标的 $k$ 最近邻或距离倒数 $W_{ij} = 1/d_{ij}$）；
2. 计算全局 Moran's $I$ 系数：
   $$I = \frac{N}{S_0} \frac{\sum_{i=1}^N \sum_{j=1}^N W_{ij} (x_i - \bar{x})(x_j - \bar{x})}{\sum_{i=1}^N (x_i - \bar{x})^2}$$
   其中 $S_0 = \sum_i \sum_j W_{ij}$ 为全空间连接权重之和。
   - $I > 0$（正空间自相关）：空间临近的 Spots 具有相似的基因表达强度（形成清晰的同心圆组织结构域）；
   - $I = 0$：空间完全随机白噪声分布；
   - $I < 0$：棋盘状交替负自相关。
结合正态近似渐近分布或 Monte Carlo 空间坐标置换检验计算显著性 $P$ 值。

### 2. Cell2location 层次贝叶斯空间反卷积数学模型

Cell2location（*Kleshchevnikov et al., Nature Biotechnology, 2022*）是当前公认解析单细胞类型空间绝对丰度最精准的层次贝叶斯负二项模型。

#### (1) 模型输入
- **空间观测矩阵** $\mathbf{Y} \in \mathbb{R}^{S \times G}$：$S$ 个 Spots 上 $G$ 个共有基因的原始 UMI 计数；
- **单细胞参考字典** $\mathbf{G} \in \mathbb{R}^{F \times G}$：从 scRNA-seq 训练获得的 $F$ 个纯净细胞类型的平均基因表达谱（基因 $g$ 在类型 $f$ 中的特异签名 $g_{f, g}$）。

#### (2) 层次似然与生成方程
每个 Spot $s$ 上基因 $g$ 的观测计数 $y_{s, g}$ 严格遵循负二项分布：
$$y_{s, g} \sim \text{NegativeBinomial}\left( \mu_{s, g}, \alpha_g \right)$$
其中 $\alpha_g$ 为基因特异性离散度参数（Overdispersion）。其期望预测均值 $\mu_{s, g}$ 建立为线性加性分解：
$$\mu_{s, g} = m_s \left( \sum_{f=1}^{F} w_{s, f} g_{f, g} + b_{s, g} \right)$$
- **$w_{s, f}$（核心估计靶标）**：Spot $s$ 中属于参考细胞类型 $f$ 的**绝对细胞丰度**（Cell Abundance，即物理细胞个数）；
- **$m_s$**：Spot 特异性测序灵敏度比例因子（Account for library size fluctuations）；
- **$b_{s, g}$**：由于植物组织切片表面微量游离 RNA 物理扩散附着产生的非特异性背景底噪；
- **先验分布（Priors）**：对每个 Spot 赋予预期的平均物理细胞数先验（如 Gamma 分布，根据显微镜 DAPI 细胞核荧光染色估计均值约为 $8 \sim 15$）。

#### (3) 变分推断（Variational Inference, VI）
利用 Pyro 概率编程框架执行自动微分变分推断（ADVI），在 GPU 上并行迭代数十万步逼近全后验分布 $P(w_{s, f} \mid \mathbf{Y})$。最终输出每个 Spot 处每类植物细胞丰度的后验均值与第 5% 分位数（保守下界），有效压制了弱信号假阳性。

### 3. Squidpy 空间邻近图与空间共富集分析

Squidpy（*Palla et al., Nature Methods, 2022*）在反卷积细胞丰度或空间聚类的基础上，量化组织微环境互作：
1. **Delaunay 三角剖分与空间网格图**：
   依据 Spot 物理二维坐标 $(x_s, y_s)$ 构建空间拓扑图 $G_{\text{spatial}} = (V, E)$；
2. **邻域富集得分（Neighborhood Enrichment）**：
   统计细胞类型 $A$ 与细胞类型 $B$ 在空间物理连边两端出现的实际频数，与保持空间网络拓扑随机打乱细胞标签（Permutation）1,000 次的期望频数进行 $Z$-score 统计检验：
   $$Z_{A, B} = \frac{\text{Observed}(A, B) - \mu_{\text{perm}}}{\sigma_{\text{perm}}}$$
   $Z > 3$ 表明这两种植物细胞类型在空间上呈现高度显著的同向微环境聚集（如形成层细胞与木质部导管在空间紧密相邻）。

---

## 真实植物科研案例：水稻根系空间分子图谱

### 水稻根土壤胁迫微环境空间成像（*Nature, 2025*）
在对真实土壤环境生长的水稻根系进行原位解析时：
- 结合 Molecular Cartography 靶向多轮单分子荧光杂交技术与全转录组测序；
- 利用空间自相关与反卷积模型，成功解析出在土壤机械压实胁迫下，皮层厚壁细胞（Sclerenchyma）在空间环状分布的局域重构；
- 空间邻域分析揭示，特异表达乙烯响应因子的表皮细胞仅在直接与紧实土壤颗粒物理接触的外侧界面富集，展现了植物根系微环境对外部机械阻力的空间特异性响应。

---

## 关联工具与复现入口

- **Cell2location**：基于 PyTorch / Pyro 的空间转录组层次贝叶斯反卷积标准工具，支持 GPU 高度加速推断。
- **Squidpy**：基于 AnnData 的空间组学分析生态核心工具，提供空间坐标可视化、邻域富集、配体-受体空间共定位与 Moran's $I$ 计算。
- 参见[水稻根土壤胁迫空间研究文献解读](../../../papers/rice-root-soil-single-cell-2025/)与[Cell2location 方法论文](../../../papers/cell2location-paper/)。
