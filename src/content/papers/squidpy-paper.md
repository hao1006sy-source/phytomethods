---
title: "Squidpy: a scalable framework for spatial omics analysis"
summary: "构建基于空间邻近图拓扑、空间自相关统计与多模态显微组织图像特征的空间组学综合分析框架。"
authors: "Palla G, Spitzer H, Klein M, et al."
year: 2022
journal: Nature Methods
doi: 10.1038/s41592-021-01358-2
type: method
methodIds: [squidpy]
domainIds: [single-cell-spatial-omics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# Squidpy: a scalable framework for spatial omics analysis

## 1. 研究背景与算法贡献

空间组学技术（Spatial Omics，包括基于测序的 10x Visium、Stereo-seq、Slide-seq 以及基于原位杂交/成像的 MERFISH、seqFISH 与 Xenium）将单细胞分子特征与二维组织物理微环境坐标完美结合。然而，传统的单细胞分析方法（如降维聚类）将每个细胞视为相互独立抽样的无序点，彻底割裂了细胞之间在组织学空间中的物理拓扑关联。

为了解决空间分子数据分析缺乏统一框架的困境，慕尼黑亥姆霍兹中心与慕尼黑工业大学的 Giovanni Palla、Hannah Spitzer、Michal Klein 与 Fabian J. Theis 等在 2022 年推出了 **Squidpy**（发表于 *Nature Methods*）。Squidpy 构建在 `AnnData` 与 `Scanpy` 的成熟生态之上，其核心学术与算法贡献包括：
1. **统一的空间图拓扑抽象**：利用 Delaunay 三角剖分或空间欧氏距离，将任意空间组学技术捕获的物理位点映射为空间近邻图；
2. **丰富的空间统计学推断体系**：系统集成了 Moran's $I$ 空间自相关、空间微环境细胞类型富集度（Neighborhood Enrichment）、空间条件共现概率（Spatial Co-occurrence）以及基于受体-配体数据库的细胞间空间通讯分析；
3. **空间分子与高分辨率组织显微图像联合建模**：支持大规模全切片组织图像（WSI）的特征提取、细胞核分割与多模态对齐。

---

## 2. 核心数学模型与数据结构

### 2.1 空间坐标近邻图数据结构

Squidpy 将每个测序点或单细胞的物理坐标 $(x_i, y_i)$ 存储于 `adata.obsm['spatial']` 中：
- **图构建方式**：支持网格坐标图（Grid Graph，如 10x Visium 六边形点阵）、Delaunay 三角剖分图（Delaunay Triangulation，自适应密度）或预设物理半径 $r$ 内的最近邻图（Radius Graph）；
- **空间图存储**：空间近邻图以稀疏邻接矩阵存储在 `adata.obsp['spatial_connectivities']`，空间欧氏物理距离存储在 `adata.obsp['spatial_distances']`。

### 2.2 空间自相关与空间可变基因（SVGs）检测

为了识别表达模式与组织空间结构显著相关的基因，Squidpy 原生实现了经典的全局空间自相关统计量 **Moran's $I$**：
$$I = \frac{N}{W} \frac{\sum_{i=1}^N \sum_{j=1}^N w_{ij} (z_i - \bar{z})(z_j - \bar{z})}{\sum_{i=1}^N (z_i - \bar{z})^2}$$

其中：
- $N$ 为空间测序点总数；
- $w_{ij}$ 为两点之间的空间邻接权重矩阵；
- $W = \sum_i \sum_j w_{ij}$ 为全图空间权重之和；
- $z_i$ 为目标基因在第 $i$ 个位点上的表达丰度。

若 $I > 0$ 且显著偏离随机零假设，表明该基因在空间上具有明显的区域聚集表达特征（如组织特异性功能域）。

### 2.3 细胞微环境邻域富集与共现分析

- **邻域富集检验（Neighborhood Enrichment）**：采用空间排列置换检验（Permutation Test），在保持图拓扑结构不变的前提下随机打乱细胞类型标签，计算真实网络中细胞类型 $A$ 与细胞类型 $B$ 相邻边数相对于随机预期的富集 $z$-score。
- **空间共现打分（Spatial Co-occurrence）**：通过条件概率模型评估在距离目标细胞类型 $A$ 为物理间隔 $d$ 的圆形同心环带内观测到细胞类型 $B$ 的概率条件分布，精确刻画两类细胞在多大尺度上发生空间共存或空间排斥。

---

## 3. 算法复杂度与计算性能

1. **图计算与空间统计高度向量化**：借助 SciPy 空间 KD-Tree 与稀疏图代数，处理单张芯片上万个 Spots 的空间图构建与 Moran's $I$ 扫描仅需数十秒。
2. **轻量多进程支持**：基因层面的自相关检验与配体-受体空间置换检验支持多核并行分发调度。
3. **图像与分子特征分层解耦**：采用对大尺度图像切片（Image Tiling）的高性能懒加载（Lazy Loading），在普通台式机上即可处理数百兆乃至数吉字节的高清显微成像切片。

---

## 4. 植物基因组学应用场景与科研价值

高等植物器官（如叶片、根系、茎秆以及发育中的花与种子）具有高度严谨的同心圆向心层状结构或同轴背腹向极性：
- **植物器官解剖层级的空间转录本梯度定位**：在植物根系横切面中，由外向内分别为表皮、外皮层、皮层、内皮层（Casparian strip）、中柱鞘及中央维管束。利用 Squidpy 的空间自相关与空间聚类，可无需先验 Marker 基因直接识别受向心径向空间梯度调控的发育关键转录因子；
- **植物微环境细胞间通讯推断**：解析维管形成层（Cambium）干细胞与其两侧分化的木质部/韧皮部细胞之间通过多肽信号（如 CLE 多肽）与受体激酶（如 CLV1/BAM）介导的空间长程与短程分子通讯；
- **病原菌入侵局域表观与转录防御应答**：在叶片接种真菌或细菌后，Squidpy 的条件共现与距离衰减分析能够精确定量防御应答基因在感染病灶核心区与健康外围防御环之间的空间激活扩散边界。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心分析流程与执行命令
```python
import squidpy as sq
import scanpy as sc

# 1. 加载包含空间坐标的 AnnData 对象 (如 10x Visium)
adata = sq.read.visium("path/to/visium_output/")

# 2. 构建空间近邻拓扑图
sq.gr.spatial_neighbors(adata, n_rings=2, coord_type="generic")

# 3. 细胞类型空间邻域富集分析 (Neighborhood Enrichment)
sq.gr.nhood_enrichment(adata, cluster_key="cell_type")
sq.pl.nhood_enrichment(adata, cluster_key="cell_type", figsize=(6, 5))

# 4. 空间共现概率曲线计算 (Spatial Co-occurrence)
sq.gr.co_occurrence(adata, cluster_key="cell_type")
sq.pl.co_occurrence(adata, cluster_key="cell_type", clusters="Endodermis")

# 5. 全基因组空间自相关检验识别空间可变基因 (SVGs)
sq.gr.spatial_autocorr(
    adata,
    mode="moran",
    genes=adata.var_names,
    n_perms=100,
    n_jobs=8
)

# 6. 配体-受体细胞间空间通讯分析
sq.gr.ligand_receptor(
    adata,
    cluster_key="cell_type",
    interactions_params={"resources": "CellChatDB"},
    threshold=0.05
)
```

### 5.2 关键参数说明
- `n_rings=2`：空间邻接跳数（Ring depth），控制将邻近第几层近邻纳入局部图拓扑计算。
- `mode="moran"`：计算 Moran's $I$ 空间自相关系数；也可选 `"geary"`（Geary's $C$）。
- `coord_type="generic"` 或 `"grid"`：对非均匀散布点（如 Stereo-seq、MERFISH）使用 generic，对规则点阵（如 10x Visium）使用 grid。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Nature Methods 2022 DOI: 10.1038/s41592-021-01358-2](https://doi.org/10.1038/s41592-021-01358-2)
- **PubMed 记录**：[PMID: 35102346](https://pubmed.ncbi.nlm.nih.gov/35102346/)
- **Squidpy 官方代码仓库**：[scverse/squidpy GitHub](https://github.com/scverse/squidpy)
- **Squidpy 官方文档与案例**：[Squidpy Documentation](https://squidpy.readthedocs.io/)
- **站内配套专题**：[空间转录组学技术与数据整合](../../topics/single-cell-spatial-omics/m08-topic-06/)
- **站内配套专题**：[细胞通讯与空间模式推断](../../topics/single-cell-spatial-omics/m08-topic-07/)
