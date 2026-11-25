---
title: ArchR
name: ArchR
summary: 面向单细胞染色质可及性 (scATAC-seq) 的超高通量数据分析、降维聚类、转录因子足迹与表观基因组多模态整合 R 软件包。
dataType: scATAC-seq 片段文件 (Fragments TSV/BED)、基因组注释与单细胞元数据
principle: 基于 Arrow 分块磁盘存储、迭代潜在语义索引 (Iterative LSI)、基因活性评分 (Gene Score) 与转录因子足迹 (Footprinting)
domainIds: [single-cell-spatial-omics]
topicIds: [m08-topic-07]
principleIds: [chromatin-accessibility, multi-omics-integration]
dataIds: [atac-fragments, single-cell-matrix]
paper: archr-paper
repository: https://github.com/GreenleafLab/ArchR
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在植物发育生物学与细胞图谱构建中，**单细胞转座酶可接近染色质测序（scATAC-seq）**是解析植物根尖分生组织、幼苗真叶、花药分化以及维管束等复杂异质组织中不同细胞类型顺式调控全景的革命性技术。

然而，单细胞表观数据具有两大极端特征：
1. **极限稀疏性（Extreme Sparsity）**：在单个二倍体细胞中，某个特定的调控位点仅有 2 个 DNA 拷贝。受限于转座酶捕获效率，单细胞 ATAC-seq 矩阵中 **98%~99% 的数值为 0（二元稀疏）**；
2. **大数据与内存海啸**：单次实验捕获的单细胞数量迅速迈向数万至上百万个，全基因组开放位点多达数十万个。若采用传统的纯内存 R 矩阵对象（如早期的单细胞包），仅存储和计算就会迅速耗尽数百 GB 内存而彻底崩溃。

**ArchR（Analysis of Regulatory Chromatin in R）**由斯坦福大学 William Greenleaf 与 Howard Chang 教授团队 Jeffrey Granja 等人于 2021 年发表在 *Nature Genetics* 上。作为单细胞表观组学领域的工业级统治级软件，ArchR 实现了重大突破：
- 首创**分块磁盘流式架构（Arrow Files / HDF5-based）**，在普通台式机（$< 16\text{ GB}$ 内存）上即可飞速处理数十万单细胞；
- 采用**迭代潜在语义索引（Iterative LSI）**，彻底打破稀疏二元矩阵的噪声屏障；
- 基于启动子与增强子距离指数衰减模型推算**基因活性评分（Gene Activity Score）**，实现了单细胞 ATAC-seq 与单细胞 RNA-seq 的无监督高精度跨模态对齐；
- 提供单碱基分辨率的**转录因子足迹（TF Footprinting）**，直接在活体单细胞中可视化转录因子结合诱发的空间位阻保护凹槽，是植物单细胞表观分析的首选工具。

---

## 核心算法数学原理与推导

ArchR 的核心算法建立在稀疏文本挖掘理论、奇异值分解与距离加权衰减模型之上：

### 1. 词频-逆文档频率变换（TF-IDF）与迭代 LSI

设二元可及性矩阵为 $\mathbf{A} \in \{0, 1\}^{M \times N}$（$M$ 为全基因组分箱或 Peak 特征数，$N$ 为细胞数）。若直接对 $\mathbf{A}$ 进行 PCA，第一主成分将被单个细胞的测序深度（Sequencing depth / 捕获片段总数）完全主导。

ArchR 借用自然语言处理中的 TF-IDF 算法：
- **词频（Term Frequency, TF）**：消除单细胞文库测序深度的影响：
  $$\text{TF}_{ij} = \frac{A_{ij}}{\sum_{k=1}^M A_{kj}}$$
- **逆文档频率（Inverse Document Frequency, IDF）**：对所有细胞均开放的普遍看家位点赋予低权重，对仅在少数特异细胞中开放的高信息量位点赋予高权重：
  $$\text{IDF}_i = \ln\left( 1 + \frac{N}{\sum_{j=1}^N A_{ij}} \right)$$
- **TF-IDF 矩阵**：$\mathbf{X}_{ij} = \text{TF}_{ij} \times \text{IDF}_i$。

**迭代 LSI 机制（Iterative LSI）**：
1. 初始轮：在全基因组 $500\text{ bp}$ 粗分箱上执行初次 TF-IDF 与 SVD 降维，获得初步粗聚类；
2. 特征筛选轮：识别簇间真正具有生物学特异性的变异特征（Variable features），过滤掉仅受技术噪声支配的无效特征；
3. 最终轮：在提纯后的高变特征子矩阵上二次执行 TF-IDF 与精确截断 SVD（Truncated SVD），将细胞无损投影至数十个正交 LSI 维度，彻底将细胞分型信号与测序深度偏差剥离。

### 2. 距离指数衰减基因活性评分模型（Gene Activity Score）

为了在缺乏转录组测序的情况下推断单个基因的表达活性，ArchR 扫描基因体（Gene body）及转录起始位点（TSS）周围的开放区段。对于基因 $g$，其单细胞活性评分为邻近开放信号的距离加权和：

$$\text{GeneScore}_{gj} = \sum_{k \in \mathcal{P}_g} w(d_{kg}) \cdot A_{kj}$$

- $\mathcal{P}_g$ 为落在基因 $g$ 转录起始位点上游 $100\text{ kb}$ 到下游 $100\text{ kb}$ 窗口内的所有可及性特征；
- 权重函数 $w(d)$ 采用连续指数衰减模型：
  $$w(d) = e^{-|d| / D_0}$$
  其中 $d$ 为开放位点距 TSS 的物理距离，$D_0$ 为特征衰减尺度（通常取 $5\text{ kb}$）。紧邻 TSS 的启动子开放信号权重最高，远端增强子信号权重平滑递减。该评分与 scRNA-seq 基因表达量具有极强的线性正相关性。

### 3. 单碱基转录因子足迹（TF Footprinting）

当某个关键转录因子（如植物 AP2/ERF、WRKY 或 bHLH 家族）物理结合在染色质的特异 DNA 基序（Motif）上时，蛋白质外壳在空间上遮挡了 DNA。Tn5 转座酶无法切入结合中心，只能在其裸露的两侧边界切断 DNA。

ArchR 在特定细胞亚群中，对全基因组该 TF 结合的所有基序位点进行物理中心对齐叠加：
- 计算每个单碱基物理相对距离处的 Tn5 插入事件频数；
- 结合无偏的 Tn5 裸 DNA 酶切偏好性矩阵进行局部背景除法校准；
- 真正的功能性结合在基序核心区域表现为极深且陡峭的**深度凹陷（Footprint Valley）**，而在结合中心两侧呈现特征性的切断双峰，直接证明该转录因子在植物活体细胞中处于功能性原位物理占有状态。

---

## 生产环境标准流水线

以下展示在 R 语言环境中利用 ArchR 针对植物 scATAC 片段文件构建 Arrow 磁盘流、执行降维聚类、推断基因活性并绘制 UMAP 的完整流水线：

```r
library(ArchR)

# 步骤 1：设置多线程并初始化植物自定义参考基因组环境 (以拟南芥或水稻为例)
addArchRThreads(threads = 8)
# 加载植物专用基因组注释 (需由 BSgenome 与 GRanges 预先构建)
# addArchRGenome("Arabidopsis") 

# 步骤 2：从 10x Genomics scATAC fragments.tsv.gz 构建分块 Arrow 磁盘文件
# 自动执行单细胞过滤：要求 TSS 富集分值 >= 3.0，唯一比对片段数 >= 1000
ArrowFiles <- createArrowFiles(
  inputFiles = c("sample1" = "rice_root_scatac_fragments.tsv.gz"),
  sampleNames = "Rice_Root",
  minTSS = 3.0,
  minFrags = 1000,
  addTileMat = TRUE,
  addGeneScoreMat = TRUE
)

# 步骤 3：构建 ArchRProject 主分析工程
proj <- ArchRProject(
  ArrowFiles = ArrowFiles,
  outputDirectory = "results/rice_root_archr",
  copyArrows = TRUE
)

# 步骤 4：执行两轮迭代潜在语义分析 (Iterative LSI) 降维
proj <- addIterativeLSI(
  ArchRProj = proj,
  useMatrix = "TileMatrix",
  name = "IterativeLSI",
  iterations = 2,
  clusterParams = list(resolution = 0.2),
  varFeatures = 25000,
  dimsToUse = 1:30
)

# 步骤 5：基于 LSI 维度执行 Seurat 社区图聚类并计算 UMAP 二维嵌入
proj <- addClusters(
  input = proj,
  reducedDims = "IterativeLSI",
  method = "Seurat",
  name = "Clusters",
  resolution = 0.8
)

proj <- addUMAP(
  ArchRProj = proj,
  reducedDims = "IterativeLSI",
  name = "UMAP",
  nNeighbors = 30,
  minDist = 0.5,
  metric = "cosine"
)

# 步骤 6：绘制细胞聚类 UMAP 图并可视化特定植物标记基因活性评分
p1 <- plotEmbedding(ArchRProj = proj, colorBy = "cellColData", name = "Clusters", embedding = "UMAP")
p2 <- plotEmbedding(ArchRProj = proj, colorBy = "GeneScoreMatrix", name = "LOC_Os01g01010", embedding = "UMAP")
plotPDF(p1, p2, name = "Rice_Root_scATAC_UMAP.pdf", ArchRProj = proj, width = 6, height = 6)
```

---

## 核心参数科学解析与植物调优指南

| 参数指令 | 推荐取值 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `minTSS` | `3.0` ~ `4.0` | **TSS 富集得分下限**；哺乳动物通常要求 6~8，但植物基因间距极短且启动子较窄，植物高质量单细胞取 3.0~4.0 即可。 |
| `minFrags` | `1000` ~ `2000` | **单细胞唯一捕获片段数下限**；过滤掉空滴油包和未裂解细胞碎屑；植物细胞较小，1000 是常用黄金分割线。 |
| `iterations` | `2` ~ `3` | **LSI 迭代轮数**；对于细胞类型高度分化的植物组织，2 轮迭代通常足以完全消除文库深度的批次干扰。 |
| `dimsToUse` | `1:30` (跳过 dim1) | **采纳的奇异值维度**；若第一维（LSI_1）与测序深度相关系数极高（$r > 0.95$），可使用 `2:30` 规避深度伪影。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 非模式植物自定义基因组注释构建
- **机制与限制**：ArchR 官方原生仅内置了人类（hg19/hg38）和小鼠（mm9/mm10）基因组，**天然不包含任何植物物种**！
- **自制环境准则**：
  - 植物科研必须先利用 Bioconductor 的 `BSgenomeForge` 制作植物参考基因组的 `BSgenome` R 包；
  - 然后使用 `createGenomeAnnotation` 与 `createGeneAnnotation`，将 GFF3/GTF 中的外显子、转录本与 TSS 坐标转化为严格的 `GRanges` 对象；
  - **避坑死穴**：`BSgenome` 中的染色体名称（如 `Chr01`）必须与 scATAC `fragments.tsv.gz` 文件第一列的染色体字符串完全一个字符不差地对齐，否则 Arrow 转换将报出全为 0 的静默空白！

---

## 植物应用案例与真实文献证据

1. **水稻和玉米根系单细胞染色质可及性与分生组织细胞命运轨迹**：
   在单细胞表观调控图谱研究中（Marand et al., *Cell*, 2021），研究团队利用 ArchR 对数万个植物根系单细胞的染色质状态进行了系统分析。借助 Iterative LSI 与基因活性模型，不仅成功在表观维度分辨出了表皮、皮层、内皮层与中柱鞘等稀有细胞类型，而且通过转录因子足迹（Footprinting）精准鉴定了调控根毛发育与细胞分化分枝的特异性 bHLH 顺式调控模块（[Marand et al., *Cell*, 2021](https://doi.org/10.1016/j.cell.2021.04.014)）。

---

## 实践排错与质控规范

- **错误 1：`createArrowFiles` 耗时数秒即结束，且报告 `0 cells passed filter`**
  - *排查原因*：自定义植物注释中的染色体命名（如 `chr1`）与 fragments 文件中的命名（如 `1` 或 `Chr01`）不一致，导致所有片段被判定为染色体不匹配。
  - *解决方案*：解压 fragments 头部查看第一列，确保与 `GeneAnnotation` 的 `seqlevels` 严格相同。
- **错误 2：UMAP 呈现细胞按测序深度从左向右排列的单向条带状分布**
  - *排查原因*：LSI 第一维（LSI_1）未做深度解耦，被测序片段数完全垄断。
  - *解决方案*：在 `addUMAP` 与 `addClusters` 中设置参数 `dimsToUse = 2:30`，显式跳过与深度高度相关的第一维度。
