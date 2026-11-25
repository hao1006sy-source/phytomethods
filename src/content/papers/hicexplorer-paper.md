---
title: "Galaxy HiCExplorer 3: a web server for reproducible Hi-C, capture Hi-C and single-cell Hi-C data analysis, quality control and visualization"
summary: "用于高通量染色体构象捕获（Hi-C）接触矩阵构建、ICE归一化、A/B Compartment与TAD绝缘边界检测的模块化三维基因组分析套件。"
authors: "Wolff J, Rabbani L, Gilsbach R, Richard G, Manke T, Backofen R, Grüning BA"
year: 2020
journal: Nucleic Acids Research
doi: 10.1093/nar/gkaa220
type: method
methodIds: [hicexplorer]
domainIds: [epigenomics-3d-genome]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# Galaxy HiCExplorer 3: a web server for reproducible Hi-C, capture Hi-C and single-cell Hi-C data analysis, quality control and visualization

## 1. 研究背景与算法贡献

高通量染色体构象捕获（High-throughput Chromosome Conformation Capture, Hi-C）技术通过甲醛分子内交联、限制性内切酶消化、生物素标记末端修复、临近分子内连接与高通量测序，全面测定细胞核内任意两个基因组位点在三维空间中的相互接触频率。Hi-C 技术的普及使科研人员能够系统解析染色质层级组织架构（染色体领地、A/B 隔室 Compartments、拓扑关联结构域 TADs 以及染色质环 Chromatin Loops）。

然而，传统的 Hi-C 分析流程长期面临严重的技术挑战：
1. **工具链碎片化与格式割裂**：从原始 FASTQ、比对过滤、有效连接判定到矩阵归一化和下游统计学挖掘，往往需要拼接多个不同编程语言的独立脚本，数据难以复现；
2. **多重实验偏差交织**：酶切位点分布不均、GC 含量偏好、DNA 片段长度偏差及测序深度波动会剧烈扭曲真实空间物理接触概率；
3. **高维稀疏矩阵计算压力巨大**：全基因组高分辨率接触矩阵数据量动辄数十至上百 GB，缺乏统一的高效读写标准。

德国弗莱堡大学的 Fidel Ramírez、Joachim Wolff、Leily Rabbani 以及 Rolf Backofen、Björn A. Grüning 等在 2018 年与 2020 年相继推出了 **HiCExplorer**（最新为 HiCExplorer 3，发表于 *Nucleic Acids Research*）。HiCExplorer 提供了目前最为完整、模块化且经严格软件工程验证的端到端三维基因组学计算生态。该套件创新性地原生支持基于 `cooler` 的 `.cool` / `.mcool` 及高维 HDF5 稀疏矩阵格式，无缝集成了质控、Knight-Ruiz (KR) / ICE 平衡归一化、A/B Compartment 划分、多尺度 TAD 边界绝缘打分及多组学三维轨迹可视化，成为动植物三维基因组学分析的核心基础设施。

---

## 2. 核心数学模型与数据结构

### 2.1 接触矩阵平滑与 ICE 迭代矩阵平衡归一化

Hi-C 原始计数矩阵 $M_{ij}$ 受各位点局部特征影响显著。HiCExplorer 主要采用 **ICE（Iterative Correction and Eigenvector decomposition）** 矩阵平衡算法：
- 假设在全基因组范围内，所有可测序的基因组 bin 位点具有相等的可见性（Equal Visibility）；
- 将观测接触数分解为真实验证接触期望 $T_{ij}$ 与两个位点的可见性偏差因子 $B_i$ 和 $B_j$ 的乘积：
  $$M_{ij} = B_i \cdot T_{ij} \cdot B_j$$
- 算法通过反复交替迭代将矩阵行和与列和归一化为常数，直至收敛，从而完全消除限制性内切酶切位点密度、可比对性及 GC 含量等系统误差，输出无偏平衡矩阵 $M_{ij}^*$。

### 2.2 A/B Compartment 第一主成分（PC1）推断

为提取大尺度常染色质（活跃 A 隔室）与异染色质（抑制 B 隔室）空间分离：
1. **观察/期望（O/E）矩阵变换**：计算给定基因组线性距离 $d = |i - j|$ 下的接触衰减期望值 $E(d)$，构建变换矩阵 $A_{ij} = M_{ij}^* / E(|i - j|)$；
2. **皮尔逊相关性矩阵构建**：计算 $A$ 矩阵中每一对 bin 的全基因组空间接触模式相关系数，生成高度二值化的相关性矩阵 $C$；
3. **主成分分解（PCA）**：提取 $C$ 矩阵的第一特征向量（PC1）。结合基因密度或组蛋白修饰（如 H3K4me3/RNA-seq），正 PC1 赋值给基因丰富且转录活跃的 A compartment，负 PC1 赋值给基因贫乏且表观抑制的 B compartment。

### 2.3 基于绝缘分值（Insulation Score）的 TAD 与边界定位

HiCExplorer 采用滑动菱形窗口算法（Diamond Insulation Method）：
- 在平衡后的接触矩阵对角线上，以待检测位点 $k$ 为中心滑动大小为 $w$ 的菱形子矩阵；
- 统计该菱形内部的平均局部接触强度，即**绝缘分值（Insulation Score, $IS_k$）**；
- 在拓扑关联结构域（TAD）内部，局部染色质接触紧密，$IS_k$ 处于高位；而在两个 TAD 之间的绝缘物理边界处，跨边界接触急剧减少，$IS_k$ 呈现局部极小值（Local Minimum）。通过极值一阶导数过零点与二阶导数曲率阈值，算法可精确定位三维染色质边界坐标。

---

## 4. 植物基因组学应用场景与科研价值

植物三维基因组构象呈现出与哺乳动物显著不同的独特性质：
- **缺乏典型 CTCF 介导的环挤压结构**：哺乳动物依赖 CTCF 和黏连蛋白（Cohesin）形成明显的染色质环（Loops），而高等植物基因组中缺失动物同源 CTCF。植物的三维构象主要由转录活跃岛、表观修饰富集区以及局部微结构域（Micro-TADs）主导；
- **植物特异性 Rabl 构象与端粒/着丝粒聚集**：在许多大基因组植物（如小麦、大麦）中，着丝粒和端粒分别在细胞核相对的两极极化聚集（Rabl 构象）。HiCExplorer 的全染色体热图（`hicPlotMatrix`）能够极其清晰地展现这种大尺度极性特征；
- **多倍体植物亚基因组空间分离与互作**：在小麦（AABBDD）、异源四倍体油菜和棉花中，HiCExplorer 被广泛用于评估同源染色体之间是否存在跨亚基因组接触抑制，以及异染色质结（KNOT）和转座子三维聚簇机制。

---

## 6. 阅读与复现资源

- **HiCExplorer 3 论文链接**：[Nucleic Acids Research 2020 DOI: 10.1093/nar/gkaa220](https://doi.org/10.1093/nar/gkaa220)
- **HiCExplorer 1 基础论文**：[Nucleic Acids Research 2018 DOI: 10.1093/nar/gky504](https://doi.org/10.1093/nar/gky504)
- **官方使用文档与示例**：[HiCExplorer ReadTheDocs](https://hicexplorer.readthedocs.io/en/latest/)
- **源码仓库**：[deeptools/HiCExplorer GitHub](https://github.com/deeptools/HiCExplorer)
- **站内配套专题**：[Hi-C 技术与三维基因组学基础](../../topics/epigenomics-3d-genome/m07-topic-04/)
- **站内配套专题**：[TAD 拓扑关联结构域与染色质区室](../../topics/epigenomics-3d-genome/m07-topic-05/)
