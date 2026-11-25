---
title: "SCANPY: large-scale single-cell gene expression data analysis"
summary: "提出基于 AnnData 数据结构与高效图算法的大规模单细胞转录组（scRNA-seq）分析计算生态。"
authors: "Wolf FA, Angerer P, Theis FJ"
year: 2018
journal: Genome Biology
doi: 10.1186/s13059-017-1382-0
type: method
methodIds: [scanpy]
domainIds: [single-cell-spatial-omics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# SCANPY: large-scale single-cell gene expression data analysis

## 1. 研究背景与算法贡献

随着液滴微流控技术（Droplet-based Microfluidics，如 10x Genomics）与高通量条形码测序技术的飞速发展，单细胞 RNA 测序（scRNA-seq）通量在短时间内从数千个细胞激增至数十万乃至数百万个细胞。传统单细胞分析工具生态（主要基于 R 语言环境，如早期的 Seurat 与 Monocle）在面对百万级稀疏表达矩阵时面临严重的物理内存膨胀与计算速度瓶颈，极大限制了超大规模单细胞图谱的快速探索。

2018 年，慕尼黑亥姆霍兹中心与慕尼黑工业大学的 F. Alexander Wolf、Philipp Angerer 与 Fabian J. Theis 在 *Genome Biology* 上推出了 **Scanpy**（Single-Cell ANalysis in PYthon）。Scanpy 的核心学术与工程贡献包括：
1. **构建了标准化的 AnnData（Annotated Data）数据结构**：统一了细胞观测（Observations）、基因特征（Variables）、低维流形嵌入与非结构化注释的层次化存储；
2. **率先实现了线性时间复杂度的图拓扑分析算法**：将近似最近邻搜索（ANN）、Louvain/Leiden 社区发现聚类与 UMAP/扩散图（Diffusion Maps）无缝集成；
3. **极佳的可扩展性与计算性能**：能够在常规服务器上以数分钟级的高速处理百万级单细胞数据，成为全球单细胞与空间组学生物信息学生态的基石框架。

---

## 2. 核心数学模型与数据结构

### 2.1 AnnData 核心数据组织模型

Scanpy 围绕 `AnnData` 对象设计，其底层基于高效的 SciPy 稀疏矩阵（`scipy.sparse.csr_matrix`）与 HDF5（`.h5ad` 文件）格式：
- **表达矩阵 $X$**：形状为 $N_{\text{cells}} \times M_{\text{genes}}$ 的浮点稀疏矩阵；
- **细胞观测元数据 `obs`**：行索引对应细胞唯一 Barcode，列包含测序深度、线粒体/叶绿体比例、细胞周期评分、聚类标签等；
- **基因变量元数据 `var`**：行索引对应 Gene ID / Symbol，列包含高变基因统计量、均值与方差；
- **多维降维投影 `obsm`**：存储低维嵌入坐标（如 PCA、UMAP、t-SNE、扩散组件）；
- **图结构与非结构化元数据 `uns` / `obsp`**：存储细胞间 $k$-近邻稀疏图邻接矩阵与连接权重。

### 2.2 近似最近邻图（$k$-NN Graph）与拓扑聚类

为避免高维欧氏距离计算爆炸，Scanpy 采用主成分空间降维（通常选取前 30–50 个 PCs）结合基于随机投影森林（Random Projection Forests）与最近邻下降（Nearest Neighbor Descent）的 **pynndescent** 近似最近邻算法：
- 构建有向/无向加权近邻图 $G = (V, E)$，两细胞 $i, j$ 之间的边权重 $W_{ij}$ 反映其局部转录流形相似度；
- 在邻域图上应用 **Leiden 聚类算法**（相较于传统 Louvain 彻底解决了孤立次优社区问题），通过优化模块度（Modularity）划分细胞类型：
  $$Q = \frac{1}{2m} \sum_{ij} \left[ W_{ij} - \gamma \frac{k_i k_j}{2m} \right] \delta(c_i, c_j)$$
  其中 $\gamma$ 为聚类分辨率（Resolution）参数。

### 2.3 伪时间分化轨迹推断（Diffusion Pseudotime, DPT）

Scanpy 原生集成了基于马尔可夫随机游走转移矩阵的扩散图与 DPT 算法：
- 计算细胞在扩散空间中的测地距离（Geodesic Distance）；
- 指定未分化的干细胞群作为根节点（Root Cell），计算全谱系中每个细胞沿分化流形的分化进程伪时间，能够精确识别连续分化路径中的分叉点与终端分枝。

---

## 3. 算法复杂度与计算性能

1. **近似近邻加速**：近似 $k$-NN 图构建时间复杂度为 $O(N \log N)$，使得细胞数量从 $10^4$ 扩展到 $10^6$ 时计算耗时平缓增长。
2. **多线程与稀疏优化**：核心矩阵归一化与代数计算高度向量化，百万级细胞的 PCA 降维与 UMAP 投影可在 10 分钟内完成，内存占用比同等规模的 R 密集对象低 70% 以上。
3. **快速 I/O**：基于 H5AD 与 Zarr 存储格式，支持内存映射（Memory Mapping）与按需流式读取，无需一次性加载全部数据即可浏览海量图谱。

---

## 4. 植物基因组学应用场景与科研价值

植物单细胞生物学研究面临细胞壁自发荧光、次生代谢物多以及各组织细胞大小悬殊的独特性质。Scanpy 在植物领域的广泛应用包括：
- **植物根尖分生组织细胞异质性全景**：在水稻、玉米、拟南芥等根尖解离样本中，Scanpy 能够高灵敏度解析中柱鞘（Pericycle）、木质部（Xylem）、韧皮部（Phloem）、内皮层（Endodermis）、皮层（Cortex）与表皮/根毛等各同心圆细胞层的特征标记基因；
- **分生组织干细胞命运决定与不对称分裂**：利用 Scanpy 的 DPT 伪时间与 PAGA（Partition-based Graph Abstraction）模块，重建由静止中心（Quiescent Center, QC）向不同分化支系演变的动态转录流；
- **非生物胁迫应答细胞类型特异性**：揭示干旱、盐害、重金属毒害下特定细胞层（如内皮层木栓质与凯氏带形成细胞）表观应答基因的瞬时激活。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心分析流程与执行命令
```python
import scanpy as sc

# 1. 读取 10x Genomics 原始输出或 H5AD 文件
adata = sc.read_10x_mtx('filtered_feature_bc_matrix/', var_names='gene_symbols', cache=True)

# 2. 基础质控过滤 (按基因数、计数深度与叶绿体/线粒体比例)
sc.pp.filter_cells(adata, min_genes=200)
sc.pp.filter_genes(adata, min_cells=3)
adata.var['mt'] = adata.var_names.str.startswith(('MT-', 'mt-'))  # 线粒体基因
sc.pp.calculate_qc_metrics(adata, qc_vars=['mt'], percent_top=None, log1p=False, inplace=True)
adata = adata[adata.obs.pct_counts_mt < 5, :]

# 3. 库容大小归一化与对数转换
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)

# 4. 高变基因 (HVG) 筛选与特征降维
sc.pp.highly_variable_genes(adata, min_mean=0.0125, max_mean=3, min_disp=0.5)
adata = adata[:, adata.var.highly_variable]
sc.pp.scale(adata, max_value=10)
sc.tl.pca(adata, svd_solver='arpack')

# 5. 近邻图构建与 Leiden 社区聚类
sc.pp.neighbors(adata, n_neighbors=15, n_pcs=30)
sc.tl.leiden(adata, resolution=0.5)
sc.tl.umap(adata)

# 6. 差异表达标记基因识别 (Marker Genes)
sc.tl.rank_genes_groups(adata, 'leiden', method='wilcoxon')
```

### 5.2 关键参数说明
- `target_sum=1e4`：将每个细胞的测序计数统一缩放至 10,000 UMI，消除文库覆盖度差异。
- `n_neighbors=15, n_pcs=30`：近邻图的局部拓扑参数，控制流形平滑度与精细结构的平衡。
- `resolution=0.5`：Leiden 聚类的分辨率阈值；植物样本探索中建议在 0.3 至 1.0 之间根据已知 Marker 基因进行微调。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Genome Biology 2018 DOI: 10.1186/s13059-017-1382-0](https://doi.org/10.1186/s13059-017-1382-0)
- **PubMed 记录**：[PMID: 29409532](https://pubmed.ncbi.nlm.nih.gov/29409532/)
- **Scanpy 官方文档与教程**：[Scanpy Documentation](https://scanpy.readthedocs.io/)
- **AnnData 官方规范**：[AnnData Documentation](https://anndata.readthedocs.io/)
- **站内配套专题**：[单细胞转录组测序技术与质控](../../topics/single-cell-spatial-omics/m08-topic-01/)
- **站内实操教程**：[Scanpy 单细胞转录组分析实战教程](../../tutorials/scanpy-synthetic/)
