---
title: DSS
name: DSS
summary: 基于贝叶斯 Beta-二项层级模型与空间平滑的单碱基差异甲基化位点 (DML) 与区域 (DMR) 鉴定 R 软件包。
dataType: 胞嘧啶甲基化计数表 (chr, pos, N, X) / Bismark 胞嘧啶报告
principle: Beta-二项层级广义线性模型 (Beta-Binomial GLM)、经验贝叶斯局部平滑与 Wald 假设检验
domainIds: [epigenomics-3d-genome]
topicIds: [m07-topic-03]
principleIds: [beta-binomial]
dataIds: [methylation-counts]
paper: dss-paper
repository: https://bioconductor.org/packages/release/bioc/html/DSS.html
version: "2.60.0 (Bioconductor 3.23)"
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在植物逆境生物学、发育表观遗传学与作物驯化表观变异研究中，比对与提取甲基化水平之后的关键科学目标是：**精准鉴定在不同处理条件（如干旱/盐胁迫 vs 对照）、不同组织器官或不同育种材料之间发生显著表观重塑的差异甲基化位点（Differentially Methylated Loci, DML）与差异甲基化区域（Differentially Methylated Regions, DMR）**。

在植物 WGBS 数据分析中，统计检验面临极其严苛的挑战：
1. **生物学重复有限与高过离散（Over-dispersion）**：全基因组测序成本高昂，植物实验通常仅有 2~3 次生物学重复，且田间环境微扰导致重复间的真实生物学方差远大于泊松/二项分布的理论方差；
2. **测序深度极端不均一**：全基因组各胞嘧啶的覆盖深度在 $3\times$ 至 $100\times$ 间剧烈波动。低深度位点极易由于二项抽样误差产生伪差异（例如 $1/2$ 跃迁至 $0/2$ 看似变化 $50\%$，实为极不稳定的抽样噪声）；
3. **空间邻域协同性**：植物启动子与转座子区的甲基化修饰不是单个孤立事件，而是连续物理区间内多个胞嘧啶的协同修饰。

**DSS（Dispersion Shrinkage for Sequencing data）**由埃默里大学著名生物统计学家 Hao Wu 教授实验室开发（Feng et al., *Bioinformatics*, 2014; Wu et al., *Nucleic Acids Research*, 2016）。作为 Bioconductor 平台的殿堂级表观分析软件，DSS 创新性地将**Beta-二项层级分布（Beta-Binomial Hierarchical Model）**与**空间高斯局部加权平滑（Spatial Smoothing）**融为一体。它不仅能科学借用全基因组离散度信息收缩单个位点的过离散参数，而且通过邻域胞嘧啶信息借力平滑，彻底根除了小样本低深度数据中的假阳性毛刺，成为植物差异甲基化鉴定的权威首选工具。

---

## 核心算法数学原理与推导

DSS 的统计模型建立在层级贝叶斯概率论与空间加权回归之上：

### 1. Beta-二项分布层级抽样模型（Beta-Binomial Model）

设在样本 $j$ 的胞嘧啶位点 $i$ 处，测序获得的总覆盖深度为 $N_{ij}$，其中支持甲基化的保留 C reads 计数为 $X_{ij}$。

传统的 Fisher 检验假定 $X_{ij} \sim \text{Binomial}(N_{ij}, p_i)$，忽略了样本间的生物学变异。DSS 引入两层贝叶斯层级架构：
1. **第一层（测序抽样误差）**：给定该样本在该位点的潜在真实甲基化率 $p_{ij}$，观测读段数服从二项分布：
   $$X_{ij} \mid p_{ij} \sim \text{Binomial}\left( N_{ij}, p_{ij} \right)$$
2. **第二层（生物学重复间的过离散）**：由于植物个体间的生理波动，潜在甲基化率 $p_{ij}$ 本身在样本间服从参数为 $(\mu_{ij}, \phi_{ij})$ 的 Beta 先验分布：
   $$p_{ij} \sim \text{Beta}\left( \mu_{ij}, \phi_{ij} \right)$$
   其中 $\mu_{ij} \in (0, 1)$ 为群体平均甲基化率水平，$\phi_{ij} > 0$ 为离散度参数（Dispersion Parameter）。

边缘复合分布即为经典的 Beta-二项分布，其方差表达式为：

$$\text{Var}(X_{ij}) = N_{ij} \mu_{ij} (1 - \mu_{ij}) \left[ 1 + (N_{ij} - 1) \frac{\phi_{ij}}{1 + \phi_{ij}} \right]$$

当离散度 $\phi_{ij} = 0$ 时，模型完全退化为无生物学变异的简单二项分布；当 $\phi_{ij} > 0$ 时，括号中的膨胀因子弹性吸收了植物样本间的生物学异质性，避免了经典方法将生物学正常波动误判为极显著差异的通病。

### 2. 局部空间核平滑（Spatial Moving Average Smoothing）

在真实植物基因组中，染色体上物理邻近的胞嘧啶往往受同一染色质重塑复合物协同调控。DSS 在参数 `smoothing = TRUE` 时，利用高斯核函数对局部窗口内的位点进行加权平滑：

$$\hat{\mu}_i^{\text{smooth}} = \frac{\sum_{k} K\left( \frac{d_{ik}}{h} \right) N_{kj} \hat{\mu}_{kj}}{\sum_{k} K\left( \frac{d_{ik}}{h} \right) N_{kj}}$$

- $d_{ik}$ 为位点 $i$ 与位点 $k$ 之间的物理距离；
- $h$ 为平滑带宽（默认在数百 bp 范围内衰减）。
通过空间借力，某个覆盖深度较低（如 $4\times$）的胞嘧啶位点，能够从其紧密相邻的高深度位点处获得坚实的先验信息支撑，统计检验效力获得大幅飞跃。

### 3. Wald 假设检验与连续 DMR 区域聚合

- **单碱基 DML 检验**：在完成参数收缩后，构建两组比较的 Wald 检验统计量：
  $$W_i = \frac{\hat{\mu}_{1i} - \hat{\mu}_{2i}}{\sqrt{\widehat{\text{Var}}(\hat{\mu}_{1i}) + \widehat{\text{Var}}(\hat{\mu}_{2i})}} \sim \mathcal{N}(0, 1)$$
  计算双侧检验 $p$ 值并经 Benjamini-Hochberg 调整为全基因组 FDR；
- **DMR 区域聚合**：`callDMR` 函数在染色体物理坐标上滑动，将满足以下条件的连续区段合并为 DMR：
  1. 区域内包含足够数量的胞嘧啶位点（如 $\text{minCG} \ge 4$）；
  2. 区域内平均甲基化水平绝对差异超过生物学阈值（如 $|\Delta\mu| \ge 0.1$）；
  3. 相邻显著 DML 之间的物理距离小于设定间距（如 $\text{dis.merge} \le 100\text{ bp}$）。

---

## 生产环境标准流水线

以下展示利用 DSS 读取 Bismark 输出的胞嘧啶报告、分类针对植物 CG/CHG/CHH 上下文执行空间平滑差异分析并导出 DMR 表格的标准 R 脚本：

```r
library(DSS)
library(bsseq)

# 步骤 1：读取两组样本 (例如 Control_rep1/2 vs Treatment_rep1/2) 的胞嘧啶矩阵
# 矩阵格式包含 4 列：chr, pos, N (总深度), X (甲基化计数)
ctrl1 <- read.table("ctrl_rep1.bismark.cov", header = FALSE, col.names = c("chr", "pos", "end", "pct", "X", "unmeth"))
ctrl1$N <- ctrl1$X + ctrl1$unmeth
ctrl1_clean <- ctrl1[, c("chr", "pos", "N", "X")]

# 组合构建 bsseq 对象
BSobj <- makeBSseqData(
  list(ctrl1_clean, ctrl2_clean, treat1_clean, treat2_clean),
  sampleNames = c("C1", "C2", "T1", "T2")
)

# 步骤 2：执行 Beta-二项经验贝叶斯检验与空间高斯平滑
# 注意：植物中 CG 与非 CG 上下文必须分步运行
dmlTest <- DMLtest(
  BSobj,
  group1 = c("C1", "C2"),
  group2 = c("T1", "T2"),
  smoothing = TRUE,
  smoothing.span = 200 # 平滑物理窗口 200 bp
)

# 步骤 3：提取显著差异甲基化单碱基位点 (DML)
dmls <- callDML(dmlTest, p.threshold = 0.001)
head(dmls)

# 步骤 4：在全基因组尺度聚合差异甲基化区域 (DMR)
# 要求区域内至少含 4 个 CG 位点，平均甲基化绝对差异 >= 0.15
dmrs <- callDMR(
  dmlTest,
  p.threshold = 0.05,
  delta = 0.15,
  minlen = 50,
  minCG = 4,
  dis.merge = 100
)

# 步骤 5：导出差异区域表格以供与基因启动子和转座子做重叠富集分析
write.table(dmrs, "results/treatment_vs_ctrl_DMR.tsv", sep = "\t", quote = FALSE, row.names = FALSE)
```

---

## 核心参数科学解析与植物调优指南

| 参数指令 | 推荐取值 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `smoothing = TRUE` | **强烈建议开启** | **启用空间高斯平滑**；利用邻近胞嘧啶相关性消除测序噪音；对于低深度 WGBS 数据能够成倍提高检测灵敏度。 |
| `smoothing.span` | `100` ~ `300` (bp) | **空间平滑物理跨度**；植物基因启动子通常在数百 bp 内，平滑跨度不宜超过 500 bp，防止平滑跨界抹平局部的尖锐边界。 |
| `delta` | `0.1` ~ `0.2` | **甲基化差值生物学截断**；$|\mu_1 - \mu_2| \ge \delta$；仅统计学显著但绝对变化只有 2% 的微小位点通常无转录调控意义，推荐设置 0.15。 |
| `minCG` | `3` ~ `5` | **DMR 内最少胞嘧啶数**；植物全基因组中偶然单点突变频发，要求至少包含 4 个协同变化的位点可大幅压缩假阳性。 |
| `dis.merge` | `50` ~ `100` (bp) | **连续位点合并最大距离**；若两相邻显著位点间距小于该值，则合并为一个连续 DMR，避免碎裂。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 严禁混合分析 CG、CHG 与 CHH 上下文！
- **机制与风险**：这是植物表观生信分析中最致命、最常见的“新手陷阱”。
- **原因剖析**：
  - 植物基因组中，CG 甲基化的全局背景平均值通常在 70%~90% 之间；
  - CHG 甲基化平均值在 30%~60% 之间；
  - 而非对称性 CHH 甲基化平均值通常仅有 2%~5%！
- **严重后果**：若将包含 CG、CHG、CHH 的全部胞嘧啶混合输入同一个 DSS 对象并开启空间平滑（`smoothing = TRUE`），**算法会把物理位置相邻但生化机制完全不同的高甲基化 CG 与低甲基化 CHH 进行跨上下文混合平均，导致统计模型彻底崩溃失真！**
- **科学准则**：**必须先按序列模式将数据严格切分为三个独立子集（纯 CG 集、纯 CHG 集、纯 CHH 集），分别独立运行 DSS 检验**。

---

## 植物应用案例与真实文献证据

1. **水稻盐胁迫应答中的组织特异性差异甲基化区域解析**：
   在亚洲栽培稻耐盐机理表观调控研究中，研究人员利用 DSS 对盐胁迫处理前后水稻根系与叶片组织的单碱基甲基化数据进行了系统性 DML 与 DMR 扫描。通过结合空间平滑算法（`smoothing.span = 200`）与绝对差值过滤（`delta = 0.2`），成功在水稻耐盐离子转运蛋白（*HKT* 家族及 *NHX* 家族）的启动子区域鉴定了数个因逆境诱导而发生显著去甲基化的特异性 DMR，阐明了表观重塑激活耐盐基因转录的分子通路。

---

## 实践排错与质控规范

- **错误 1：`makeBSseqData` 报内存耗尽（Out of Memory）**
  - *排查原因*：输入的文本数据过大（包含全基因组数千万个未过滤胞嘧啶位点）。
  - *解决方案*：在读入 R 之前，先利用 Shell/Awk 过滤掉全基因组覆盖深度过低（例如所有样本总深度 $< 5\times$）的无效位点，大幅压缩输入规模。
- **错误 2：`callDMR` 输出为空（0 rows returned）**
  - *排查原因*：设置的 `p.threshold` 过严（如设成了 `1e-5`）或 `minCG` 要求过高。
  - *解决方案*：在 `callDMR` 中将 `p.threshold` 适当放宽至 0.01~0.05，并依赖 `delta = 0.1` 生物学差值进行核心截断。
