---
title: "A Bayesian hierarchical model to detect differentially methylated loci from single nucleotide resolution sequencing data"
summary: "基于贝叶斯层次 Beta-Binomial 模型与跨位点平滑收缩算法的高精度差异甲基化位点与区域检测方法。"
authors: "Feng H, Conneely KN, Wu H"
year: 2014
journal: Nucleic Acids Research
doi: 10.1093/nar/gku154
type: method
methodIds: [dss]
domainIds: [epigenomics-3d-genome]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# A Bayesian hierarchical model to detect differentially methylated loci from single nucleotide resolution sequencing data

## 1. 研究背景与算法贡献

全基因组重亚硫酸氢盐测序（WGBS）能够在全基因组范围内以单碱基分辨率量化每个胞嘧啶（C）位点的甲基化水平。然而，在统计推断差异甲基化位点（Differentially Methylated Loci, DML）与差异甲基化区域（Differentially Methylated Regions, DMR）时，传统统计方法面临两大严重局限：
1. **抽样深度不均与生物学方差交织**：每个胞嘧啶位点的测序读段覆盖深度受随机抽样和文库偏好影响剧烈波动（从个位数到上百倍不等）。若简单采用 Fisher 精确检验，无法考量生物学重复（Biological Replicates）之间的样本间变异，容易在深覆盖位点产生严重的假阳性；
2. **小样本量离散度估计不准**：在植物逆境处理与发育生物学实验中，测序成本常限制样本重复数（通常仅为 2–4 次重复）。在极小样本量下直接按位点独立估计方差极其不准。

2014 年，Hao Feng、Karen N. Conneely 与 Hao Wu 在 *Nucleic Acids Research* 提出了 **DSS**（Differential methylation analysis based on Sequencing data）。DSS 创新性地构建了**贝叶斯层次 Beta-Binomial 统计模型**，通过在全基因组相邻胞嘧啶位点之间借用统计强度，对离散度参数实施平滑收缩估计（Smooth Dispersion Shrinkage），并在后续扩展版本中全面支持了多因素广义线性模型设计，成为动植物全基因组差异甲基化判别的基准黄金工具。

---

## 2. 核心数学模型与数据结构

### 2.1 层次 Beta-Binomial 概率模型

设在实验条件 $k$ 下的生物学重复 $j$ 中，第 $i$ 个胞嘧啶位点的总测序覆盖读段数为 $N_{ijk}$，其中支持甲基化的读段数为 $Y_{ijk}$。

第一层：条件二项分布（观测读段数）：
$$Y_{ijk} \mid p_{ijk} \sim \text{Binomial}(N_{ijk}, p_{ijk})$$

第二层：潜在真实甲基化率服从 Beta 分布（反映生物学重复间的随机波动）：
$$p_{ijk} \sim \text{Beta}(\alpha_{ijk}, \beta_{ijk})$$

通过均值参数 $\mu_{ik}$ 与离散度参数 $\phi_i$ 进行重参数化：
$$\mu_{ik} = \frac{\alpha_{ijk}}{\alpha_{ijk} + \beta_{ijk}}, \quad \phi_i = \frac{1}{\alpha_{ijk} + \beta_{ijk} + 1}$$

此时，边缘期望与方差分别为：
$$E[Y_{ijk}] = N_{ijk}\mu_{ik}$$
$$\text{Var}(Y_{ijk}) = N_{ijk}\mu_{ik}(1-\mu_{ik}) \left[ 1 + (N_{ijk}-1)\phi_i \right]$$

当离散度 $\phi_i = 0$ 时，退化为常规二项分布；当 $\phi_i > 0$ 时，模型能够精准刻画因生物学重复变异引起的额外过度离散（Over-dispersion）。

### 2.2 跨位点经验贝叶斯平滑收缩

DSS 的核心算法创新在于离散度估计：
1. **空间连续性假定**：相邻胞嘧啶位点共享相似的染色质微环境与局部变异水平。
2. **先验对数正态收缩**：假定 $\log \phi_i$ 遵循正态分布先验，结合局部滑动窗口（默认 500 bp）内的局部均值进行经验贝叶斯后验均值收缩。收缩后的离散度估计兼具全局稳健性与局部灵敏度。
3. **Wald 检验与 DMR 区域合并**：构建 Wald 检验统计量计算 $p$ 值，基于预设的显著性阈值（如 $p < 0.001$）筛选 DML；进而根据基因组物理距离（如相邻位点 $\le 100\text{ bp}$）和最小显著位点数（如 $\ge 3$ 个位点）将连续 DML 聚类合并为生物学意义明确的 DMR。

---

## 4. 植物基因组学应用场景与科研价值

植物基因组的表观调控机制与动物具有本质区别：
- **三种序列上下文分立**：植物具有高丰度的 CG、CHG 和 CHH 甲基化，每种上下文由截然不同的分子通路维持。DSS 支持针对这三种序列分别提取子集建立统计检验，避免不同通路信号互相稀释；
- **环境诱导表观等位基因（Epialleles）挖掘**：在作物耐旱、耐盐碱、抗病虫害处理中，DSS 能够从微弱的背景波动中灵敏捕捉到发生稳定差异甲基化的启动子与转座子元件；
- **多倍化亚基因组表观分化**：在小麦、棉花、油菜等异源多倍体中，利用 DSS 的多因素分析模型（`DMLfit.multiFactor`），可有效分离“亚基因组效应”、“发育时期效应”以及“环境处理交互效应”。

---

## 6. 阅读与复现资源

- **原始论文链接**：[Nucleic Acids Research 2014 DOI: 10.1093/nar/gku154](https://doi.org/10.1093/nar/gku154)
- **多因素扩展论文**：[Biostatistics 2016 DOI: 10.1093/biostatistics/kxv027](https://doi.org/10.1093/biostatistics/kxv027)
- **Bioconductor 官方软件包**：[Bioconductor - DSS](https://bioconductor.org/packages/release/bioc/html/DSS.html)
- **站内配套专题**：[DNA 甲基化与测序技术](../../topics/epigenomics-3d-genome/m07-topic-01/)
- **站内配套专题**：[表观遗传调控与植物抗逆](../../topics/epigenomics-3d-genome/m07-topic-07/)
