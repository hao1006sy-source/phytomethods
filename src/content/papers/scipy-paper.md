---
title: "SciPy 1.0: fundamental algorithms for scientific computing in Python"
summary: "系统介绍 Python 开源科学计算基石库 SciPy 1.0 的基础数值算法架构、稀疏矩阵代数与生物信息学生态应用。"
authors: "Virtanen P, Gommers R, Oliphant TE, et al."
year: 2020
journal: Nature Methods
doi: 10.1038/s41592-019-0686-2
type: method
methodIds: [scipy]
domainIds: [gwas-breeding]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# SciPy 1.0: fundamental algorithms for scientific computing in Python

## 1. 研究背景与算法贡献

在当代生物信息学、计算生物学、统计遗传学以及人工智能（AI）领域，Python 已成为全球科研人员与开发者的首选主导编程语言。从处理单细胞转录组的 Scanpy，到分析空间组学的 Squidpy，再到大规模基因组深度学习模型（如 PlantCAD），整个数据科学与计算生态的稳定繁荣无不建立在高性能底层基础科学计算软件之上。

2020 年，经过全球开源开发者社区长达近二十年的严谨维护与工程迭代，Pauli Virtanen、Ralf Gommers、Travis E. Oliphant 以及 SciPy 1.0 核心团队在 *Nature Methods* 上发表了里程碑式的 **SciPy 1.0: fundamental algorithms for scientific computing in Python**。该论文系统总结了 SciPy 作为科学计算基础设施的核心技术架构与标准算法库。其核心贡献在于：
1. **构建了经过极其严格单元测试与数值验证的基础数学算法集**：涵盖最优化、线性代数、积分、统计检验、特殊函数、信号处理与空间算法；
2. **提供了标准化的稀疏矩阵代数架构（`scipy.sparse`）**：为处理超高维、极端稀疏的高通量生命科学数据（单细胞矩阵、染色质三维构象、全基因组图谱）奠定了事实标准；
3. **推动了现代开源科学软件工程范式**：建立了兼具 Python 动态易用性与 C/C++/Fortran 底层硬件级极致性能的混合编译生态。

---

## 2. 核心数学模型与数据结构

### 2.1 高维稀疏矩阵体系（`scipy.sparse`）

高通量生物组学数据（如 10x 单细胞测序的细胞 $\times$ 基因矩阵，90% 以上为零计数）无法在物理内存中以稠密数组存储。SciPy 提供了 7 种标准的稀疏矩阵格式：
- **CSR（Compressed Sparse Row）**：压缩稀疏行格式，由 `data`（非零元素值）、`indices`（列索引）和 `indptr`（行指针）三个一维数组构成。针对矩阵行切片、行求和以及稀疏矩阵-向量乘法（SpMV: $y = A x$）具有极佳的缓存命中率与算力优化；
- **CSC（Compressed Sparse Column）**：压缩稀疏列格式，针对列提取与快速列向代数运算优化；
- **COO（Coordinate Format）**：基于 $(i, j, v)$ 三元组列表快速构建稀疏矩阵，随后可高效转换为 CSR/CSC。

### 2.2 空间几何与近邻拓扑检索（`scipy.spatial`）

在空间转录组学与空间蛋白质组学中，确定细胞在二维组织切片或三维空间中的物理拓扑至关重要：
- **$k$-d 树算法（$k$-d Tree / `cKDTree`）**：采用 C++ 高性能实现的二叉空间划分树，将高维欧氏空间点集的最近邻搜索（Nearest Neighbor Search）复杂度从暴力的 $O(N^2)$ 降低至平均 $O(N \log N)$；
- **Delaunay 三角剖分与凸包计算**：基于 Qhull 算法库，自适应构建无向空间连通图，构成了空间生物学邻域富集检验的几何骨架。

### 2.3 严格的概率统计与优化求解器（`scipy.stats` & `scipy.optimize`）

- **连续与离散概率分布**：内置超过 100 种标准连续分布（正态、Beta、Gamma、卡方、Student-t、F 分布）与离散分布（二项、负二项、泊松、超几何分布），提供高精度的概率密度（PDF/PMF）、累积分布（CDF）与分位数函数（PPF）；
- **假设检验与多重校正**：实现双样本 Student-t 检验、Wilcoxon 秩和检验、Mann-Whitney U 检验、双样本 Kolmogorov-Smirnov 检验以及 Fisher 精确检验；
- **非线性优化与方程求解**：提供 BFGS、L-BFGS-B（带边界约束拟牛顿法）、Nelder-Mead 单纯形法以及 Levenberg-Marquardt 非线性最小二乘拟合，广泛用于数量遗传学方差组分的最大似然估计与曲线拟合。

---

## 4. 植物基因组学应用场景与科研价值

SciPy 是构建现代植物生物信息学与分子育种软件工具链的最底层发动机：
- **单细胞转录组（Scanpy）底层基底**：AnnData 对象的底层稀疏矩阵读写、标准差标准化、PCA 截断奇异值分解与邻居图计算全部由 `scipy.sparse` 与 `scipy.spatial` 驱动；
- **空间转录组学（Squidpy）空间统计学实现**：Moran's $I$ 空间自相关计算中空间权重矩阵的稀疏乘积、组织切片中 Delaunay 空间三角剖分均直接依托 SciPy 空间模块；
- **全基因组关联分析（GWAS）与分子育种统计推断**：在自主编写数量遗传学脚本时，利用 `scipy.optimize.minimize` 快速求解限制性极大似然（REML）方差比率，利用 `scipy.stats` 批量计算每个候选 SNP 的卡方统计量与渐近 $p$ 值。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Nature Methods 2020 DOI: 10.1038/s41592-019-0686-2](https://doi.org/10.1038/s41592-019-0686-2)
- **PubMed 记录**：[PMID: 32015543](https://pubmed.ncbi.nlm.nih.gov/32015543/)
- **SciPy 官方文档与用户指南**：[SciPy Documentation](https://docs.scipy.org/doc/scipy/)
- **SciPy 源码仓库**：[scipy/scipy GitHub](https://github.com/scipy/scipy)
- **站内配套专题**：[全基因组关联分析（GWAS）原理与质控](../../topics/gwas-breeding/m06-topic-01/)
- **站内配套专题**：[机器学习与深度学习在分子育种中的应用](../../topics/gwas-breeding/m06-topic-07/)
