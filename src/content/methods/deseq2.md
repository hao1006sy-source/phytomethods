---
title: DESeq2
name: DESeq2
summary: 基于负二项广义线性模型 (NB GLM)、比率中位数尺度因子与经验贝叶斯离散度收缩的高通量测序差异表达分析 R 软件包。
dataType: 原始无偏测序读段整数计数矩阵与多因子实验设计元数据
principle: 负二项广义线性模型、几何平均比率中位数尺度因子、经验贝叶斯离散度收缩与 Wald/似然比假设检验
domainIds: [regulatory-genomics-ai]
topicIds: [m09-topic-01]
principleIds: [negative-binomial]
dataIds: [expression-matrix]
paper: deseq2-2014
repository: https://github.com/thelovelab/DESeq2
version: "1.42.0"
status: published
updatedAt: 2026-11-25
---

## 软件定位与核心科学问题

在植物转录组学（RNA-seq）研究中，定量测定不同发育阶段、环境胁迫（干旱、高盐、病原菌侵染）或基因型变异（突变体 vs 野生型）下的基因表达变化是揭示性状分子调控机制的核心手段。

然而，高通量 RNA 测序计数数据具有鲜明而复杂的统计学特性：
1. **离散非负整数与技术采样偏倚**：每个基因的测序读段数（Read Counts）是由有限测序通量随机抽样生成的离散计数，各文库测序深度（Sequencing Depth）和文库组成差异极大；
2. **生物学过度离散（Overdispersion）**：对于真实的植物生物学重复，其样本间方差远远大于其均值（$\text{Var} > \mu$），彻底违背了简单泊松分布（Poisson Distribution，$\text{Var} = \mu$）的理论假设；
3. **小样本量条件下的方差估计困难**：植物科研试验受限于培养周期、取材难度和测序成本，每个处理组通常仅有 3~5 个生物学重复。在样本量极小的情况下，直接依靠每个基因自身的样本方差进行统计检验会导致极大的抽样误差，产生大量假阳性或假阴性。

DESeq2 是 Bioconductor 生态中差异表达分析的核心权威工具。它通过引入负二项广义线性模型（NB GLM）、基于几何平均的样本尺度因子（Size Factor）以及**经验贝叶斯离散度信息共享与收缩（Empirical Bayes Dispersion Shrinkage）**机制，完美解决了上述统计瓶颈，成为植物功能基因组学研究的黄金标准。

---

## 核心算法原理与数学推导

```
  [原始无偏整数计数矩阵 (Counts Matrix)]  +  [实验设计元数据 (ColData)]
                     │                                   │
                     ▼                                   ▼
          文库大小因子估计 (Size Factor)         建立广义线性模型 (NB GLM)
          └─ 跨样本几何平均与比率中位数 (RLE)     └─ log2(均值) = 协变量设计矩阵 × 效应向量
                     │                                   │
                     ├───────────────────────────────────┘
                     ▼
          基因离散度极大似然估计 (Gene-wise MLE Dispersion)
                     │
                     ▼
          均值-离散度关系曲线平滑拟合 (Mean-Dispersion Trend Line)
                     │
                     ▼
          经验贝叶斯 MAP 收缩 (Empirical Bayes Shrinkage to Trend)
                     │
                     ▼
          假设检验与倍数变化收缩 (Hypothesis Testing & LFC Shrinkage)
          ├─ Wald 检验 (双组/成对比较) 或 似然比检验 LRT (多时间序列/复杂因子)
          ├─ 独立过滤 (Independent Filtering 剔除低表达噪音)
          └─ apeglm / ashr 收缩极大后验效应量
```

### 1. 负二项分布假设 (Negative Binomial Distribution)

设基因 $i$ 在样本 $j$ 中的测序计数观测值为 $K_{ij}$，DESeq2 建模其遵循负二项分布：
$$K_{ij} \sim \text{NB}(\text{mean} = \mu_{ij}, \text{dispersion} = \alpha_i)$$
其概率质量函数为：
$$P(K_{ij} = k) = \frac{\Gamma(k + \alpha_i^{-1})}{\Gamma(k + 1)\Gamma(\alpha_i^{-1})} \left(\frac{\alpha_i^{-1}}{\mu_{ij} + \alpha_i^{-1}}\right)^{\alpha_i^{-1}} \left(\frac{\mu_{ij}}{\mu_{ij} + \alpha_i^{-1}}\right)^k$$
其期望值与方差定义为：
$$\mathbb{E}(K_{ij}) = \mu_{ij}, \quad \text{Var}(K_{ij}) = \mu_{ij} + \alpha_i \mu_{ij}^2$$
- 第一项 $\mu_{ij}$ 代表测序抽样的泊松随机散粒噪声（Shot noise）；
- 第二项 $\alpha_i \mu_{ij}^2$ 刻画了植物个体或田间微环境引起的生物学变异（Biological variation）；
- $\alpha_i$ 为基因 $i$ 的离散度参数（Dispersion parameter）。当 $\alpha_i \to 0$ 时，模型自然退化为泊松分布；$\alpha_i$ 越大，代表生物学重复间的异质性越显著。

### 2. 几何平均比率中位数尺度因子 (Size Factor / Relative Log Expression)

为了剔除不同样本测序深度不同以及个别极端高表达基因（如光合作用 *rbcL* 或储藏蛋白）“吃光测序读段”导致的相对丰度假象，DESeq2 采用中位数比率法（Median-of-Ratios）计算样本尺度因子 $s_j$：
1. 计算每个基因在所有 $m$ 个样本中的几何平均基准表达量：
   $$g_i = \left(\prod_{k=1}^m K_{ik}\right)^{1/m}$$
2. 计算每个样本中所有基因计数与其几何平均基准的比值，并取全基因组中位数：
   $$s_j = \text{median}_{i: g_i > 0} \frac{K_{ij}}{g_i}$$
3. 中位数统计量对极端高表达离群基因具有天然的抵抗力（Breakdown point 为 50%），确保未发生差异表达的大多数家政基因的比值稳定分布在 1 附近。

### 3. 负二项广义线性模型 (NB GLM)

样本 $j$ 中基因 $i$ 的期望表达均值 $\mu_{ij}$ 与实验处理条件通过对数连接函数建立线性关联：
$$\log_2(\mu_{ij}) = \mathbf{x}_j \boldsymbol{\beta}_i + \log_2(s_{ij})$$
其中：
- $\mathbf{x}_j$ 为样本 $j$ 对应的实验设计协变量行向量（如截距、基因型、逆境处理、批次因子等）；
- $\boldsymbol{\beta}_i = (\beta_{i0}, \beta_{i1}, \dots)^T$ 为回归系数向量。特别地，若 $\mathbf{x}_j$ 对应二元处理标签（处理 vs 对照），则 $\beta_{i1}$ 直接对应处理组相对于对照组的无偏**对数倍数变化（$\log_2\text{Fold Change}$, $\log_2\text{FC}$）**；
- $\log_2(s_{ij})$ 作为模型偏置量（Offset），直接吸纳文库大小差异。

### 4. 经验贝叶斯离散度收缩 (Empirical Bayes Dispersion Shrinkage)

由于植物样本重复数通常较少（如 $n=3$），单个基因独立估计出的离散度 $\alpha_i$ 具有极大的抽样方差。DESeq2 采用三步经验贝叶斯信息借用策略：
1. **基因级极大似然估计**：对每个基因独立拟合模型，计算无约束离散度初值 $\hat{\alpha}_i^{\text{MLE}}$；
2. **均值-离散度趋势线拟合**：以全基因组基因的平均表达水平 $\bar{\mu}_i$ 为自变量，对 $\hat{\alpha}_i^{\text{MLE}}$ 拟合平滑非线性趋势曲线 $\alpha_{\text{trend}}(\bar{\mu}_i)$，反映“高表达基因离散度普遍偏低、低表达基因离散度普遍偏高”的物理规律；
3. **经验贝叶斯后验收缩 (MAP)**：构建经验贝叶斯后验概率密度，以趋势线作为经验先验分布，将每个基因的离散度估计值向趋势线收缩：
   $$\hat{\alpha}_i^{\text{MAP}} = \arg\max_{\alpha} \left[ \log \mathcal{L}(\mathbf{K}_i \mid \mu_i, \alpha) + \log p_{\text{prior}}(\alpha \mid \alpha_{\text{trend}}(\bar{\mu}_i)) \right]$$
   - 对于表达变异符合整体趋势的普通基因，收缩大幅压制了噪声，提供了极为稳健的方差基线；
   - 包含 Cook 距离离群值检测机制：若某个基因的实际方差极其异常（如受到某种强选择调控），模型将不进行向内收缩，保留其真实的超大离散度，避免假阳性。

### 5. 统计推断与效应值收缩 (Hypothesis Testing & LFC Shrinkage)

- **Wald 检验**：针对特定系数零假设 $H_0: \beta_{ir} = 0$，检验统计量 $W_i = \frac{\hat{\beta}_{ir}}{\text{SE}(\hat{\beta}_{ir})} \sim \mathcal{N}(0, 1)$，换算双尾 $p$ 值并利用 Benjamini-Hochberg (BH) 计算矫正后的 FDR（$q$-value）；
- **似然比检验 (LRT)**：对比包含所有因子的全模型与移除特定因子的简化模型似然差：$2(\log \mathcal{L}_{\text{full}} - \log \mathcal{L}_{\text{reduced}}) \sim \chi^2(\Delta \text{df})$，极适用于植物多时间序列胁迫响应或多因子交互作用；
- **效应值收缩（apeglm / ashr）**：低表达基因微小的读段计数波动（如从 1 变到 8）会产生虚高的人工 $\log_2\text{FC}$。DESeq2 采用适应性收缩算法（如 `apeglm`），将信息量不足的基因 $\log_2\text{FC}$ 压缩至接近 0，产生可靠的效应量排序。

---

## 植物转录组分析特殊考量与避坑指南

| 植物实验特殊性 | 潜在统计陷阱 | DESeq2 规范应对策略 |
| :--- | :--- | :--- |
| **严禁输入连续型标准化值** | 将 TPM、FPKM、RPKM 或经过 log 变换的值作为矩阵输入 DESeq2。 | **绝对禁止**：DESeq2 核心方差方程 $\text{Var} = \mu + \alpha\mu^2$ 严格依托泊松计数整数分布。连续值会彻底摧毁离散度收缩与 GLM 极大似然估计。必须输入原始整数 counts；若由 Salmon/kallisto 产出，必须使用 `tximport` 进行汇总。 |
| **多倍体基因组多重比对** | 小麦（六倍体 AABBDD）、油菜（异源四倍体 AACC）同源基因序列同源性极高，造成大量 reads 存在多处对齐。 | 在比对定量阶段使用 Salmon / kallisto 进行概率分配，再使用 `tximport(..., countsFromAbundance="no")` 导入基因水平无偏整数计数，避免直接丢弃多重比对导致的严重表达量低估。 |
| **极端高丰度光合与贮藏基因** | 绿色叶片中光合基因（*rbcL*、*rbcS*）或籽粒中醇溶蛋白在总测序 reads 中占比可高达 30%~50%。 | 严禁使用总读段数（Total Counts）或每百万读段（CPM）简单归一化（会导致未变化的其他基因在丰度上呈现虚假下调）。DESeq2 的比率中位数法能有效抵御高达 50% 比例的极端吸血基因。 |
| **植物温室空间与批次效应** | 培养箱不同托盘、温室不同光照方位或不同取材批次引入的批次效应常大于基因型处理差异。 | 在 `colData` 中严格记录取材批次（Batch）或生长架位置，在设计公式中使用多因子设计公式 `design = ~ batch + condition`，在 GLM 中回归消除批次协变量。 |

---

## 典型分析命令与标准分析流

以下为在 R 4.3+ 环境中基于 `tximport` 与 `DESeq2` 的标准分析脚本：

```r
library(DESeq2)
library(tximport)
library(readr)

# 1. 整理样本元数据表 (colData)
# 样本名与定量输出路径对齐
samples <- data.frame(
  sample_id = c("WT_Mock_1", "WT_Mock_2", "WT_Mock_3", 
                "WT_Drought_1", "WT_Drought_2", "WT_Drought_3"),
  batch = factor(c("B1", "B2", "B1", "B2", "B1", "B2")),
  treatment = factor(c("Mock", "Mock", "Mock", "Drought", "Drought", "Drought"),
                     levels = c("Mock", "Drought")) # 严格指定对照组为首个水平
)
rownames(samples) <- samples$sample_id

# 2. 从转录本水平定量软件 (如 Salmon/kallisto) 导入并生成基因计数
# tx2gene 为两列数据框: 转录本 ID -> 基因 ID
files <- file.path("./salmon_quant", samples$sample_id, "quant.sf")
names(files) <- samples$sample_id
txi <- tximport(files, type = "salmon", tx2gene = tx2gene)

# 3. 构建 DESeqDataSet 对象 (包含批次校正与主处理效应)
dds <- DESeqDataSetFromTximport(
  txi,
  colData = samples,
  design = ~ batch + treatment
)

# 4. 基础质控与低表达基因预过滤 (至少在 3 个样本中读段数 >= 10)
keep <- rowSums(counts(dds) >= 10) >= 3
dds <- dds[keep, ]

# 5. 执行全自动差表达分析流程 (估计大小因子 -> 估计离散度 -> 拟合 GLM -> Wald 检验)
dds <- DESeq(dds)

# 6. 提取处理效应对比结果 (Drought vs Mock)
res <- results(
  dds,
  contrast = c("treatment", "Drought", "Mock"),
  alpha = 0.05   # 预设 FDR 显著性水平
)

# 7. 应用 apeglm 算法收缩 log2FC (消除低表达基因虚假高倍数波动)
res_shrunk <- lfcShrink(
  dds,
  coef = "treatment_Drought_vs_Mock",
  type = "apeglm"
)

# 8. 筛选显著上调与下调差异基因
sig_up <- subset(res_shrunk, padj < 0.05 & log2FoldChange > 1.0)
sig_down <- subset(res_shrunk, padj < 0.05 & log2FoldChange < -1.0)

cat(sprintf("显著上调基因数: %d; 显著下调基因数: %d\n", nrow(sig_up), nrow(sig_down)))

# 导出结果至 CSV 文件供下游 GO/KEGG 富集分析
write.csv(as.data.frame(res_shrunk), file = "corn_drought_diff_genes.csv")
```

---

## 科学研究案例与上下游分析协同

- **玉米灌浆期抗旱转录调控案例**：Jin 等在比较两个不同耐旱性玉米自交系在灌浆期干旱胁迫与正常水分处理下的叶片转录组时，采用 DESeq2 构建了包含基因型与水分互作项的双因子广义线性模型。在准确校正了由于干旱导致的 RNA 提取率差异后，高置信度鉴定了 1,842 个响应干旱的核心转录因子，关键候选基因通过 qRT-PCR 获得了高度吻合的实验验证；
- **分析工具流转与边界界定**：
  - **上游工具链**：原始测序 reads 经 fastp 质控后，由 Salmon 或 kallisto 完成转录本水平伪比对与绝对分子估计，再通过 `tximport` 导入 DESeq2；
  - **下游分析承接**：DESeq2 输出的标准化计数矩阵（通过 `vst` 或 `rlog` 变换实现方差稳定化）是 WGCNA 共表达网络构建、GENIE3/GRNBoost2 调控网络推断以及 MOFA+ 多组学整合的标准输入。
