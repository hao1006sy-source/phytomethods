---
title: cell2location
name: cell2location
summary: 基于贝叶斯负二项层次模型与空间多分辨率反卷积的空间转录组细胞类型丰度推断软件。
dataType: 单细胞 RNA-seq 参考表达矩阵、空间转录组 spot 原始 UMI 计数矩阵与组织空间坐标
principle: 层次贝叶斯负二项回归 (Hierarchical Bayesian Negative Binomial)、变分推断 (Variational Inference) 与多尺度细胞反卷积
domainIds: [single-cell-spatial-omics]
topicIds: [m08-topic-06]
principleIds: [bayesian-deconvolution]
dataIds: [single-cell-matrix, spatial-count-matrix]
paper: cell2location-paper
repository: https://github.com/BayraktarLab/cell2location
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在植物空间表观遗传与组织发育研究中，空间转录组技术（如 10x Visium、Stereo-seq、Slide-seq）打破了传统解离单细胞测序彻底丢失原始细胞位置信息的致命缺陷，实现了在保留植物根茎叶解剖切片原生空间坐标的同时，高通量捕获全基因组转录本。

然而，当前广泛应用的原位空间捕获技术（如 10x Visium）受限于捕获点物理尺寸（每个捕获点 spot 直径为 $55\,\mu\text{m}$，点间距 $100\,\mu\text{m}$）。在高度紧密的植物幼嫩分生组织中，**一个单独的测序点往往捕获了 2 到 15 个属于不同细胞类型的密集细胞群**。因此，测得的空间表达数据本质上是多种未知比例细胞的复合混合表达谱。

**cell2location** 由英国维康桑格研究所（Wellcome Sanger Institute）Vitalii Kleshchevnikov、Omer Bayraktar 等人于 2022 年发表在 *Nature Biotechnology* 上。作为当前空间反卷积领域公认的黄金标准工具，cell2location 采用**层次贝叶斯负二项模型（Hierarchical Bayesian Negative Binomial Model）**，以单细胞 scRNA-seq 聚类提取的高纯度细胞表达谱为基准，联合建模组织测序灵敏度、非特异性空间背景游离 RNA 以及位置特异的细胞混合比例，能够在每一个空间点上精确推断各个细胞类型的**绝对细胞数量（Absolute Cell Abundance）**，为精细绘制植物复杂器官的空间微环境架构提供了无可替代的计算解决方案。

---

## 核心算法数学原理与推导

cell2location 的两阶段统计模型基于概率图模型与随机变分推断：

### 1. 第一阶段：单细胞参考特征签名提取（Cell-Type Signatures）

设输入的已完成高质量细胞注释的单细胞 scRNA-seq 矩阵包含 $K$ 种细胞类型。对于单细胞表达数据，算法拟合基因 $g$ 在细胞类型 $k$ 中的参考平均表达期望值 $g_{kg}$：

$$c_{cg} \sim \text{NB}\left( \mu_{cg}, \alpha_g^{\text{sc}} \right)$$

$$\mu_{cg} = l_c \cdot g_{k(c), g}$$

其中 $l_c$ 为单细胞 $c$ 的文库大小因子，$g_{kg}$ 为完全消除文库大小差异后的纯净表达签名向量。

### 2. 第二阶段：空间混合层次负二项反卷积模型

设空间转录组切片包含 $S$ 个测序位置点（spots），包含 $G$ 个共同基因。在空间位置 $s$ 上，观测到基因 $g$ 的原始 UMI 计数为 $y_{sg}$。

cell2location 假定 $y_{sg}$ 服从带过离散参数 $\alpha_g$ 的负二项分布：

$$y_{sg} \sim \text{NB}\left( \mu_{sg}, \alpha_g \right)$$

其空间期望表达量 $\mu_{sg}$ 展开为线性和与加性背景的严密物理模型：

$$\mu_{sg} = m_g \left( \sum_{k=1}^K w_{sk} g_{kg} \right) + s_{sg} + \beta_{sg}$$

- $w_{sk} \ge 0$：空间位置 $s$ 上细胞类型 $k$ 的**绝对细胞丰度（Absolute Cell Abundance）**；
- $g_{kg}$：第一阶段锁定的参考特征签名；
- $m_g$：基因特异性的跨技术平台灵敏度缩放因子（由于空间玻片捕获效率通常低于单细胞解离文库）；
- $s_{sg}$：局部组织切片中未结合细胞的环境游离 RNA 污染背景；
- $\beta_{sg}$：实验批次相关的非特异性加性基线。

### 3. 先验概率分布与变分推断（Variational Inference）

为了约束庞大的参数空间，cell2location 引入层次共轭先验：
- 细胞丰度赋予 Gamma 先验：$w_{sk} \sim \text{Gamma}\left( \mu_{sk}, \sigma_{sk}^2 \right)$；
- 用户结合显微成像组织切片，提供该植物切片每个位置平均容纳细胞数的超参数先验 $\mathbb{E}[N_s] = \text{N\_cells\_per\_location}$。

算法构建基于 PyTorch 和 Pyro 的概率编程变分推断框架，通过最大化证据下界（Evidence Lower Bound, ELBO）优化变分分布参数，在数万个空间位置上联合推导出所有细胞类型丰度的完整后验概率分布（输出后验均值与第 5%、95% 分位数区间）。

---

## 生产环境标准流水线

以下展示利用 cell2location 在 Python 环境中基于水稻单细胞参考对植物切片空间数据执行全量反卷积分析的标准流程：

```python
import scanpy as sc
import cell2location as c2l
import torch

# 步骤 1：准备带有细胞类型注释 (cell_type) 的单细胞参考 AnnData (adata_ref)
# 准备带有空间坐标与原始 counts 的空间 AnnData (adata_vis)
adata_ref = sc.read_h5ad("rice_root_sc_reference.h5ad")
adata_vis = sc.read_h5ad("rice_stem_spatial_visium.h5ad")

# 步骤 2：提取两组学共同高变基因集
intersect_genes = list(set(adata_ref.var_names).intersection(set(adata_vis.var_names)))
adata_ref = adata_ref[:, intersect_genes].copy()
adata_vis = adata_vis[:, intersect_genes].copy()

# 步骤 3：第一阶段——训练单细胞参考签名回归模型
c2l.models.RegressionModel.setup_anndata(
    adata=adata_ref,
    batch_key=None,
    labels_key="cell_type"
)
mod_sc = c2l.models.RegressionModel(adata_ref)
mod_sc.train(max_epochs=250, use_gpu=True)

# 导出后验参考表达签名
adata_ref = mod_sc.export_posterior(adata_ref, sample_kwargs={"num_samples": 1000})
inf_aver = adata_ref.varm["means_per_cluster_mu_fg"]

# 步骤 4：第二阶段——执行空间负二项反卷积模型训练
# N_cells_per_location 设定植物切片每个 spot 平均细胞数先验 (例如 Visium 根切片通常为 8~12)
c2l.models.Cell2location.setup_anndata(adata=adata_vis)
mod_vis = c2l.models.Cell2location(
    adata_vis,
    cell_state_df=inf_aver,
    N_cells_per_location=10,
    detection_alpha=20
)
mod_vis.train(max_epochs=30000, batch_size=None, train_size=1, use_gpu=True)

# 导出空间细胞丰度后验分布并添加至 adata_vis.obs
adata_vis = mod_vis.export_posterior(adata_vis, sample_kwargs={"num_samples": 1000})

# 步骤 5：空间共定位可视化 (以木质部中柱鞘细胞类型为例)
adata_vis.obs["Xylem_abundance"] = adata_vis.obsm["q05_cell_abundance_w_sf"]["q05cell_abundance_w_sf_Xylem"]
sc.pl.spatial(adata_vis, color="Xylem_abundance", cmap="magma", save="_rice_xylem_spatial.pdf")
```

---

## 核心参数科学解析与植物调优指南

| 参数指令 | 推荐取值 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `N_cells_per_location` | `5` ~ `15` (植物特异) | **单捕获点平均细胞数先验**；必须结合组织切片 DAPI/显微镜核染色实测评估；紧凑幼嫩分生组织设为 12~15，大型厚壁成熟区设为 3~6。 |
| `detection_alpha` | `20` (默认) | **组织检测灵敏度超先验**；数值越大表示技术灵敏度越均一；植物组织富含多酚多糖易导致局部酶解不均，可设为 15~20。 |
| `max_epochs` | 空间模型 `20000`~`30000` | **变分推断训练轮数**；确保 ELBO 损失曲线彻底进入平坦期，防止欠拟合导致细胞丰度预测不足。 |
| `q05_cell_abundance` | 推荐结果展示字段 | **后验第 5% 分位数丰度**；作为保守置信估计（95% 置信区间下限），彻底杜绝虚假噪声假阳性。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 植物细胞体积跨度极大的“空间异质性困境”
- **解剖学事实**：在植物茎杆与根系横切面中，成熟导管细胞与厚角组织细胞的体积可达 $50 \sim 100\,\mu\text{m}$，单个捕获点仅能容纳 1~2 个细胞；而在维管束形成层与根尖分生区，未分化的小细胞直径仅 $5\,\mu\text{m}$，单个捕获点可容纳 20 个以上细胞。
- **调优对策**：绝不可机械依赖固定的 `N_cells_per_location`。cell2location 允许为不同组织区段（通过组织形态分割 mask）赋予不同先验，从而实现多分辨率非均一反卷积。

---

## 植物应用案例与真实文献证据

1. **水稻与玉米维管束环空间转录组细胞微环境原位重构**：
   在植物空间组织学前沿研究中，科研人员利用 10x Visium 结合 cell2location，将水稻根系单细胞图谱成功反卷积投射到原位切片上。通过对后验细胞丰度矩阵的层次聚类，高保真还原了内皮层与中柱之间不足 $30\,\mu\text{m}$ 的极窄空间分界线，精准识别出了围绕维管形成层特异性富集的抗逆信号转运小分子合成细胞微环境（Niche）。

---

## 实践排错与质控规范

- **错误 1：训练第 10 轮出现 `CUDA out of memory`**
  - *排查原因*：空间转录组 spot 数量过多（如 Stereo-seq 包含数十万点），未启用分批训练（Batch training）。
  - *解决方案*：设置参数 `batch_size = 2048`，或转移至拥有 24GB+ 显存的 GPU 上运行。
- **错误 2：反卷积后所有细胞类型的丰度几乎呈现完全均一的平坦背景**
  - *排查原因*：单细胞参考中的细胞类型定义混杂（不同亚群之间的标记基因完全重叠），导致模型无法解离独立信号。
  - *解决方案*：先在单细胞参考上执行严格的特征选择，合并标记基因无显著差异的过细子群后再输入第一阶段训练。
