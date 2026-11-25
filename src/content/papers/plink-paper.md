---
title: "PLINK: A Tool Set for Whole-Genome Association and Population-Based Linkage Analyses"
summary: "提出大规模高通量全基因组关联分析与群体遗传学数据管理、质控清洗及连锁不平衡分析工具集 PLINK。"
authors: "Purcell S, Neale B, Todd-Brown K, et al."
year: 2007
journal: American Journal of Human Genetics
doi: 10.1086/519795
type: method
methodIds: [plink]
domainIds: [population-genetics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# PLINK: A Tool Set for Whole-Genome Association and Population-Based Linkage Analyses

## 1. 研究背景与算法贡献

随着高密度单核苷酸多态性（SNP）微阵列芯片与全基因组高通量重测序技术的兴起，遗传学研究的数据量以几何级数爆炸。早期的遗传学分析软件往往功能碎片化、输入输出格式互不兼容，且在处理包含数千个样本、数百万个基因型标记的数据集时极易发生内存溢出，严重制约了全基因组关联分析（GWAS）与群体遗传学研究的高效推进。

2007 年，麻省总医院（MGH）与 Broad 研究所的 Shaun Purcell、Benjamin Neale、Katrina Todd-Brown 等在 *American Journal of Human Genetics* 上推出了里程碑式的 **PLINK**。PLINK 彻底重塑了全基因组规模遗传数据分析的技术标准：
1. **制定了行业通用的二进制压缩存储标准（PLINK Binary Format: `.bed`, `.bim`, `.fam`）**：采用紧凑的 2-bit 二进制编码技术，使海量基因型文件尺寸锐减至原本纯文本格式的几十分之一；
2. **全栈式端到端功能集成**：集成了从样本与标记严格质量控制（缺失率过滤、次要等位基因频率筛选、哈代-温伯格平衡检验）、群体杂合度诊断、近亲血缘识别（IBS/IBD 推断），到全基因组连锁不平衡（LD）分析、主成分分析（PCA）及标准关联检验；
3. **极佳的工程鲁棒性与计算性能**：纯 C/C++ 编写的底层架构使其成为全球生命科学领域使用频率最高的基础工具之一。

---

## 2. 核心数学模型与数据结构

### 2.1 2-bit 二进制基因型矩阵编码（`.bed` 架构）

PLINK 将每个双等位基因 SNP 的四种理论状态（纯合参考、杂合、纯合突变、缺失）压缩存储至计算机底层的 2 个二进制比特位（Bits）中：
- `00`：纯合第一等位基因（纯合野生型，Homozygous A1/A1）；
- `01`：杂合型（Heterozygous A1/A2）；
- `11`：纯合第二等位基因（纯合突变型，Homozygous A2/A2）；
- `10`：缺失基因型（Missing Genotype）。

每个字节（Byte = 8 bits）能够高效容纳 4 个连续个体的基因型。配套的 `.fam` 文件存储样本编号与表型，`.bim` 文件存储染色体位置与等位基因信息。

### 2.2 状态同源（IBS）与血缘同源（IBD）亲缘推断

为了检测群体中的样品重复、近亲交配与家系关系，PLINK 通过全基因组独立中性标记计算任意两个个体之间的等位基因共享状态（Identity By State, IBS）：
- 若两节点在某标记处共享 2 个等位基因，IBS = 2；共享 1 个，IBS = 1；无共享，IBS = 0；
- 基于全基因组标记的平均 IBS 矩阵，利用矩法（Method of Moments）进一步推导个体间真实的血缘同源概率（Identity By Descent, IBD: $Z_0, Z_1, Z_2$）；
- **亲缘系数度量（PI_HAT / $\hat{\pi}$）**：
  $$\hat{\pi} = P(\text{IBD} = 2) + \frac{1}{2} P(\text{IBD} = 1) = Z_2 + \frac{1}{2} Z_1$$
  若 $\hat{\pi} \approx 1.0$，提示为同卵双胞胎或完全同一种质的重复样品；$\hat{\pi} \approx 0.5$ 对应全同胞或亲子对；$\hat{\pi} \approx 0.25$ 对应半同胞。

### 2.3 连锁不平衡度量（Linkage Disequilibrium, LD）

PLINK 提供了全基因组单倍型连锁不平衡的黄金统计量计算：
- **相关系数平方 $r^2$**：
  $$r^2 = \frac{(p_{AB} - p_A p_B)^2}{p_A (1 - p_A) p_B (1 - p_B)}$$
- **滑动窗口 LD 修剪算法（LD Pruning）**：通过 `--indep-pairwise` 参数在预设的滑动窗口内（如 50 个 SNP，步长 10），递归剔除 $r^2 > 0.1$ 的高共线性标记，输出用于 PCA 与 ADMIXTURE 分析的纯净独立中性标记子集。

---

## 4. 植物基因组学应用场景与科研价值

植物种质资源库中杂质、近交系重复以及测序错误不可避免，PLINK 是全套植物基因组学生信流程的第一道门户：
- **作物品种全基因组重测序质量控制**：通过 `--geno 0.05 --mind 0.05 --maf 0.05` 彻底清除因低深度测序产生的劣质标记与污染样本；
- **植物种质资源重复与近亲消除**：利用 `--genome` 模块快速识别种质库中由于命名混乱导致的同一品种异名重复（Duplicate Accessions），避免在后续 GWAS 中产生虚假的超高显著性；
- **全基因组连锁不平衡衰减距离（LD Decay）评估**：计算不同物理距离下的平均 $r^2$，绘制植物群体的 LD 衰减曲线（如自交作物水稻 LD 衰减常在 100–200 kb，而异交玉米常在几千个碱基内衰减），为确定 GWAS 候选因果区段提供关键物理基准。

---

## 6. 阅读与复现资源

- **原始研究论文**：[American Journal of Human Genetics 2007 DOI: 10.1086/519795](https://doi.org/10.1086/519795)
- **PubMed 记录**：[PMID: 17701901](https://pubmed.ncbi.nlm.nih.gov/17701901/)
- **PLINK 1.9 官方完整文档**：[PLINK 1.9 Documentation](https://www.cog-genomics.org/plink/1.9/)
- **PLINK 2.0 前沿开发版**：[PLINK 2.0 Web Portal](https://www.cog-genomics.org/plink/2.0/)
- **站内配套专题**：[群体遗传变异与分化统计指标](../../topics/population-genetics/m05-topic-01/)
- **站内实操教程**：[PLINK 群体遗传质控与连锁分析实战教程](../../tutorials/plink-synthetic/)
