---
title: "Cell2location maps fine-grained cell types in spatial transcriptomics"
summary: "基于层次贝叶斯模型与变分推断的高灵敏度空间转录组微细细胞类型解卷积算法。"
authors: "Kleshchevnikov V, Shmatko A, Dann E, et al."
year: 2022
journal: Nature Biotechnology
doi: 10.1038/s41587-021-01139-4
type: method
methodIds: [cell2location]
domainIds: [single-cell-spatial-omics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# Cell2location maps fine-grained cell types in spatial transcriptomics

## 1. 研究背景与算法贡献

高通量空间转录组技术（如 10x Visium 等）极大地推进了组织结构内分子表达空间异质性的解析。然而，由于主流芯片捕获斑点（Spot，直径通常为 55 $\mu$m，中心距 100 $\mu$m）的物理分辨率限制，单个 Spot 内通常覆盖 5 至 30 个不同类型的紧密堆叠细胞，产生复杂的复合表达谱。若直接对 Spot 级别转录组进行聚类分析，会混淆稀有细胞亚型并严重模糊真实的组织解剖微边界。

将高精度的单细胞 RNA-seq（scRNA-seq）细胞类型参考特征映射到空间转录组上进行**空间解卷积（Spatial Deconvolution）**，是解决多细胞混合 Spot 的核心计算途径。传统的线性回归或非负矩阵分解（NMF）工具存在显著缺陷：
1. 忽略了单细胞测序与空间测序之间因不同酶学和捕获化学引起的**平台特异性技术偏好（Platform Effects）**；
2. 无法有效建模测序深度波动、批次效应以及空间上普遍存在的技术非特异性加性与乘性背景噪声。

英国桑格研究所与 EMBL-EBI 的 Vitalii Kleshchevnikov、Artem Shmatko、Emma Dann 与 Oliver Stegle 等在 2022 年推出了 **Cell2location**（发表于 *Nature Biotechnology*）。Cell2location 构建了一套完备严谨的**层次贝叶斯概率生成模型**，能够同时推断不同微环境位置下的各细胞亚型绝对丰度、技术变异与未捕获基因背景，在微细甚至高度相似的细胞亚型解卷积上展现出突破性的灵敏度与特异性。

---

## 2. 核心数学模型与数据结构

### 2.1 层次贝叶斯计数生成模型

设空间转录组芯片中，位置 $s \in \{1,\dots,S\}$ 上基因 $g \in \{1,\dots,G\}$ 的原始 UMI 计数为 $d_{sg}$。Cell2location 将观测计数建模为**负二项分布（Negative Binomial, NB）**，以捕获高维测序数据的过度离散性：
$$d_{sg} \sim \text{NegativeBinomial}\left(\mu_{sg}, \alpha_g\right)$$

其中 $\alpha_g$ 为基因特异性离散度参数，均值 $\mu_{sg}$ 展开为以下生成过程：
$$\mu_{sg} = m_g \left( \sum_{f=1}^F w_{sf} g_{fg} + s_{sg} \right) + y_{s, \text{tech}}$$

关键变量定义：
- $g_{fg}$：**参考签名**，即单细胞参考图谱中细胞类型 $f$ 对基因 $g$ 的平均表达特征（预先通过负二项回归估计得到）；
- $w_{sf}$：**待求核心目标**，即位置 $s$ 上细胞类型 $f$ 的**绝对细胞丰度（Absolute Cell Abundance）**；
- $m_g$：基因特异性的平台敏感度比例缩放因子（校正 scRNA 与空间技术的捕获效率差异）；
- $s_{sg}$：生物学未捕获组分与非特异性背景；
- $y_{s, \text{tech}}$：位置特异性技术加性背景。

### 2.2 变分推断与超参数先验约束

模型采用马尔可夫链蒙特卡洛（MCMC）或更快速的**平均场变分推断（Mean-field Variational Inference）**，基于 PyTorch 和 Pyro 概率编程库进行联合参数估计：
- 对绝对细胞丰度 $w_{sf}$ 赋予包含平均每个 Spot 预期细胞数（`N_cells_per_location`）的 Gamma 先验；
- 能够输出每个细胞亚型在每个空间 Spot 上的完整后验分布分位数（如 5%、50%、95% 分位数），为实验判断提供稳健的置信度。

---

## 3. 算法复杂度与计算性能

1. **GPU 深度加速**：Cell2location 采用基于 PyTorch 的变分优化，充分利用现代 GPU 的张量并行能力。包含 3000–5000 个 Spots、数万个基因以及数十个细胞类型的空间芯片，在单块标准 GPU 上仅需 15–30 分钟即可完成全参数收敛。
2. **两阶段架构优化**：第一阶段独立估计单细胞参考签名并固定，第二阶段专心求解空间多项参数，大幅降低了解卷积优化空间的耦合度与求解耗时。

---

## 4. 植物基因组学应用场景与科研价值

植物组织解剖结构严密且细胞壁致密，在空间芯片上各组织层紧密贴合：
- **植物微薄组织层的高保真反卷积**：例如植物根系横截面中，内皮层（Endodermis）与中柱鞘（Pericycle）通常仅有单层细胞厚度，在 Visium Spot 中必定与皮层或维管束细胞混合。Cell2location 能够从复合信号中将内皮层特异性表达精确剥离还原；
- **茎尖分生组织（SAM）干细胞微环境定位**：将 WUSCHEL 阳性的干细胞组织中心（OC）、CLV3 阳性干细胞区以及侧翼分生组织原基的单细胞表达谱精确锚定回植物茎尖分生组织的实际三维物理位置；
- **植物受精胚珠与胚乳空间图谱解析**：在复杂双受精生殖器官中，解析合子、母体种皮与三倍体胚乳之间的精细空间交界互作。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心分析工作流与代码示例
```python
import scanpy as sc
import cell2location
import torch

# 1. 第一阶段: 从单细胞参考 AnnData 中估计细胞类型表达签名
from cell2location.models import RegressionModel
RegressionModel.setup_anndata(
    adata=adata_ref,
    batch_key="sample",
    labels_key="cell_type"
)
mod_ref = RegressionModel(adata_ref)
mod_ref.train(max_epochs=250, use_gpu=True)
adata_ref = mod_ref.export_posterior(adata_ref)
inf_aver = adata_ref.varm['means_per_cluster_mu_fg']

# 2. 第二阶段: 空间转录组数据对齐与解卷积模型训练
from cell2location.models import Cell2location
# 保持空间与单细胞基因交集一致
intersect = adata_spatial.var_names.intersection(inf_aver.index)
adata_spatial = adata_spatial[:, intersect]
inf_aver = inf_aver.loc[intersect, :]

Cell2location.setup_anndata(adata=adata_spatial, batch_key="sample")
mod_spatial = Cell2location(
    adata_spatial,
    cell_state_df=inf_aver,
    # 核心超参数: 根据显微组织染色评估每个 Spot 平均细胞数
    N_cells_per_location=8,
    detection_alpha=20
)
mod_spatial.train(max_epochs=30000, batch_size=None, train_size=1, use_gpu=True)

# 3. 导出后验丰度矩阵并绘制空间分布图
adata_spatial = mod_spatial.export_posterior(adata_spatial)
# 细胞类型预测绝对丰度保存在 adata_spatial.obsm['q05_cell_abundance_w_sf']
```

### 5.2 关键参数说明
- `N_cells_per_location`：每个空间捕获点（Spot）的**预期平均细胞数**。需根据植物组织切片 DAPI/焦木素染色进行细胞核计数估计（植物致密分生组织设为 10–20，疏松海绵组织设为 4–8）。
- `detection_alpha=20`：技术敏感度变异正则化参数，数值越大对平台效应越稳健。
- `q05_cell_abundance_w_sf`：推荐使用后验分布的第 5 百分位数作为保守且高置信度的细胞绝对丰度估计，有效控制假阳性。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Nature Biotechnology 2022 DOI: 10.1038/s41587-021-01139-4](https://doi.org/10.1038/s41587-021-01139-4)
- **PubMed 记录**：[PMID: 35027729](https://pubmed.ncbi.nlm.nih.gov/35027729/)
- **Cell2location 官方开源仓库**：[BayraktarLab/cell2location GitHub](https://github.com/BayraktarLab/cell2location)
- **Cell2location 官方教程文档**：[Cell2location Documentation](https://cell2location.readthedocs.io/)
- **站内配套专题**：[空间转录组学技术与数据整合](../../topics/single-cell-spatial-omics/m08-topic-06/)
- **站内配套专题**：[单细胞多组学整合分析](../../topics/single-cell-spatial-omics/m08-topic-05/)
