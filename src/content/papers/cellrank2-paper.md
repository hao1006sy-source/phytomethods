---
title: "CellRank 2: unified fate mapping in multiview single-cell data"
summary: "提出多视角细胞状态转移核解耦架构与广义 Perron-Frobenius 吸收马尔可夫链的单细胞命运推断与分化轨迹分析框架。"
authors: "Weiler P, Lange M, Klein M, et al."
year: 2024
journal: Nature Methods
doi: 10.1038/s41592-024-02303-9
type: method
methodIds: [cellrank]
domainIds: [single-cell-spatial-omics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# CellRank 2: unified fate mapping in multiview single-cell data

## 1. 研究背景与算法贡献

在单细胞生物学中，推断细胞发育轨迹、分化方向以及终末细胞命运决定是解析个体发育、组织再生与胁迫响应的核心目标。传统的单细胞动力学推断工具存在显著局限：
1. **伪时间（Pseudotime）方向性假设过于脆弱**：常规拟时间算法依赖图测地线距离，本质上是无向的，必须人为强行指定初始根细胞；
2. **RNA 速度（RNA Velocity）噪声与假象干扰**：虽然 RNA 速度基于未剪切/剪切转录本比率推导了局域方向导数，但在多倍体、转录停滞或非稳态深分化细胞中极易产生反向旋涡等数学假象；
3. **多模态与多时间点数据割裂**：实验时间序列（Time-course）、细胞发育潜能评分（如 CytoTRACE）、表观遗传状态（scATAC）以及空间邻域等丰富“多视角（Multiview）”信息无法统一整合。

2024 年，Philipp Weiler、Marius Lange、Michal Klein 与 Fabian J. Theis 等在 *Nature Methods* 推出了 **CellRank 2**。CellRank 2 彻底重构了单细胞命运图谱（Fate Mapping）的数学理论框架：
- **解耦细胞转移估计与宏观状态推断**：构建了完全模块化、可自由组合的**多视角转移核（Transition Kernels）**；
- **广义 Perron-Frobenius 聚类与马尔可夫吸收链（GPCCA）**：将高维连续细胞流形转化为稳健的宏观离散马尔可夫吸收链；
- **全谱系命运概率与驱动基因解析**：能够以严格的统计学概率推导任意前体细胞分化走向各个终末命运的吸收概率（Absorption Probabilities），并无偏筛选驱动谱系分化的关键调控基因。

---

## 2. 核心数学模型与数据结构

### 2.1 模块化多视角转移核（Multiview Transition Kernels）

CellRank 2 认为每一种生物学数据模式都提供了细胞间动力学跃迁的一个独特“视角（View）”。定义转移核 $K(x_i, x_j)$ 刻画细胞 $i$ 跃迁至其邻近细胞 $j$ 的似然：
- **VelocityKernel**：利用 RNA 速度向量与邻域细胞表达差分向量之间的相关系数构建转移概率；
- **PseudotimeKernel**：利用单调递增的分化潜能或扩散伪时间赋予有向转移偏好；
- **CytoTRACEKernel**：利用转录组多样性（未分化细胞表达基因数更多）评估细胞分化干性；
- **RealTimeKernel**：针对多时间点连续采样数据，基于最优传输理论（Optimal Transport, WOT）计算相邻时间批次之间的转移。

各核函数归一化为行随机转移矩阵 $T_k$（满足 $\sum_j T_{k, ij} = 1$），并通过加权凸组合实现多模态联合推断：
$$T_{\text{combined}} = \sum_{k=1}^M w_k T_k, \quad \sum_{k=1}^M w_k = 1$$

### 2.2 广义 Perron-Frobenius 聚类（GPCCA）与马尔可夫吸收态

在获得组合转移概率矩阵 $T$ 后，CellRank 2 借助 **GPCCA（Generalized Perron Cluster Cluster Analysis）** 求解转移算子谱分解：
- 将连续单细胞图谱映射为少数几个具有极长停留时间的亚稳态宏观状态（Metastable Macro-states）；
- 自动识别体系中的**初始状态（Initial States）**与**终末分化状态（Terminal States）**，无需人为硬编码先验。

### 2.3 终末命运吸收概率（Absorption Probabilities）

将状态划分为瞬态集合（Transient States, $Q$）与终末吸收态集合（Recurrent / Absorbing States, $R$）：
$$T = \begin{pmatrix} Q & R \\ 0 & I \end{pmatrix}$$

前体细胞在瞬态中漫游并最终落入各个终末谱系 $k$ 的吸收概率矩阵 $B$ 满足：
$$B = (I - Q)^{-1} R$$

矩阵每一行对应一个细胞，每一列代表其分化至特定终末细胞类型的定量概率（和为 1）。

---

## 4. 植物基因组学应用场景与科研价值

植物具有独特的终生胚性发育潜能（Totipotency），其茎尖分生组织（SAM）与根尖分生组织（RAM）持续产生全部分化器官：
- **植物根尖多分枝细胞命运决定推断**：在拟南芥和水稻根系中，静止中心（QC）维持周围干细胞的未分化状态。CellRank 2 能够精准计算根毛表皮细胞、非根毛细胞、皮层和内皮层细胞由共同祖先细胞分流的精细分化倾向与临界分水岭；
- **木质部与韧皮部维管分化谱系驱动因子挖掘**：利用 `compute_lineage_drivers()` 模块，沿导管分子（Tracheary Elements）或筛管分子分化路径，精准筛选出关键 NAC 家族转录因子（如 VND、NST）及特异性水通道蛋白的时序活化级联；
- **愈伤组织与器官从头再生（Regeneration）动态**：推断植物体细胞在脱分化与重分化形成芽原基或根原基过程中的细胞轨迹转移。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Nature Methods 2024 DOI: 10.1038/s41592-024-02303-9](https://doi.org/10.1038/s41592-024-02303-9)
- **PubMed 记录**：[PMID: 38287140](https://pubmed.ncbi.nlm.nih.gov/38287140/)
- **CellRank 官方文档与案例库**：[CellRank Documentation](https://cellrank.readthedocs.io/)
- **源码仓库**：[theislab/cellrank GitHub](https://github.com/theislab/cellrank)
- **站内配套专题**：[单细胞拟时间序列与细胞轨迹推断](../../topics/single-cell-spatial-omics/m08-topic-04/)
- **站内配套专题**：[单细胞转录组测序技术与质控](../../topics/single-cell-spatial-omics/m08-topic-01/)
