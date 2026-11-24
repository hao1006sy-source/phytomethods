---
title: 测序技术与原始数据特征
summary: 深度解析 Lander-Waterman 测序统计学模型、PacBio CCS 环形共识误差衰减推导、ONT 纳米孔电流模型与 GenomeScope 杂合度混合分布建模。
domain: genome-assembly
methods: [hifiasm, verkko, merqury]
updatedAt: 2026-11-25
---

## 测序技术的物理原理与数据特征图谱

从物理化学信号到数字化生物信息，测序技术是基因组学的核心数据引擎。对于植物基因组学而言，植物组织中普遍富含多糖多酚、次生代谢产物以及巨大的细胞壁物理屏障，使得高质量大分子量（High Molecular Weight, HMW）DNA 的提取成为所有下游组装的第一道生命线。

现代高通量测序体系形成了三大技术流派的互补格局：

| 测序技术平台 | 物理检测机制 | 平均读长特征 | 单分子原始准确率 | 典型测序误差特征 | 组装中的核心生态位 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Illumina 短读段** | 可逆终止子边合成边测序 (SBS) | 150~300 bp | 极高 (Q30~Q40, >99.9%) | 主要是替换错误 (Substitution) | $k$-mer 基因组勘测、短变异质控、最终抛光 |
| **PacBio HiFi** | 单分子实时荧光 (SMRT) + 环形共识 (CCS) | 15~25 kb | 极高 (≥Q30, 99.9%) | 偶发同聚物单碱基微小 InDel | 组装骨架构建、杂合气泡解析、单倍型分相 |
| **ONT 纳米孔测序** | 蛋白孔电导电流阻断 (pA 阻抗) | 20 kb ~ 100+ kb (Ultra-long) | 中等至高 (Q20~Q28) | 同聚物连续单碱基缺失/插入 | 跨越巨型串联重复、着丝粒/rDNA 闭合 |

---

## 测序深度与覆盖统计学：Lander-Waterman 模型

1988 年，Eric Lander 与 Michael Waterman 建立了基因组物理作图与测序覆盖度的经典数学理论。该理论揭示了随机独立采样条件下，测序深度与基因组缺口（Gaps）产生率的根本关系。

### 1. 泊松覆盖分布与测序间隙概率

设目标单倍体基因组长度为 $G$，测序获得的有效读段总数为 $N$，读段平均长度为 $L$。名义测序深度（Sequencing Depth）定义为：

$$C = \frac{N \cdot L}{G}$$

若假设读段在全基因组上的分布相互独立且服从均匀泊松过程（Poisson Process），则基因组上任意给定单碱基位置被恰好 $k$ 条独立读段覆盖的概率为：

$$P(X = k) = \frac{e^{-C} C^k}{k!}$$

由此可推导出，基因组上未被任何读段覆盖的物理缺口碱基比例（即覆盖度为 0 的概率）为：

$$P(X = 0) = e^{-C}$$

根据这一指数衰减关系：
- 当测序深度 $C = 10\times$ 时，未覆盖比例 $P(X=0) = e^{-10} \approx 4.54 \times 10^{-5}$（对于 1 Gb 植物基因组，将残留约 45.4 kb 的空白缺口）；
- 当测序深度提升至 $C = 30\times$ 时，$P(X=0) = e^{-30} \approx 9.36 \times 10^{-14}$，全基因组随机未覆盖缺口在理论上被完全消除。

### 2. 最小重叠约束下的物理 Contig 期望数量

在实际从头组装中，两条相邻读段要被组装算法可靠检测为相连，其重叠区段长度必须达到设定的最小阈值 $\theta$（重叠比例为 $\sigma = \theta / L$）。在此约束下，组装产生的理论独立 Contig 期望数量为：

$$E(N_{\text{contigs}}) \approx N \cdot e^{-C(1 - \theta/L)}$$

该公式数学阐明了读长跃升的颠覆性价值：当使用短读段测序（$L = 150\text{ bp}$，$\theta = 100\text{ bp}$）时，$1 - \theta/L = 0.333$，需依赖极高的数据量才能连通；而当采用长读段测序（如 PacBio HiFi，$L = 15,000\text{ bp}$，$\theta = 1,000\text{ bp}$）时，$1 - \theta/L = 0.933$，Contig 期望数量呈指数级骤降，宏观连续性得到质的飞跃。

---

## PacBio CCS 环形共识误差消除数学推导

PacBio 单分子实时测序在单次读取（Subread）时存在约 $10\% \sim 15\%$ 的随机单分子误差。HiFi（High-Fidelity）技术的突破，源于发夹接头与多次环形共识的统计学纠错机制：

1. **SMRTbell 闭合环形构建**：将双链 DNA 片段两端连接发夹接头，形成闭合单链环状拓扑结构；
2. **聚合酶滚动复制**：高保真 DNA 聚合酶沿环形分子连续执行多轮完整正反链转录，产生包含若干 Subreads 的超长原始读段。

设单次 Subread 在某位点的测序错误率为 $e_{\text{sub}}$。由于光学或物理波动引起的误差在各轮 Pass 之间近似呈现随机独立分布，对经过 $N_{\text{pass}}$ 次环绕读取的同一碱基位点执行多数表决（Majority voting），共识碱基出错的概率服从二项累加分布：

$$e_{\text{CCS}} \approx \sum_{j = \lfloor N_{\text{pass}}/2 \rfloor + 1}^{N_{\text{pass}}} \binom{N_{\text{pass}}}{j} e_{\text{sub}}^j (1 - e_{\text{sub}})^{N_{\text{pass}} - j} \approx \binom{N_{\text{pass}}}{\lfloor N_{\text{pass}}/2 \rfloor + 1} e_{\text{sub}}^{\lfloor N_{\text{pass}}/2 \rfloor + 1}$$

- 当平均环绕次数 $N_{\text{pass}} \ge 10 \sim 12$ 次时，即便单次 Pass 错误率高达 $10\%$，$e_{\text{CCS}}$ 亦会以超几何级数被压制至 $10^{-3} \sim 10^{-4}$ 以下；
- 从而在长达 15~25 kb 的单分子片段上，同时兼备了短读段级别的单碱基精度（$\ge Q30 \sim Q40$）。

---

## 基因组测前勘测：GenomeScope 2.0 频率谱数学建模

在对任何未知植物开展大规模长读段测序与组装前，必须通过低成本短读段测序提取全局 $k$-mer 频数分布，进行基因组特征勘测。Vurture 等人开发的 **GenomeScope 2.0** 将 $k$-mer 频率谱建模为混合概率分布模型：

设真实基因组单倍体大小为 $G$，测序 $k$-mer 主峰平均深度为 $\lambda$。在二倍体杂合植物中：

$$f(x) = \alpha \cdot \text{NB}\left(x; \frac{\lambda}{2}, \rho\right) + (1 - \alpha) \cdot \text{NB}(x; \lambda, \rho) + \text{Error}(x)$$

其中：
- $\text{NB}(x; \mu, \rho)$ 为均值为 $\mu$、离散参数为 $\rho$ 的负二项分布（Negative Binomial Distribution）；
- $\alpha$ 为杂合峰权重占比，对应杂合多态性位点产生的单倍型特异 $k$-mer；
- 杂合度失配率（Heterozygosity Rate $r_{\text{het}}$）可严格反演为：

$$r_{\text{het}} \approx \frac{\alpha}{k \cdot (2 - \alpha)}$$

- 全基因组重复序列比例（Repeat Content）则由深度大于 $1.5\lambda$ 区域的积分面积占总面积的比例精确计算得出。

---

## 参考文献与数据来源

1. **Lander ES, Waterman MS.** (1988). Genomic mapping by partial digestion, random clones, libraries, and interrupted mapping: Theoretical considerations. *Genomics*, 2(3), 231–239. DOI: [10.1016/0888-7543(88)90007-9](https://doi.org/10.1016/0888-7543(88)90007-9)
2. **Wenger AM, Peluso P, Rowell WJ, et al.** (2019). Accurate circular consensus long-read sequencing improves variant detection and assembly of a human genome. *Nature Biotechnology*, 37(10), 1155–1162. DOI: [10.1038/s41587-019-0217-9](https://doi.org/10.1038/s41587-019-0217-9)
3. **Ranallo-Benavidez TR, Jaron KS, Schatz MC.** (2020). GenomeScope 2.0 and Smudgeplot for reference-free profiling of polyploid genomes. *Nature Communications*, 11(1), 1432. DOI: [10.1038/s41467-020-14998-3](https://doi.org/10.1038/s41467-020-14998-3)
4. **Jain M, Koren S, Miga KH, et al.** (2018). Nanopore sequencing and assembly of a human genome with ultra-long reads. *Nature Biotechnology*, 36(4), 338–345. DOI: [10.1038/nbt.4060](https://doi.org/10.1038/nbt.4060)
