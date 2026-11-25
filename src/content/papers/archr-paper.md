---
title: "ArchR is a scalable software package for integrative single-cell chromatin accessibility analysis"
summary: "基于 Arrow 磁盘文件系统的高性能单细胞染色质可及性（scATAC-seq）质控、LSI降维、调控元件与基因链接分析框架。"
authors: "Granja JM, Corces MR, Pierce SE, et al."
year: 2021
journal: Nature Genetics
doi: 10.1038/s41588-021-00790-6
type: method
methodIds: [archr]
domainIds: [single-cell-spatial-omics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# ArchR is a scalable software package for integrative single-cell chromatin accessibility analysis

## 1. 研究背景与算法贡献

单细胞染色质可及性测序（scATAC-seq）利用工程化超活性 Tn5 转座酶在单细胞水平上定点切割开放染色质区域，是系统解析基因调控顺式元件（CREs）、细胞异质性表观动力学及细胞命运决定的革命性技术。然而，与单细胞 RNA 测序相比，scATAC-seq 数据具有两大极端特性：
1. **极限高维与极端稀疏**：全基因组包含数以万计的潜在开放峰值，而在单个细胞中，受限于二倍体基因组仅有两条物理 DNA 拷贝，大多数位点的可及性是二值化且捕获率极低（通常仅能检测到全基因组 1%–5% 的真实开放位点）；
2. **内存爆炸瓶颈**：随着细胞规模从数千上升至数万乃至数十万，传统单细胞 R 工具包（如早期的 Cicero 或 Signac 部分版本）试图将数十万细胞 $\times$ 数十万 Peaks 矩阵常驻在系统 RAM 中，常引发灾难性的内存溢出与进程崩溃。

斯坦福大学的 Jeffrey M. Granja、M. Ryan Corces、Howard Y. Chang 与 William J. Greenleaf 等在 2021 年推出了 **ArchR**（Analysis of Regulatory Chromatin in R，发表于 *Nature Genetics*）。ArchR 重新定义了单细胞表观组学的计算架构：
- **革命性的 Arrow 文件磁盘架构**：基于 HDF5 底层流式存储，将数据处理与物理内存完全解耦；
- **全栈式端到端功能集成**：囊括基于 TSS 富集度的严苛质控、迭代潜在语义索引降维（Iterative LSI）、全谱系 Peak-to-Gene 顺式调控链接、转录因子足迹分析（TF Footprinting）以及与单细胞 RNA-seq 的无缝多组学跨模态整合，确立了单细胞表观基因组分析的行业金标准。

---

## 2. 核心数学模型与数据结构

### 2.1 基于 HDF5 的 Arrow 磁盘流式文件系统

ArchR 彻底摒弃了在内存中维护超大矩阵的做法，为每个物理测序文库生成一个独立的 `.arrow` 文件：
- **分层多维矩阵存储**：在磁盘上构建预分箱的 **TileMatrix**（全基因组 500 bp 固定窗口连续划分，无需依赖初始 Peak Calling）、**GeneScoreMatrix**（通过加权指数衰减模型将近端与基因主体开放性整合预测基因活性）以及后续生成的 **PeakMatrix**；
- **流式按需读取**：所有聚类、特征选择与检验均采用高效的 C++ HDF5 读写流，内存占用始终保持在常数级极低水平。

### 2.2 迭代潜在语义分析（Iterative LSI）降维算法

为应对 scATAC 数据的极端稀疏性与批次偏差，ArchR 设计了迭代式潜在语义分析：
1. **词频-逆文档频率（TF-IDF）转换**：
   $$TF_{ij} = \frac{x_{ij}}{\sum_k x_{ik}}, \quad IDF_j = \log \left( 1 + \frac{N}{\sum_i \mathbb{I}(x_{ij} > 0)} \right)$$
   将稀疏二值计数转换为连续的富集权重；
2. **初次奇异值分解（SVD）与预聚类**：在全基因组 500 bp 高变窗口上执行初步 SVD 并获得初级细胞簇；
3. **类内变异特征再加权与二次 SVD**：在每个初级细胞簇内部提取真正驱动亚型分化的可及性特征，重新进行特征筛选与最终 SVD，彻底消除了由于测序深度差异引起的第一主成分技术伪影。

### 2.3 顺式调控元件与基因链接（Peak-to-Gene Links）

为推断远端增强子与靶基因启动子之间的长程调控互作：
- 在预设物理基因组窗口内（通常为转录起始位点 TSS 上下游 250 kb）；
- 利用 $k$-NN 细胞聚束（$k$-NN low-overlapping pseudo-bulk cell aggregations，降低单细胞测序稀疏噪音），计算每个 ATAC Peak 的可及性与对应基因预测表达量（或跨组学对齐的真实 RNA 表达量）之间的皮尔逊相关系数 $r$；
- 通过多重置换检验计算经验 $p$ 值，精准锁定相关性强、具有生物学调控意义的高置信度顺式调控对。

---

## 4. 植物基因组学应用场景与科研价值

植物基因组中非编码调控区占有极高比例，且往往被转座子紧密包围，具有高度复杂的组织特异性：
- **植物根系与叶片分生细胞染色质开放图谱**：在拟南芥、水稻和玉米中，ArchR 能够以单细胞分辨率识别不同细胞层（如维管柱与表皮）特异性开放的增强子与启动子元件；
- **植物核心转录因子结合足迹（TF Footprinting）分析**：利用 Tn5 切割在蛋白质真实结合核心位点产生的“保护性凹陷（Footprint）”，无偏推断特定转录因子家族（如 NAC、MYB、WRKY、bZIP）在特定细胞类型中是否真实处于结合活性状态；
- **非编码顺式调控变异（eQTL/GWAS Hits）机制解析**：将农艺性状关联位点精准映射至 ArchR 鉴定的细胞类型特异性开放 Peaks 中，直接揭示非编码突变调控靶基因表达的表观机理。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Nature Genetics 2021 DOI: 10.1038/s41588-021-00790-6](https://doi.org/10.1038/s41588-021-00790-6)
- **PubMed 记录**：[PMID: 33603236](https://pubmed.ncbi.nlm.nih.gov/33603236/)
- **ArchR 官方项目门户与文档**：[ArchRProject Official Portal](https://www.archrproject.com/)
- **ArchR 源码仓库**：[GreenleafLab/ArchR GitHub](https://github.com/GreenleafLab/ArchR)
- **站内配套专题**：[单细胞多组学整合分析](../../topics/single-cell-spatial-omics/m08-topic-05/)
- **站内配套专题**：[ATAC-seq 与染色质开放性分析](../../topics/epigenomics-3d-genome/m07-topic-03/)
