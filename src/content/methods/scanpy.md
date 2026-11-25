---
title: Scanpy
name: Scanpy
summary: 基于 AnnData 架构的单细胞转录组 (scRNA-seq) 质控过滤、高维降维、k 近邻图构建、Leiden 聚类与差异表达分析 Python 库。
dataType: 单细胞表达矩阵 (AnnData .h5ad / 10x MTX / Loom)
principle: 局部多项式泊松高变特征选择、截断奇异值分解 (Truncated SVD)、高维模糊近邻图 (k-NN) 与 Leiden 社区发现
domainIds: [single-cell-spatial-omics]
topicIds: [m08-topic-01, m08-topic-02, m08-topic-03, m08-topic-04, m08-topic-05]
principleIds: [single-cell-graph]
dataIds: [single-cell-matrix]
paper: scanpy-paper
repository: https://github.com/scverse/scanpy
version: "1.13.0"
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在植物发育生物学、环境抗逆机制与作物细胞图谱研究中，传统的组织水平转录组（Bulk RNA-seq）测定的是数百万细胞混合物的“平均分子信号”，掩盖了干细胞分生组织、维管束形成层、保卫细胞及根毛细胞等稀有细胞类型的特异分子异质性。

**单细胞 RNA 测序（scRNA-seq）**通过微流控液滴捕获（如 10x Genomics Chromium）或高通量组合条形码技术，实现数千至数十万个单个植物细胞表达图谱的单分子计数测定。然而，scRNA-seq 数据具有极强的技术特征：
1. **极端稀疏与零膨胀（Zero-inflation / Dropouts）**：由于单细胞 mRNA 捕获效率限制，80%~90% 以上的基因观测计数为 0；
2. **细胞间测序深度差异悬殊**：不同油包捕获的细胞体积与裂解程度不同，文库大小差异可达数十倍；
3. **植物特异性组织挑战**：细胞壁酶解制备原生质体引发强烈的创伤应激应答；且植物细胞普遍存在核内复制（Endoreduplication），不同倍性细胞的转录本总量具有天然多峰性。

**Scanpy（Single-Cell Analysis in Python）**由德国慕尼黑亥姆霍兹中心 F. Alexander Wolf、Philipp Angerer 和 Fabian Theis 团队于 2018 年发表在 *Genome Biology* 上。作为现代 scverse 生态的绝对核心底座，Scanpy 围绕分块内存与磁盘映射格式 **AnnData（Annotated Data）**构建，提供了从低质量条形码质控过滤、文库深度归一化、高变基因（HVG）筛选、PCA 降维、高维模糊 $k$ 近邻图构建（$k$-NN graph）、Leiden 社区发现聚类到 UMAP 轨迹可视化的工业级端到端单细胞计算流水线。

---

## 核心算法数学原理与推导

Scanpy 的核心算法流程由严谨的矩阵代数、图论与信息统计学构建：

### 1. 文库大小深度归一化与方差稳定化对数变换

设原始表达计数矩阵为 $\mathbf{X} \in \mathbb{N}^{N \times M}$，其中元素 $x_{ij}$ 为细胞 $i$ 在基因 $j$ 上的原始 UMI 计数。单个细胞的总文库测序深度为 $S_i = \sum_{j=1}^M x_{ij}$。

为了消除不同细胞间因测序通量不均引起的系统性技术偏差，Scanpy 执行目标总和比例缩放：

$$\tilde{x}_{ij} = \frac{x_{ij}}{S_i} \times 10^4$$

随后应用自然对数变换（$\ln(1 + x)$），在保持非负性的同时实现大表达量基因的方差稳定化（Variance Stabilization）：

$$y_{ij} = \ln\left( 1 + \tilde{x}_{ij} \right)$$

### 2. 高度可变基因（Highly Variable Genes, HVG）选择模型

在全基因组 2~4 万个基因中，绝大部分为低表达看家基因或技术噪声。Scanpy 采用局部非参数泊松回归（Seurat / Cell Ranger 模式）：
1. 按照所有细胞中的平均对数表达量 $\bar{y}_j$ 将基因划分为多个表达区间（如 20 个 Bins）；
2. 在每个区间内计算基因的方差与均值之比（分散度参数 Dispersion, $D_j = \sigma_j^2 / \mu_j$）；
3. 计算该区间内离散度的中位数与中位数绝对偏差（MAD），为每个基因计算标准化的离散度分值（Normalized Dispersion）：
   $$z_j = \frac{D_j - \text{median}(D_{\text{bin}})}{\text{MAD}(D_{\text{bin}})}$$
4. 截取排名前 2,000 ~ 3,000 个高变异特征基因，彻底剔除低信息量噪声维度。

### 3. 高维截断 SVD 与高维模糊近邻图（$k$-NN Graph）

- **PCA 降维**：对标准化后的 HVG 矩阵执行中心化与标度化，利用截断奇异值分解（Truncated SVD）提取前 30~50 个主成分，解释大部分生物学协方差：
  $$\mathbf{Z} = \mathbf{U} \boldsymbol{\Sigma} \mathbf{V}^{\mathsf{T}}$$
- **模糊单形距离近邻图**：基于主成分欧氏距离，计算每个细胞的 $k$ 个最近邻细胞（默认 $k=15$）。利用 UMAP 局部连接核构建非对称高维模糊权重：
  $$w_{ij} = \exp\left( -\frac{\max(0, d(\mathbf{z}_i, \mathbf{z}_j) - \rho_i)}{\sigma_i} \right)$$
  随后对偶对称化：$W_{ij} = w_{ij} + w_{ji} - w_{ij}w_{ji}$，构成全群体的拓扑连通邻接图。

### 4. Leiden 社区发现图聚类算法

基于构建的 $k$-NN 细胞图，Scanpy 采用 Traag 等人（2019）提出的 **Leiden 社区发现算法**（相比经典 Louvain 算法，Leiden 具有严格的数学收敛证明，彻底杜绝了断裂不连通子群的拓扑缺陷）。

算法优化恒定 Potts 模型（Constant Potts Model, CPM）或模块度质量函数：

$$\mathcal{H}(\mathcal{P}) = \sum_{c \in \mathcal{P}} \left[ e_c - \gamma \binom{n_c}{2} \right]$$

其中 $e_c$ 为社区 $c$ 内部的实际边权重之和，$n_c$ 为社区内节点数，$\gamma$（参数 `resolution`）为聚类分辨率参数。调节 `resolution` 可自适应控制细胞分类的精细颗粒度。

---

## 生产环境标准流水线

以下展示利用 Scanpy 针对植物根系 scRNA-seq 表达矩阵执行严格质控、HVG 筛选、批次校正、Leiden 聚类与标记基因发掘的完整工业级 Python 脚本：

```python
import scanpy as sc
import numpy as np

# 步骤 1：读取单细胞原始表达矩阵并封装为 AnnData 对象
adata = sc.read_10x_mtx(
    "rice_root_filtered_feature_bc_matrix/",
    var_names="gene_symbols",
    cache=True
)
adata.var_names_make_unique()

# 步骤 2：计算细胞质控指标 (线粒体与叶绿体比例)
# 植物线粒体基因通常以 MT- 开头，叶绿体基因以 Pt- 或 CP- 开头
adata.var["mito"] = adata.var_names.str.startswith(("MT-", "LOC_OsM"))
adata.var["chloro"] = adata.var_names.str.startswith(("Pt-", "LOC_OsP"))
sc.pp.calculate_qc_metrics(
    adata,
    qc_vars=["mito", "chloro"],
    percent_top=None,
    log1p=False,
    inplace=True
)

# 步骤 3：严格质控过滤 (植物根系推荐标准)
# 过滤检出基因数 < 800 或 > 7000 的细胞 (防死细胞与超高双胞体)
# 线粒体比例严格过滤 < 5%；注意：叶片组织需考虑叶绿体特异阈值
adata = adata[
    (adata.obs.n_genes_by_counts >= 800) &
    (adata.obs.n_genes_by_counts <= 7000) &
    (adata.obs.pct_counts_mito < 5.0),
    :
]

# 步骤 4：文库深度标准化、对数变换并保留原始 counts
adata.raw = adata.copy() # 保存未缩放的纯物理计数供后续差异表达使用
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)

# 步骤 5：高变基因选择 (HVG) 与主成分分析 (PCA)
sc.pp.highly_variable_genes(adata, n_top_genes=2500, subset=False)
sc.tl.pca(adata, svd_solver="arpack", use_highly_variable=True)

# 步骤 6：构建 k-NN 邻近图并执行 Leiden 社区发现聚类
sc.pp.neighbors(adata, n_neighbors=15, n_pcs=30)
sc.tl.leiden(adata, resolution=0.6, key_added="leiden_res0.6")

# 步骤 7：非线性降维 UMAP 可视化与细胞群 Marker 基因计算
sc.tl.umap(adata, min_dist=0.3)
sc.tl.rank_genes_groups(adata, "leiden_res0.6", method="wilcoxon")

# 步骤 8：导出高保真细胞聚类图与标记基因点阵图 (Dotplot)
sc.pl.umap(adata, color=["leiden_res0.6", "pct_counts_mito"], save="_rice_root_clusters.pdf")
sc.pl.rank_genes_groups_dotplot(adata, n_genes=5, save="_marker_genes_dotplot.pdf")

# 保存处理完成的 AnnData 核心对象
adata.write("results/rice_root_processed.h5ad")
```

---

## 核心参数科学解析与植物调优指南

| 函数指令 | 推荐取值 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `normalize_total` | `target_sum = 1e4` | **文库大小目标和**；将每个细胞的总 UMI 缩放至 10,000，消除液滴测序深度差异。 |
| `n_top_genes` | `2000` ~ `3000` | **高变基因保留数**；植物全基因组基因数较多，2500 个 HVG 能较好平衡生物学分型与计算耗时。 |
| `n_neighbors` | `10` ~ `20` (默认 15) | **$k$ 近邻数**；决定局部拓扑连通性。小数值强调局部亚群细分，大数值强化大宏观簇的连贯性。 |
| `resolution` | `0.4` ~ `1.0` | **Leiden 聚类分辨率**；植物组织根尖主要细胞类型（8~12 种）通常在 `0.5 ~ 0.8` 下获得与组织学最吻合的分裂。 |
| `min_dist` | `0.3` ~ `0.5` | **UMAP 嵌入紧凑度**；控制点簇在二维平面的紧凑程度，过小会导致簇挤压重叠，过大会使内部拓扑松散。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 原生质体制备诱导的“创伤应激假象（Enzymatic Stress Artifacts）”
- **生化事实**：植物必须依赖纤维素酶、果胶酶处理数小时以彻底消化坚硬细胞壁制备原生质体。在此离体消化过程中，植物细胞会不可避免地激活强烈的机械创伤与渗透压胁迫防御反应。
- **严重后果**：全基因组中数百个热休克蛋白（*HSP70*, *HSP90*）、过氧化物酶以及创伤相关转录因子（如 *ERF*, *WRKY*）发生暴发式高表达。若不加甄别，聚类算法会强行将所有细胞切分出一个由应激基因主导的“巨大虚假细胞群”。
- **科学准则**：在执行聚类与差异分析前，必须系统检索植物公认的创伤基因集；若某个聚类簇仅由高表达的 *HSP* 与病程相关蛋白定义而缺乏细胞解剖标记，不可将其定性为新细胞类型。

### 2. 植物内复制（Endoreduplication）与双胞体（Doublet）过滤冲突
- **机制提示**：拟南芥、番茄、大豆的成熟叶肉细胞与表皮细胞普遍存在核内 DNA 复制现象（DNA 含量可达 4C、8C、16C 乃至 32C）。
- **严重误区**：在动物单细胞分析中，总 UMI 偏高（如大于平均值 3 倍）通常直接被判定为两个细胞混入同一液滴的“双胞体（Doublet）”并予以强行剔除。
- **植物科学对策**：高倍性植物细胞的细胞体积巨大，其转录本总量天然是二倍体细胞的数倍！**在植物中严禁机械设置过紧的 UMI 计数上限截断**，必须结合专用的 DoubletFinder 算法与细胞类型标记基因共同评估。

---

## 植物应用案例与真实文献证据

1. **水稻根尖单细胞转录组图谱与细胞分化分枝轨迹**：
   在单细胞解析水稻根系分生组织的突破性研究中（Zhang et al., *Nature Communications*, 2021），研究团队利用 Scanpy 对 27,000 余个水稻根尖单细胞进行了高通量预处理、PCA 降维与高分辨率 Leiden 聚类。成功鉴定了分生区干细胞、表皮、内皮层、厚壁组织及中央木质部导管等 12 种细胞谱系，并利用标记基因点阵图揭示了水稻抗旱节水关键基因在维管束的特异性极化富集（[Zhang et al., *Nature Communications*, 2021](https://doi.org/10.1038/s41467-021-22352-4)）。

---

## 实践排错与质控规范

- **错误 1：执行 `sc.tl.pca` 报错 `LinAlgError: SVD did not converge`**
  - *排查原因*：高变基因筛选后，矩阵中存在全为 0 的静默基因，或者表达值中混入了 `NaN` / `Inf`。
  - *解决方案*：在 PCA 前执行 `sc.pp.filter_genes(adata, min_cells=3)` 剔除超低频基因，检查并确保无缺失值。
- **错误 2：UMAP 图上出现大量互不相连的细小碎点簇**
  - *排查原因*：`n_neighbors` 设置过小（如 $k=3$）导致近邻图连通性严重断裂，或未进行适当的文库深度标准化。
  - *解决方案*：将 `n_neighbors` 恢复为推荐的标准值 15~20，并确保在对数变换前执行了 `normalize_total`。
