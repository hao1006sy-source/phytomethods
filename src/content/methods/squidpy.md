---
title: Squidpy
name: Squidpy
summary: 为空间分子组学构建空间近邻拓扑图，执行空间自相关检验、微环境邻域富集与组织图像特征提取。
dataType: 空间物理坐标、单细胞/Spot 空间计数矩阵与高分辨率组织切片图像
principle: 空间近邻图、Moran's I/Geary's C 空间自相关、蒙特卡洛置换检验与邻域共现分析
domainIds: [single-cell-spatial-omics]
topicIds: [m08-topic-06]
principleIds: [spatial-neighborhood]
dataIds: [spatial-count-matrix, spatial-coordinates, tissue-image]
paper: squidpy-paper
repository: https://github.com/scverse/squidpy
version: "1.8.4"
status: published
updatedAt: 2026-11-25
---

## 软件定位与科学问题

在植物组织空间转录组学（如 10x Visium、Stereo-seq、MERFISH、Molecular Cartography 及原位测序 ISS）研究中，基因表达不再是悬浮离散的单细胞集合，而是深深植根于植物器官（根、茎、叶、花、果实）的二维或三维刚性物理结构中。

Squidpy 是 Python 单细胞生物信息学生态（scverse）中专门针对空间组学开发的核心算法库。它基于 `AnnData` 与 `SpatialData` 架构，将二维物理空间几何坐标与高维基因表达矩阵无缝耦合：
1. **空间邻域拓扑建模**：针对不同空间测序技术（规则网格排列的 Visium、亚微米高密度的 Stereo-seq/DNBSEQ、基于原位图像单分子捕获的 MERFISH）构建无向空间近邻图；
2. **空间异质性与模式检验**：通过严密的全局空间自相关统计量（Moran's I、Geary's C）以及空间可变基因（Spatial Variable Genes, SVGs）筛选，识别在特定解剖结构中聚集表达的基因；
3. **组织微环境与细胞共定位**：基于保持图拓扑结构不变的标签蒙特卡洛置换检验（Permutation Test），定量评估不同细胞类型之间的空间互斥（Spatial Avoidance）与空间共现（Colocalization）；
4. **多尺度图像特征融合**：直接对 H&E 明场或高分辨率自发荧光染色图像进行平铺裁剪（Tiling）、纹理与形态学特征提取，并与转录组特征关联。

需要严谨区分的是：Squidpy 专注于**空间统计与图模式分析**，并不负责对多细胞混合捕获 spot 进行细胞类型丰度反卷积（此任务应由 cell2location、Stereoscope 或 RCTD 完成）；它计算的空间共现亦不代表生物学因果信号传导，下游需配合分子生物学证据。

---

## 核心算法原理与数学推导

```
   [2D/3D 空间物理坐标 (X, Y)]  +  [空间转录计数矩阵 (Gene × Spot/Cell)]
                  │                                  │
                  ▼                                  ▼
      空间近邻图构建 (Spatial Graph)       文库深度与方差稳定化 (SCT/LogNorm)
      ├─ 六边形/正方形网格 (Grid)                      │
      ├─ Delaunay 三角剖分                            │
      └─ 空间距离截断 / k-NN                          │
                  │                                  │
                  ├─────────────────┬────────────────┘
                  ▼                 ▼
          空间自相关度量        微环境邻域富集分析
          ├─ 全局 Moran's I     ├─ 拓扑固定的标签随机置换
          ├─ Geary's C          ├─ 经验期望与方差估计
          └─ 蒙特卡洛 p 值检验  └─ 显著性 z-score 与条件共现概率
```

### 1. 空间邻域图构建 (Spatial Neighbor Graph)

设样本包含 $N$ 个空间观测点（spot 或经分割的 cell），其物理坐标为 $\mathbf{s}_i = (x_i, y_i) \in \mathbb{R}^2$（或三维坐标 $\mathbb{R}^3$）。Squidpy 构建对称空间邻接权重矩阵 $W \in \mathbb{R}^{N \times N}$：
- **规则网格模式（Grid Mode）**：适用于 10x Visium 等固定点阵芯片。Visium 为正六边形排列，每个 spot 在物理上具有 6 个等距离最近邻居。设定网格步长后，两点相邻则 $w_{ij} = 1$，否则 $w_{ij} = 0$；
- **Delaunay 三角剖分模式（Delaunay Triangulation）**：适用于原位成像技术（如 MERFISH、Molecular Cartography）中非均匀分布的单细胞中心点。通过构建平面 Voronoi 图的对偶 Delaunay 三角剖分，确保空间图全连通且无交叉边；
- **空间距离截断与 $k$-近邻模式（Radius / $k$-NN）**：指定欧氏距离阈值 $r$ 或邻居数 $k$：
  $$w_{ij} = \begin{cases} 1, & \text{若 } \|\mathbf{s}_i - \mathbf{s}_j\|_2 \le r \quad (i \neq j) \\ 0, & \text{其他} \end{cases}$$

### 2. 空间自相关统计量 (Spatial Autocorrelation)

为了从数万个基因中检验哪些基因的表达分布呈现显著的空间聚集性而非随机扩散，Squidpy 实现了两类经典的地理空间统计量：

#### (1) 全局 Moran's I
Moran's I 衡量全局空间协方差与总方差的比例：
$$I = \frac{N}{W_0} \frac{\sum_{i=1}^N \sum_{j=1}^N w_{ij} (x_i - \bar{x})(x_j - \bar{x})}{\sum_{i=1}^N (x_i - \bar{x})^2}$$
其中：
- $N$ 为空间点总数；
- $x_i$ 为基因在位置 $i$ 的标准化表达量，$\bar{x} = \frac{1}{N}\sum_{i=1}^N x_i$ 为平均表达水平；
- $w_{ij}$ 为空间权重矩阵元素，$W_0 = \sum_{i=1}^N \sum_{j=1}^N w_{ij}$ 为全图所有空间边权重的总和。

**数值含义与统计推断**：
- $I \in [-1, 1]$；
- $I > 0$ 表示正空间自相关（具有相似表达水平的点在物理空间上显著聚集）；
- $I < 0$ 表示负空间自相关（棋盘状互斥分布）；
- $I \approx -\frac{1}{N-1} \approx 0$ 表示空间随机独立分布。
- 显著性检验采用零假设下的正态近似解析解，或采用蒙特卡洛置换检验（打乱空间坐标 $B \ge 1000$ 次），计算经验 $p$ 值并利用 Benjamini-Hochberg (BH) 调整控制 FDR。

#### (2) Geary's C
与关注与均值离差的 Moran's I 相比，Geary's C 更加侧重直接空间近邻点之间的局部差值平方：
$$C = \frac{N - 1}{2 W_0} \frac{\sum_{i=1}^N \sum_{j=1}^N w_{ij} (x_i - x_j)^2}{\sum_{i=1}^N (x_i - \bar{x})^2}$$
- $C \in [0, 2]$；
- $C < 1$ 对应正自相关；$C > 1$ 对应负自相关；$C = 1$ 代表空间无相关。两者结合可有效防止全局极值对局部聚集性的掩盖。

### 3. 空间邻域富集分析 (Neighborhood Enrichment Analysis)

在已获得细胞类型注释的前提下，评估细胞类型 $a$ 与细胞类型 $b$ 是否具有在微环境中相邻的倾向：
1. 提取实际网络中连接类型 $a$ 与类型 $b$ 的总边数观测值：
   $$C_{ab} = \sum_{i \in \text{Type}(a)} \sum_{j \in \text{Type}(b)} w_{ij}$$
2. **保持空间拓扑固定的置换（Permutation Null Model）**：严格保持空间邻接矩阵 $W$ 不变，随机置换全切片细胞的类型标签，重复 $B$ 次（默认 $B = 1000$）；
3. 计算置换零分布下的均值 $\mu_{ab}$ 与标准差 $\sigma_{ab}$，得到空间富集 $z$-score：
   $$z_{ab} = \frac{C_{ab} - \mu_{ab}}{\sigma_{ab}}$$
   - $z_{ab} > 2$：类型 $a$ 与 $b$ 显著空间共定位（如植物木质部薄壁细胞与导管分子）；
   - $z_{ab} < -2$：类型 $a$ 与 $b$ 显著空间排斥（如根毛细胞与中柱鞘细胞）。

### 4. 条件共现概率曲线 (Co-occurrence Probability)

定义在物理距离区间 $[d - \Delta d, d + \Delta d]$ 内，在给定中心为类型 $i$ 的条件下，在其邻域内发现类型 $j$ 的条件概率：
$$P(j \mid i, d) = \frac{\sum_{k \in \text{Type}(i)} \sum_{l \in \text{Type}(j)} \mathbb{I}(\|\mathbf{s}_k - \mathbf{s}_l\|_2 \approx d)}{\sum_{k \in \text{Type}(i)} \sum_{m=1}^N \mathbb{I}(\|\mathbf{s}_k - \mathbf{s}_m\|_2 \approx d)}$$
随物理距离 $d$（微米 $\mu\text{m}$）从 $0$ 增加到组织切片尺度，绘制共现比值衰减曲线，可客观揭示植物器官中不同组织层（表皮、皮层、内皮层、中柱）的物理宽度与同心环向分层规律。

---

## 植物组织学特性与参数调优考量

在将 Squidpy 应用于植物系统时，必须针对植物组织解剖学的独特性质优化参数：

| 植物组织学挑战 | 物理机理与实验表现 | Squidpy 分析对策与参数建议 |
| :--- | :--- | :--- |
| **巨大细胞体积与非均一性** | 植物细胞跨度极大：分生组织细胞仅 5~10 $\mu\text{m}$，皮层与髓薄壁细胞常达 50~100 $\mu\text{m}$，导管分子甚至长达数百微米。 | 在 Visium (55 $\mu\text{m}$) 数据中，严禁假定每个 spot 细胞数恒定；在原位成像数据中构建 $k$-NN 图时，$k$ 值需适配组织稀疏度，或改用以微米为绝对单位的物理半径 `radius` 约束。 |
| **细胞壁自发荧光干扰** | 植物细胞壁富含木质素、纤维素、木栓质与果胶，在蓝绿荧光通道下发射强烈自发荧光，常导致细胞图像分割过分割或漏检。 | 运行 `sq.im.segment` 时，应优先使用红外/远红外荧光染色或专为植物微管/细胞壁优化的模型，并在空间统计前人工核查分割掩膜质控。 |
| **质外体与胞间连丝通讯** | 植物无动物细胞游走与循环系统，细胞间信号主要依靠胞间连丝（Symplastic）小分子扩散或质外体（Apoplastic）小肽配体转运。 | 评估 Ligand-Receptor 互作时，不可直接使用人类/小鼠 CellChat 数据库，必须切换为植物肽类激素（如 CLE、RALF、PSK）及其受体激酶（RLK/RLP）的受试数据库。 |
| **气腔与解剖空腔阻隔** | 水稻等水生植物通气组织（Aerenchyma）及茎秆髓腔具有大面积无细胞空气腔。 | 严禁使用全连通 Delaunay 三角剖分跨越通气腔连接两侧细胞；必须设置最大物理距离截断 `max_edge_distance`，剔除跨越气腔的虚假空间边。 |

---

## 典型命令与核心工作流

以下为基于 Python 3.10+ / Squidpy 1.8+ 的标准植物空间转录组分析流程：

```python
import squidpy as sq
import scanpy as sc
import matplotlib.pyplot as plt

# 1. 载入带有空间坐标的 AnnData 对象
# 要求: adata.obsm['spatial'] 包含 (N, 2) 物理像素或微米坐标
adata = sc.read_h5ad("plant_root_spatial.h5ad")

# 2. 空间邻接图构建 (针对原位单分子点阵或单细胞分割数据)
# 使用物理距离截断 (例如植物根横截面最大细胞间距 40 微米)
sq.gr.spatial_neighbors(
    adata,
    coord_type="generic",        # generic: 任意连续坐标; grid: 规则网格
    spatial_key="spatial",
    n_neighs=6,                  # 基础近邻数
    radius=40.0,                 # 截断物理半径 (微米)
    key_added="spatial_nhood"
)

# 3. 全局空间自相关检验 (识别空间可变基因 SVGs)
# 运行 Moran's I 并通过 1000 次置换计算经验 p 值
sq.gr.spatial_autocorr(
    adata,
    connectivity_key="spatial_nhood_connectivities",
    mode="moran",
    genes=adata.var_names[adata.var['highly_variable']],  # 仅测试高变基因以节省内存
    n_perms=1000,
    n_jobs=8
)

# 提取排名前 10 的空间聚集显著基因
top_svgs = adata.uns["moranI"].sort_values("I", ascending=False).head(10)
print("Top Spatial Variable Genes:\n", top_svgs[['I', 'pval_norm_fdr_bh']])

# 4. 细胞类型空间邻域富集分析 (Neighborhood Enrichment)
sq.gr.nhood_enrichment(
    adata,
    cluster_key="cell_type",
    connectivity_key="spatial_nhood_connectivities",
    n_perms=1000,
    seed=42
)

# 可视化富集矩阵热图 (红: 空间共定位; 蓝: 空间互斥)
sq.pl.nhood_enrichment(
    adata,
    cluster_key="cell_type",
    figsize=(6, 5),
    save="plant_nhood_enrichment.pdf"
)

# 5. 条件共现概率曲线 (Co-occurrence)
sq.gr.co_occurrence(
    adata,
    cluster_key="cell_type",
    spatial_key="spatial",
    n_splits=50,                  # 距离分段数
    max_dist=300.0               # 最大考察物理距离 (微米)
)

sq.pl.co_occurrence(
    adata,
    cluster_key="cell_type",
    clusters=["Xylem_Parenchyma", "Protoxylem", "Cortex"],
    save="plant_co_occurrence.pdf"
)
```

---

## 科学研究案例与工具边界

- **水稻根系土壤胁迫空间表达案例**：在水稻根系应对缺铁和重金属胁迫的原位空间测序中，研究者利用 Molecular Cartography 测定数十个转录本在皮层与外皮层细胞中的亚微米点阵分布。通过空间自相关分析定量验证了金属转运蛋白转录本在木质部鞘外侧的极性空间富集；
- **分析工具协同边界**：
  - **上游衔接**：原始测序 reads 通过 Space Ranger (Visium) 或 BGI/STOmics 流程比对定量，并由 Scanpy 完成文库深度归一化和高变基因筛选；若为组织芯片多细胞 spot，应先经 cell2location 完成丰度估计；
  - **下游拓展**：Squidpy 识别的空间邻域共现簇可作为下游配体-受体分析（如 LIANA、CellPhoneDB 的植物定制版）的解剖空间先验约束，剔除在物理空间上相距甚远的不可能互作。
