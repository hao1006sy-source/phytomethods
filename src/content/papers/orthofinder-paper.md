---
title: "OrthoFinder: phylogenetic orthology inference for comparative genomics"
summary: "提出基于基因树与物种树调和 (Gene Tree - Species Tree Reconciliation) 的系统发育直系同源推断算法体系 OrthoFinder，通过校正基因长度偏倚与演化速率异质性，以超高准确度解析基因家族直系同源群 (Orthogroups)、旁系同源基因 (Paralogs) 及全基因组重复事件 (WGD)。"
authors: "Emms DM, Kelly S"
year: 2019
journal: Genome Biology
doi: 10.1186/s13059-019-1832-y
type: method
methodIds: [orthofinder]
domainIds: [comparative-genomics, pangenomics-structural-variation]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

在比较基因组学、系统发育演化及泛基因组分析中，精确界定不同物种之间的**直系同源基因（Orthologs，源于物种分化事件）**与**旁系同源基因（Paralogs，源于基因复制事件）**是几乎所有下游生物学推断的前提。然而，第一代直系同源推断工具（如 OrthoMCL、InParanoid）普遍基于朴素的**双向最佳比对（Reciprocal Best Hits, RBH）**或图聚类算法，存在两大严重理论缺陷：
1. **基因长度偏倚（Gene Length Bias）**：由于 BLAST/DIAMOND 的比对分值（Bit-score）与比对序列长度呈正相关，长基因更容易获得显著的 E-value，导致经典图聚类算法将短基因系统性地排除出其所属的同源群；
2. **缺乏系统发育物种树调和（Reconciliation）**：仅凭两两距离聚类无法区分真核生物演化中极其频繁的谱系特异性重复（Lineage-specific duplications）与古老的整基因组加倍（WGD），极易将旁系同源拷贝错误归为一对一直系同源（1:1 Orthologs）。

由牛津大学 David Emms 与 Steven Kelly 开发的 **OrthoFinder**（2019 年发表于 *Genome Biology* 的代表作），确立了现代系统发育同源推断的国际黄金标杆。其核心突破在于将传统基于启发式图的聚类推进为**端到端基于严格系统发育树调和的直系同源推断（Phylogenetic Orthology Inference）**：
- **校正长度与演化速率的标准化评分**：首创校正序列长度的归一化比对分值，消除长基因偏倚；
- **自举式无根物种树构建（Unrooted Species Tree）**：利用大量单拷贝基因树的拓扑特征自动推断包含全部物种的高置信度物种树；
- **全自动基因树与物种树调和**：为每一个同源群（Orthogroup）构建多序列比对与最大似然基因树，通过与物种树调和将树上每一个内部节点明确标注为“物种分化事件（Speciation）”或“基因复制事件（Duplication）”，实现单基因精度与全基因组级别的同源解析。

---

## 核心数学模型与数据结构

OrthoFinder 采用深度分层的计算图流程，核心数据流与数学算法如下：

```
                多物种全套蛋白质组序列 FASTA
                             │
                             ▼
        [全对全蛋白质快速相似度搜索 (DIAMOND / BLASTP)]
                             │
                             ▼
         [校正基因长度偏倚的归一化图构建 (Normalized Graph)]
• 线性回归校正比对分值 $S_{ij}$ 与长度 $L_i, L_j$ 的关联
                             │
                             ▼
          [马尔可夫聚类 (MCL) 划分初始同源群 (Orthogroups)]
                             │
                             ▼
         [单拷贝基因家族提取与无根物种树推断 (STAG / STRIDE)]
                             │
                             ▼
       [每个 Orthogroup: MAFFT 多重对齐 + FastTree / IQ-TREE]
                             │
                             ▼
       [基因树与物种树调和算法 (Tree Reconciliation)]
• 标注树节点: 蓝圈为 Speciation (分化), 红方块为 Duplication (复制)
• 自动推断跨物种 1:1, 1:多, 多:多 直系同源关系
                             │
                             ▼
  输出全套同源矩阵、N0 进化节点基因集与全基因组复制事件报表
```

1. **校正长度偏倚的标准化比对分值（Normalized Bit-scores）**：
   设两蛋白质序列 $i$ 和 $j$ 的长度分别为 $L_i$ 与 $L_j$。通过局部多项式拟合或线性回归建模序列长度乘积与最大理论比对得分的关系，将原始比对得分 $S_{ij}$ 转化为与长度解耦的标准化分值：
   $$S'_{ij} = \frac{S_{ij}}{\sqrt{L_i \cdot L_j}}$$
   基于 $S'_{ij}$ 构建以蛋白质为节点、以标准化相似度为边权的无向加权图，彻底解决了短蛋白质与多结构域嵌合蛋白的聚类断裂问题；
2. **STRIDE 系统发育树定根与物种树推断**：
   对于所有具有广泛物种覆盖的单拷贝正交群，提取其对应的基因树。算法通过最大割（Max-Cut）准则与一致性拓扑聚类（STAG 算法）构建全局物种树，进而利用基因复制事件的不可逆性（STRIDE 算法）自动为物种树寻找最优根节点；
3. **基因树调和（Gene Tree - Species Tree Reconciliation）数学判定**：
   设基因树节点为 $g$，其包含的所有子代基因所属物种集合为 $\sigma(g)$。设物种树中对应物种集合的最年轻共同祖先节点为 $\text{LCA}(\sigma(g))$。
   - 若对于 $g$ 的两个子节点 $g_1, g_2$，其物种集合满足互斥不重叠：
     $$\sigma(g_1) \cap \sigma(g_2) = \emptyset$$
     则该节点 $g$ 被严格判定为**物种分化事件（Speciation Event）**，其分化的子代互为直系同源；
   - 若两子节点物种集合存在交集：
     $$\sigma(g_1) \cap \sigma(g_2) \ne \emptyset$$
     则该节点被确凿判定为**基因复制事件（Duplication Event）**，子代之间属于旁系同源。

---

## 植物基因组学应用场景与科研价值

1. **植物古多倍化与全基因组复制（WGD）定位**：
   植物界普遍经历过多次古老的 WGD 事件（如被子植物祖先 $\zeta/\epsilon$ 事件、核心真双子叶 $\gamma$ 六倍化事件）。OrthoFinder 通过调和树识别基因组各节点累积的基因复制爆发峰，能精准定位多倍化事件发生在系统发育树的具体分支；
2. **植物核心与泛基因组基因家族（Core & Dispensable Orthogroups）分析**：
   在作物多品种群体泛基因组中，OrthoFinder 是将数万个材料的预测基因聚类为 Core（核心）、Softcore、Dispensable（可变）及 Private（特有）基因家族的标准计算框架；
3. **直系同源单拷贝系统发育基因组学（Phylogenomics）超级矩阵构建**：
   自动筛选全基因组所有严格 1:1 单拷贝直系同源基因，一键输出串联多序列比对（Concatenated Supermatrix），供 IQ-TREE 2 开展高精度物种分化时间估算。

---

## 阅读与复现资源

- **论文全文**：[Genome Biology, 20(1), 238 (2019)](https://doi.org/10.1186/s13059-019-1832-y)
- **PubMed 记录**：[PMID: 31727128](https://pubmed.ncbi.nlm.nih.gov/31727128/)
- **官方开源代码仓库**：[GitHub - davidemms/OrthoFinder](https://github.com/davidemms/OrthoFinder)
- **相关算法工具详情**：[OrthoFinder 算法原理与指南](../../methods/orthofinder/) ｜ [OrthoFinder 实战教程](../../tutorials/orthofinder-intro/)
